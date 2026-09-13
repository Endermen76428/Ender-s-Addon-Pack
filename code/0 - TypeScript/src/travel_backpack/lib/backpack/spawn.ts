import { world, Entity, EntityComponentTypes, Player } from "@minecraft/server"
import { backpackSizeFill, lockSlotItem } from "../variables"
import { backpackSizeEvent } from "../../functions/place"

export function spawnBackpack(player: Player, itemId: string): Entity {
  const inventorySize = backpackSizeEvent[itemId] ?? 0
  const entity = player.dimension.spawnEntity("travel_backpack:backpack", player.location, {spawnEvent: `travel_backpack:inventory${inventorySize}`})
  entity.nameTag = `ui.travel_backpack:backpack.size.${inventorySize}`

  const inventory = entity.getComponent(EntityComponentTypes.Inventory)?.container
  if(!inventory) return entity

  const fillStart = backpackSizeFill[inventorySize]
  if(!fillStart) return entity

  for(let i = fillStart, len = inventory.size; i < len; i++){
    inventory.setItem(i, lockSlotItem)
  }

  return entity
}