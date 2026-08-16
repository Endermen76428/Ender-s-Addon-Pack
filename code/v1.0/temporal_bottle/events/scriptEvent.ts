import { registerTemporalBottleRecipe } from "../lib/temporalBottle/register/registerHandler"
import { temporalBottleEntity } from "../lib/temporalBottle/entity"
import { world, system, Block, Entity } from "@minecraft/server"

system.afterEvents.scriptEventReceive.subscribe(({id, message, sourceEntity, sourceBlock}) => {
  const execute = scriptEventManager[id]
  if(execute) execute(message, sourceEntity, sourceBlock)
}, {namespaces: ["temporal_bottle", "bedrock_awakening"]})

const scriptEventManager: { [key: string]: (message: string, sourceE?: Entity, sourceB?: Block) => void } = {
  // Bedrock Awakening Compatibility System (BACS)
  "bedrock_awakening:temporal_bottle/register": (message) => {
    registerTemporalBottleRecipe("§5ScriptEvent§r", message)
  },

  // Temporal Bottle
  "temporal_bottle:start_acceleration": (message, sourceE) => {
    if(!sourceE || !sourceE.isValid) return

    temporalBottleEntity.createInterval(sourceE)
  }
}