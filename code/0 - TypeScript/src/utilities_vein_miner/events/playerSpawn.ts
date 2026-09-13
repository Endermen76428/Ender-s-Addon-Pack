import { world } from "@minecraft/server"
import { playersList } from "./runInterval"

world.afterEvents.playerSpawn.subscribe(({initialSpawn, player}) => {
  if(initialSpawn){
    if(player.hasTag("utilities_vein_miner:alwaysShowEdges")) playersList.add(player)
  }
})