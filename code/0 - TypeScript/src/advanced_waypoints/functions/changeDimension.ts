import { waypointsEntity } from "../lib/waypoints/entity/entity"
import { world, system } from "@minecraft/server"

world.afterEvents.playerDimensionChange.subscribe(({player: player}) => {
  waypointsEntity.removeAll(player)

  system.runTimeout(() => { waypointsEntity.recoverWaypoints(player) }, 30)
})