import { apiInventory } from "../lib/player/inventory"
import { world } from "@minecraft/server"

world.afterEvents.entityHitEntity.subscribe(({hitEntity: entity}) => {
  if(entity.typeId == "gravestone_death_path:ghost"){ entity.triggerEvent("gravestone_death_path:despawn_ghost") }
  if(entity.typeId == "gravestone_death_path:gravestone_entity"){ apiInventory.dropInventory(entity.id) }
})