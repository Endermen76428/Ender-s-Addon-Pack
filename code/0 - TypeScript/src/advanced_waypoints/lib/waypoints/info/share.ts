import { apiScoreboard } from "../../../../0-lib/math/scoreboard"
import { apiNumbers } from "../../../../0-lib/math/numbers"
import { apiWarn } from "../../../../0-lib/player/warn"
import { WaypointsInfo } from "../../variables"
import { apiWaypointCreate } from "./create"
import { Player } from "@minecraft/server"

export const waypointsShare = new class ApiWaypointShare {
  share(player: Player, target: Player, info: WaypointsInfo): void {
    if(!target.isValid) return apiWarn.notify(player, "warn.advanced_waypoints:playerOffline", {sound: "warn.ender_addon_pack:break"})

    if(this.hasOnList(player, target.nameTag, info)) return apiWarn.notify(player, {translate: "warn.advanced_waypoints:alreadySent", with: [info.name]}, {sound: "warn.ender_addon_pack:bass"})

    apiWaypointCreate.create(target, {name: info.name, pos: info.pos, color: info.color, icon: apiNumbers.clamp(info.icon -25, 0, 99), turnOff: info.turnOffClose}, player.nameTag, true)
  }

  private hasOnList(player: Player, targetName: string, info: WaypointsInfo): boolean {
    const scoreID = `advanced_waypoints/${player.id}/${info.dimension.replace("minecraft:", "")}/${info.name}`
    if(apiScoreboard.hasParticipant(scoreID, `S/${targetName}`)) return true

    apiScoreboard.setScore(scoreID, `S/${targetName}`, 0)
    return false
  }

  removeFromList(player: Player, name: string): void {
    const score = apiScoreboard.getObj(`advanced_waypoints:${player.nameTag}`)
    for(const participant of score.getParticipants().filter(value => value.displayName.endsWith(name))){
      score.removeParticipant(participant)
    }
  }
}