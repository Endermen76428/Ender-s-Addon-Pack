import { WaypointLocatorManager } from "../lib/waypoints/entity/manager"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { waypointsEntity } from "../lib/waypoints/entity/entity"
import { waypointsInfo } from "../lib/waypoints/info/general"
import { LocatorWaypointsList } from "../functions/locator"
import { world, Player } from "@minecraft/server"
import { apiConfig } from "../lib/player/config"
import { waypointsUICreate } from "./createUI"
import { iconPathId } from "../lib/variables"
import { apiVec3 } from "../lib/math/vector"
import { apiWarn } from "../../0-lib/player/warn"

export function waypointsUIEdit(player: Player): void {
  const waypoints = waypointsInfo.getAll(player)
  if(waypoints.length < 1) return apiWarn.notify(player, "warn.advanced_waypoints:dontHavePoints", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})

  const config = apiConfig.get(player)
  const buttons = waypoints.map(way => ({id: config.pos ? `${way.name.slice(0, 21)}${way.name.length > 21 ? "..." : ""}` : way.name, icon: way.icon, visible: way.visible, pos: way.pos}))

  const form = new ActionFormData()
  .title("ui.advanced_waypoints:edit.title")
  .button("ui.advanced_waypoints:edit.visible", "textures/advanced_waypoints/ui/hide_true")
  buttons.forEach(button => {
    form.button(`${button.id}${config.pos ? `\n${apiVec3.formatColored(button.pos)}` : ""}`, `textures/advanced_waypoints/ui/${iconPathId[button.icon]}_${button.visible}`)
  })
  form.show(player).then(r => {
    if(r.canceled || r.selection == undefined) return

    if(r.selection == 0) return waypointsUIVisible(player)

    const point = waypoints[r.selection -1]
    if(point == undefined) return

    return waypointsUICreate(player, point)
  })
}

function waypointsUIVisible(player: Player): void {
  const waypoints = waypointsInfo.getAll(player)
  const config = apiConfig.get(player)

  const form = new ModalFormData()
  .title("ui.advanced_waypoints:edit.visible")
  waypoints.forEach(button => form.toggle(`${button.name}${config.pos ? ` - ${apiVec3.formatColored(button.pos)}` : ""}`, {defaultValue: button.visible}))
  form.submitButton("ui.advanced_waypoints:create.button_save")
  .show(player).then(({canceled, formValues}) => {
    if(canceled || formValues == undefined) return

    let amountVisible = 0
    for(const value of formValues){
      if(amountVisible >= 10){
        apiWarn.notify(player, "warn.advanced_waypoints:manyWaypoints", {sound: "warn.ender_addon_pack:pop"})
        break
      }
      if(value == true) amountVisible++
    }

    const locatorList = LocatorWaypointsList.get(player.id) ?? new Map<string, WaypointLocatorManager>()

    for(let i = 0; i < formValues.length; i++){
      const visibility = formValues[i]
      if(typeof visibility != "boolean") continue

      const info = waypoints[i]
      if(!info) continue

      if(info.visible == visibility) continue

      waypointsEntity.remove(player, info.name)

      info.visible = !info.visible
      waypointsInfo.set(player, info)

      if(visibility){
        waypointsEntity.spawn(player, info, true)
      } else {
        locatorList.delete(info.name)
      }
    }

    LocatorWaypointsList.set(player.id, locatorList)
  })
}