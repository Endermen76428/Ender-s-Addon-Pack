import { WaypointLocatorManager } from "../lib/waypoints/entity/manager"
import { world, system, Player, Vector3 } from "@minecraft/server"
import { Variables } from "../lib/variables"

export const LocatorWaypointsList = new Map<string, Map<string, WaypointLocatorManager>>() // Player Id > Waypoint Name > Waypoint Class
export const forceUpdateList = new Set<string>() // Player Id

const minDistanceMoved = 3 * 3 // 3 blocks squared
const playerLastPos = new Map<string, Vector3>() // Player Id > Last Position
export const playersEntity = new Map<string, Player>() // Player Id > Player Entity

system.runInterval(() => {
  for(const [playerId, waypointList] of LocatorWaypointsList.entries()){
    if(!playersEntity.has(playerId)){ removeFromList(playerId); continue }

    const player = playersEntity.get(playerId)
    if(!player || !player.isValid){ removeFromList(playerId); continue }

    if(forceUpdateList.has(playerId)){
      for(const waypoint of waypointList.values()){
        if(waypoint.forceUpdate) waypoint.update()
      }
      forceUpdateList.delete(playerId)
      return
    }

    // const amount = player.dimension.getEntities({type: "advanced_waypoints:waypoint"}).length
    // player instanceof Player && player.onScreenDisplay.setActionBar("Cache: " + waypointList.size + " | entity: " + (amount > waypointList.size ? "§c" : "§a") + amount)

    const lastPos = playerLastPos.get(playerId) ?? {x: 0, y: 1024, z: 0}
    const disX = player.location.x - lastPos.x
    const disY = player.location.y - lastPos.y
    const disZ = player.location.z - lastPos.z

    if((disX * disX) + (disY * disY) + (disZ * disZ) < minDistanceMoved) continue

    playerLastPos.set(playerId, player.location)
    for(const waypoint of waypointList.values()) waypoint.update(disX, disZ)
  }
}, Variables.updateRate)

function removeFromList(playerId: string): void {
  for(const entity of LocatorWaypointsList.get(playerId)?.values() ?? []) entity.despawn()
  LocatorWaypointsList.delete(playerId)
  playerLastPos.delete(playerId)
  playersEntity.delete(playerId)
}