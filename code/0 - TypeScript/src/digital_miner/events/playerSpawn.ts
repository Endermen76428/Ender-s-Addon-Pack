import { apiInventory } from "../lib/entity/inventory"
import { world } from "@minecraft/server"

world.afterEvents.playerSpawn.subscribe(({player, initialSpawn}) => {
  if(!initialSpawn) return

  if(!player.hasTag("digital_miner:starter")){
    apiInventory.addItem(player, "digital_miner:guidebook")
    player.addTag("digital_miner:starter")
  }
})