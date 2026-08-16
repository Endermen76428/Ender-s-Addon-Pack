import { forceUpdateList, LocatorWaypointsList } from "../../../functions/locator"
import { world, system, Player } from "@minecraft/server"
import { WaypointLocatorManager } from "./manager"
import { WaypointsInfo } from "../../variables"
import { waypointsInfo } from "../info/general"

export const waypointsEntity = new class ApiWaypointEntity {
  spawn(player: Player, info: WaypointsInfo, forceUpdate = false): void {
    if(player.dimension.id != info.dimension) return

    try {
      const entity = player.dimension.spawnEntity("advanced_waypoints:waypoint", {
        x: Math.floor(player.location.x) + 0.5,
        y: Math.floor(player.location.y) + 10.5,
        z: Math.floor(player.location.z) + 0.5
      })
      entity.addTag(`waypointOwner: ${player.id}`)
      entity.addTag(`waypointName: ${info.name}`)

      const waypointList = LocatorWaypointsList.get(player.id) ?? new Map<string, WaypointLocatorManager>()
      waypointList.set(info.name, new WaypointLocatorManager(info, entity, player, forceUpdate))
      LocatorWaypointsList.set(player.id, waypointList)

      forceUpdate && forceUpdateList.add(player.id)

    } catch (e) { system.runTimeout(() => { this.spawn(player, info) }, 20 * 2.5) }
  }

  remove(player: Player, waypoint: string): void {
    const waypointList = LocatorWaypointsList.get(player.id) ?? new Map<string, WaypointLocatorManager>()
    waypointList.delete(waypoint)
    LocatorWaypointsList.set(player.id, waypointList)

    if(typeof waypoint == "string"){
        player.dimension.getEntities({
          type: "advanced_waypoints:waypoint",
          tags: [`waypointName: ${waypoint}`, `waypointOwner: ${player.id}`]
        }).forEach(entity => { entity.isValid && entity.remove() })
      return
    }
  }

  getIcon(index: number, name: string): number {
    if(index > 0) return index +25

    const first = name.trim().slice(0, 1).toLocaleUpperCase().codePointAt(0)
    if(first == undefined || first < 65 || first > 90) return 0

    return first - 65
  }

  removeAll(player: Player, respawn = false): void {
    forceUpdateList.add(player.id)
    LocatorWaypointsList.set(player.id, new Map())
    player.dimension.getEntities({tags: [`waypointOwner: ${player.id}`]}).forEach(way => way.remove())

    if(respawn) waypointsInfo
    .getAll(player)
    .filter(value => value.visible)
    .forEach(waypoint => { waypointsEntity.spawn(player, waypoint, true) })
  }

  recoverWaypoints(player: Player): void {
    this.removeAll(player, true)
  }
}