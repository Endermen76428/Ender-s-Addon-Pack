import { world, ItemStack, Container } from "@minecraft/server"

export const apiInventory = new class apiInventory {
  getItems(inv: Container, ids?: string | string[]): ItemSlot[] {
    const items: ItemSlot[] = []
    for(let i = 0; i < inv.size; i++){
      const slot = inv.getItem(i)
      if(!slot || slot.keepOnDeath == true) continue
      if(!ids){ items.push({item: slot, slot: i}); continue }
      if(ids.includes(slot.typeId)) items.push({item: slot, slot: i})
    }
    return items
  }

  dropInventory(id: string): void {
    const entity = world.getEntity(id)
    if(!entity) return
    const inv = entity.getComponent("inventory")?.container
    if(!inv) return
    for(let i = 0; i < inv.size; i++){
      const item = inv.getItem(i)
      if(item) entity.dimension.spawnItem(item, entity.location)
    }
    entity.remove()
    return
  }

  setItem(playerInv: Container, item: ItemStack | undefined, slot: number): void {
    if(slot > playerInv.size) return
    playerInv.setItem(slot, item)
  }

  decrementItem(playerInv: Container, item: ItemStack, slot: number, reduce = 1): void {
    if(item.amount - reduce <= 0) return this.setItem(playerInv, undefined, slot)

    item.amount -= reduce
    this.setItem(playerInv, item, slot)
  }
}

interface ItemSlot {
  item: ItemStack,
  slot: number
}