import { apiInventory } from "../lib/player/inventory"
import { world, system } from "@minecraft/server"

world.beforeEvents.playerInteractWithEntity.subscribe(({target: entity}) => {
  if(entity.typeId == "gravestone_death_path:ghost"){ system.run(() => { entity.triggerEvent("gravestone_death_path:despawn_ghost") }) }
  if(entity.typeId == "gravestone_death_path:gravestone_entity"){ system.run(() => { apiInventory.dropInventory(entity.id) })}
})