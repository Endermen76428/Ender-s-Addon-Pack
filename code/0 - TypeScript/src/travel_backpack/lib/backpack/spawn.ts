import { Entity, EntityComponentTypes, Player } from "@minecraft/server"
import { backpackSizeFill, lockSlotItem } from "../variables"
import { getBackpackTier } from "./tier"

export function spawnBackpack(player: Player, itemId: string): Entity {
  let inventoryTier = getBackpackTier(itemId)
  const entity = player.dimension.spawnEntity("travel_backpack:backpack", player.location, {spawnEvent: `travel_backpack:inventory${inventoryTier}`})
  entity.nameTag = `ui.travel_backpack:backpack.size.${inventoryTier}`

  entity.addTag(`travel_backpack:${player.id}`)

  const inventory = entity.getComponent(EntityComponentTypes.Inventory)?.container
  if(!inventory) return entity

  const fillStart = backpackSizeFill[inventoryTier]
  if(!fillStart) return entity

  for(let i = fillStart, len = inventory.size; i < len; i++){
    inventory.setItem(i, lockSlotItem)
  }

  return entity
}