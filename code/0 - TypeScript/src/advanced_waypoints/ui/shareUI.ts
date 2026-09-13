import { ActionFormData, MessageFormData } from "@minecraft/server-ui"
import { waypointsInfo } from "../lib/waypoints/info/general"
import { Player, world } from "@minecraft/server"
import { apiConfig } from "../lib/player/config"
import { iconPathId } from "../lib/variables"
import { apiVec3 } from "../lib/math/vector"
import { apiWarn } from "../../0-lib/player/warn"
import { waypointsShare } from "../lib/waypoints/info/share"

export function waypointUIShare(player: Player): void {
  const allPlayers = world.getPlayers({excludeNames: [player.nameTag]})
  if(allPlayers.length < 1) return apiWarn.notify(player, "warn.advanced_waypoints:noPlayersOnline", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})

  const allPoints = waypointsInfo.getAll(player)
  if(allPoints.length < 1) return apiWarn.notify(player, "warn.advanced_waypoints:dontHavePoints", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})

  const config = apiConfig.get(player)

  // Select the waypoint
  const form1 = new ActionFormData()
  .title("ui.advanced_waypoints:config.button.share")
  .body("ui.advanced_waypoints:share.waypoints")
  allPoints.forEach(button => { form1.button(`${button.name}${config.pos ? `\n${apiVec3.formatColored(button.pos)}` : ""}`, `textures/advanced_waypoints/ui/${iconPathId[button.icon]}_${button.visible}`) })
  form1.show(player).then(({canceled, selection}) => {
    if(canceled || selection == undefined) return apiWarn.notify(player, "warn.advanced_waypoints:dontShared", {type: "actionbar"})

    const point = allPoints[selection]
    if(!point) return

    // Select the player to recive
    const form2 = new ActionFormData()
    .title("ui.advanced_waypoints:config.button.share")
    .body("ui.advanced_waypoints:share.players")
    allPlayers.forEach(player => { form2.button(player.nameTag) })
    form2.show(player).then(({canceled: canceled2, selection: targetIndex}) => {
      if(canceled2 || targetIndex == undefined){
        apiWarn.notify(player, "warn.advanced_waypoints:dontShared", {type: "actionbar", sound: "warn.ender_addon_pack:"})
        return waypointUIShare(player)
      }

      const target = allPlayers[targetIndex]
      if(!target) return

      const targetConfig = apiConfig.get(target)
      if(!targetConfig.share) return apiWarn.notify(player, "warn.advanced_waypoints:targetDontAcceptShare", {sound: "warn.ender_addon_pack:break"})

      // Confirm the sharing
      new MessageFormData()
      .title("ui.advanced_waypoints:config.button.share")
      .body({translate: "ui.advanced_waypoints:share.confirm.body", with: [point.name, target.nameTag]})
      .button1("ui.advanced_waypoints:yes")
      .button2("ui.advanced_waypoints:no")
      .show(player).then(({canceled: canceled3, selection: confirm}) => {
        if(canceled3 || confirm == 1) return apiWarn.notify(player, "warn.advanced_waypoints:dontShared", {type: "actionbar"})

        waypointsShare.share(player, target, point)
        return waypointUIShare(player)
      })
    })
  })
}