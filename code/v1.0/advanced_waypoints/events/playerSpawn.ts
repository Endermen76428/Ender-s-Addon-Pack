import { playersEntity } from "../functions/locator"
import { backwardCompatibilityPlayer } from "../lib/backwardCompatibility"
import { waypointsEntity } from "../lib/waypoints/entity/entity"
import { apiWaypointsCache } from "../lib/waypoints/info/cache"
import { world, system } from "@minecraft/server"

world.afterEvents.playerSpawn.subscribe(({initialSpawn, player}) => {
  if(initialSpawn){
    playersEntity.set(player.id, player)
    if(!player.getDynamicProperty("aw:7.0")) return backwardCompatibilityPlayer.convert_v7_0(player)
    if(!player.getDynamicProperty("aw:8.0")) return backwardCompatibilityPlayer.convert_v8_0(player)

    if(player.getDynamicProperty("aw:8.0")) apiWaypointsCache.load(player)
  }

  system.runTimeout(() => {
    waypointsEntity.recoverWaypoints(player)
  }, 20 * 5)
})