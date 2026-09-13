import { apiScoreboard } from "../../math/scoreboard"
import { world, Player } from "@minecraft/server"
import { WaypointsInfo } from "../../variables"
import { apiWaypointsCache } from "./cache"

export const waypointsInfo = new class ApiWaypointInfo {
  getAll(player: Player): WaypointsInfo[] {
    return [...apiWaypointsCache.getDimension(player).values()].sort((a, b) => {
      if (a.visible !== b.visible) {
        return a.visible ? -1 : 1
      }

      return a.name.localeCompare(b.name)
    })
  }

  getAllName(player: Player, exclude = "\u0000"): string[] {
    return [...apiWaypointsCache.getDimension(player).keys()]
    .sort((a, b) => a.localeCompare(b))
    .filter(value => value != exclude)
  }

  set(player: Player, info: WaypointsInfo): void {
    const scoreInfo = apiScoreboard.getObj(`advanced_waypoints/${player.id}/${info.dimension.replace("minecraft:", "")}/${info.name}`)
    apiScoreboard.setScore(scoreInfo, "visible", info.visible ? 1 : 0)
    apiScoreboard.setScore(scoreInfo, "icon", info.icon)
    apiScoreboard.setScore(scoreInfo, "colorI", info.color)
    apiScoreboard.setScore(scoreInfo, "R", info.rgb.red)
    apiScoreboard.setScore(scoreInfo, "G", info.rgb.green)
    apiScoreboard.setScore(scoreInfo, "B", info.rgb.blue)
    apiScoreboard.setScore(scoreInfo, "X", info.pos.x)
    apiScoreboard.setScore(scoreInfo, "Y", info.pos.y)
    apiScoreboard.setScore(scoreInfo, "Z", info.pos.z)
    apiScoreboard.setScore(scoreInfo, "turnOffClose", info.turnOffClose ? 1 : 0)

    apiWaypointsCache.set(player, info)
  }

  remove(player: Player, name: string): void {
    apiScoreboard.removeObj("advanced_waypoints/" + player.id + "/" + player.dimension.id.replace("minecraft:", "") + "/" + name)
    apiWaypointsCache.remove(player, name)
  }
}