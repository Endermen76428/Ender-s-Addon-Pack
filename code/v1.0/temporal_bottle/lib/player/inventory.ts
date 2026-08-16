import { world, ItemStack, Entity, Container, EntityComponentTypes } from "@minecraft/server"

export const apiInventory = new class apiInventory {
  addItem(entity: Entity, itemId: string | ItemStack, amount = 1): void {
    const inventory = entity.getComponent(EntityComponentTypes.Inventory)?.container
    if(!inventory) return

    inventory.addItem(itemId instanceof ItemStack ? itemId : new ItemStack(itemId, amount))
  }

  setItem(entity: Entity, item: ItemStack | undefined, slot: number): void {
    const inventory = entity.getComponent(EntityComponentTypes.Inventory)?.container
    if(!inventory) return

    if(slot > inventory.size) return
    inventory.setItem(slot, item)
  }

  getItem(entity: Entity, itemId?: string): ItemSlot | undefined {
    const inventory = entity.getComponent(EntityComponentTypes.Inventory)?.container
    if(!inventory) return

    for(let slot = 0; slot < inventory.size; slot++){
      const item = inventory.getItem(slot)
      if(item == undefined) continue
      if(itemId == undefined) return { item, slot }
      if(item.typeId == itemId) return { item, slot }
    }
    return
  }

  getItemSlot(entity: Entity, slot: number): ItemStack | undefined {
    const inventory = entity.getComponent(EntityComponentTypes.Inventory)?.container
    if(!inventory) return

    return inventory.getItem(slot)
  }
}

interface ItemSlot {
  item: ItemStack,
  slot: number
}