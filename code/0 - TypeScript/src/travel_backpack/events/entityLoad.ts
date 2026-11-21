import { restartFurnaceFunction } from "../functions/upgrades/furnace/restart"
import { furnaceReloadScore } from "../lib/variables"
import { world } from "@minecraft/server"

world.afterEvents.entityLoad.subscribe(({entity}) => {
  if(entity.isValid && entity.typeId == "travel_backpack:backpack" && entity.dimension.id != "travel_backpack:backpack"){

    if(furnaceReloadScore.hasParticipant(entity.id)){ restartFurnaceFunction(furnaceReloadScore, entity.id) }

    if(entity.hasTag("can_enable_timer") == false && entity.getProperty("travel_backpack:on_ground") == false){
      entity.triggerEvent("travel_backpack:add_timer")
    }
  }
})