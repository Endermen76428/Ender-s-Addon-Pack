import { ActionFormData } from "@minecraft/server-ui"
import { world, Player } from "@minecraft/server"
import { waypointUITeleport } from "./teleportUI"
import { waypointUIOptions } from "./configUI"
import { waypointsUICreate } from "./createUI"
import { waypointsUIRemove } from "./removeUI"
import { Variables } from "../lib/variables"
import { waypointUIShare } from "./shareUI"
import { waypointsUIEdit } from "./editUI"

export function waypointMenu(player: Player, quickCreate?: boolean, normal = true){
  if(quickCreate) return waypointsUIController[1]?.(player)

  const form = new ActionFormData()
  .title("ui.advanced_waypoints:config.title")
  if(Variables.teleportEnabled && !normal) form.button("ui.advanced_waypoints:config.button.teleport", "textures/ui/realmsIcon")
  form.button("ui.advanced_waypoints:config.button.create", "textures/ui/plus")
  .button("ui.advanced_waypoints:config.button.edit", "textures/ui/editIcon")
  .button("ui.advanced_waypoints:config.button.remove", "textures/ui/icon_trash")
  .button("ui.advanced_waypoints:config.button.share", "textures/ui/share_microsoft")
  .button("ui.advanced_waypoints:config.button.options", "textures/ui/settings_glyph_color_2x")
  .show(player).then(r => {
    if(r.canceled || r.selection == undefined) return
    const execute = waypointsUIController[Variables.teleportEnabled && !normal ? r.selection : r.selection +1]
    if(execute) execute(player)
  })
}

const waypointsUIController = new class WaypointsUIController {
  [key: number]: (player: Player) => void

  0(player: Player): void { waypointUITeleport(player) }
  1(player: Player): void { waypointsUICreate(player) }
  2(player: Player): void { waypointsUIEdit(player) }
  3(player: Player): void { waypointsUIRemove(player) }
  4(player: Player): void { waypointUIShare(player) }
  5(player: Player): void { waypointUIOptions(player) }
}