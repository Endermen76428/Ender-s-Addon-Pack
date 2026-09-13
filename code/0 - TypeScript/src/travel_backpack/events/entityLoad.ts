import { restartFurnaceFunction } from "../functions/upgrades/furnace/restart"
import { furnaceReloadScore } from "../lib/variables"
import { world } from "@minecraft/server"

world.afterEvents.entityLoad.subscribe(({entity}) => {
  if(entity.typeId == "travel_backpack:backpack"){

    if(furnaceReloadScore.hasParticipant(entity.id)){ restartFurnaceFunction(furnaceReloadScore, entity.id) }

    if(entity.getProperty("travel_backpack:on_ground") == false){
      entity.triggerEvent("travel_backpack:add_timer")
    }
  }
})