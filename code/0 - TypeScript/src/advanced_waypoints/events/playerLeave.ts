import { playersEntity } from "../functions/locator"
import { apiWaypointsCache } from "../lib/waypoints/info/cache"
import { world } from "@minecraft/server"

world.beforeEvents.playerLeave.subscribe(({player}) => {
  playersEntity.delete(player.id)
  apiWaypointsCache.unload(player)
})