import { Container, ItemStack } from "@minecraft/server"

export const backpackOrganize = new class BackpackOrganize {
  alphabetical(inventory: Container, size: number): void {
    const items: ItemStack[] = []
    for(let i = 0; i < size; i++){
      const item = inventory.getItem(i)
      if(item){
        items.push(item)
        inventory.setItem(i, undefined)
      }
    }

    items.sort((a, b) => a.typeId.localeCompare(b.typeId))
    for(let i = 0, len = items.length; i < len; i++){
      const item = items[i]
      if(item) inventory.addItem(item)
    }
  }

  numeric(inventory: Container, size: number): void {
    const items: ItemStack[] = []
    for(let i = 0; i < size; i++){
      const item = inventory.getItem(i)
      if(item){
        items.push(item)
        inventory.setItem(i, undefined)
      }
    }

    items.sort((a, b) => b.amount - a.amount || a.typeId.localeCompare(b.typeId))
    for(let i = 0, len = items.length; i < len; i++){
      const item = items[i]
      if(item) inventory.addItem(item)
    }
  }
}