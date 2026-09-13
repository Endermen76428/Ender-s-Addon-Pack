import { world, Player, GameMode, system } from "@minecraft/server"
import { waypointsEntity } from "../lib/waypoints/entity/entity"
import { waypointsInfo } from "../lib/waypoints/info/general"
import { Variables, iconPathId } from "../lib/variables"
import { ActionFormData } from "@minecraft/server-ui"
import { apiNumbers } from "../../0-lib/math/numbers"
import { apiWarn } from "../../0-lib/player/warn"
import { apiConfig } from "../lib/player/config"
import { apiVec3 } from "../lib/math/vector"


export function waypointUITeleport(player: Player): void {
  const waypoints = waypointsInfo.getAll(player)
  if(waypoints.length < 1) return apiWarn.notify(player, "warn.advanced_waypoints:dontHavePoints", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})

  const config = apiConfig.get(player)
  const buttons = waypoints.map(way => {
    const cost = Variables.costXp ? apiNumbers.calculateCost(player.location, way.pos) : 0
    return {id: `${config.pos ? `${way.name.slice(0, 21)}${way.name.length > 21 ? "..." : ""}` : way.name}${cost > 3 ? " - §l§2" + xpSprite[4] + cost + "§r" : xpSprite[cost]}`, icon: way.icon, visible: way.visible, pos: way.pos, cost: cost}
  })
  const form = new ActionFormData()
  .title("ui.advanced_waypoints:tp.title")
  buttons.forEach(button => { form.button(`${button.id}${config.pos ? `\n${apiVec3.formatColored(button.pos)}` : ""}`, `textures/advanced_waypoints/ui/${iconPathId[button.icon]}_${button.visible}`) })
  form.show(player).then(r => {
    if(r.canceled || r.selection == undefined) return

    const button = buttons[r.selection]
    if(!button) return

    if(player.level < button.cost && player.getGameMode() != GameMode.Creative) return apiWarn.notify(player, "warn.advanced_waypoints:insufficientXp", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})

    const pos = waypoints[r.selection]?.pos
    if(!pos) return

    player.addLevels(-button.cost)
    player.tryTeleport({x: pos.x , y: pos.y, z: pos.z})

    system.runTimeout(() => { waypointsEntity.recoverWaypoints(player) }, 40)
  })
}

const xpSprite = ["", " - \ue701", " - \ue702", " - \ue703", "\ue700"]