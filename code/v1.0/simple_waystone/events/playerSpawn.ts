import { world } from "@minecraft/server"

world.afterEvents.playerSpawn.subscribe(({player, initialSpawn}) => {
  if(initialSpawn) player.removeTag("simple_waystone:teleporter")
})