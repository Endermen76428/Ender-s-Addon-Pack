import { Block, Entity, EntityComponentTypes, system, world } from "@minecraft/server"
import { backpackSizeTier, dimensionCenter } from "../lib/variables"
import { paintBackpack } from "../functions/paint"

system.afterEvents.scriptEventReceive.subscribe(({id, message, sourceEntity, sourceBlock}) => {
  const exe = scriptEventFunctions[id]
  if(exe) exe(message, sourceEntity, sourceBlock)
}, {namespaces: ["travel_backpack"]})

const scriptEventFunctions: { [key: string]: (message: string, entity?: Entity, block?: Block) => void } = {
  "travel_backpack:return": (message, entity) => {
    if(!entity) return

    const pos = entity.getDynamicProperty("pos")
    if(typeof pos != "object") return

    entity.teleport(pos)
  },

  "travel_backpack:archive": (message, entity) => {
    if(entity?.isValid){
      // console.warn("Arquivado:§a", entity.id, "§r|", entity.dimension.id, "|", JSON.stringify(entity.location))
      entity.triggerEvent("travel_backpack:remove_timer")
      entity.teleport(dimensionCenter, {dimension: world.getDimension("travel_backpack:backpack")})
    }
  },

  "travel_backpack:update_level": (message, entity) => {
    if(!entity) return

    let level = entity.getProperty("travel_backpack:level")
    if(typeof level != "number") return
    if(level == -1){
      const inv = entity.getComponent(EntityComponentTypes.Inventory)?.container
      if(inv == undefined) return

      const tier = backpackSizeTier[inv.size]
      if(tier == undefined) return

      level = tier
      entity.triggerEvent(`travel_backpack:inventory${tier}`)
    }
    entity.nameTag = `ui.travel_backpack:backpack.size.${level}`
  },

  "travel_backpack:paint": (message, entity) => {
    if(!entity) return
    paintBackpack(entity, message)
  }
}