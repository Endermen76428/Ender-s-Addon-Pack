import { world, Container, Player, EntityComponentTypes, GameMode } from "@minecraft/server"

export const apiInventory = new class ApiInventory {
  getItems(player: Player, items: string[], limit: number): InvetoryItems {
    const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container
    if(!inventory) return { list: [], amount: 0 }

    const list = []
    let amount = 0

    for(let i = 0; i < inventory.size; i++){
      const item = inventory.getItem(i)
      if(!item) continue
      if(items.includes(item.typeId)){
        amount += item.amount
        list.push({slot: i, amount: item.amount})
      }
      if(amount >= limit) break
    }

    return {list: list, amount: amount}
  }

  removeItems(inventory: Container, list: SlotItem[], amount: number): void {
    let missing = amount
    for(const {slot, amount} of list){
      if(missing >= amount){
        inventory.setItem(slot, undefined)
        missing -= amount
      } else {
        const item = inventory.getItem(slot)
        if(!item) return

        item.amount -= missing
        inventory.setItem(slot, item)
        return
      }
    }
  }
}

export interface InvetoryItems {
  list: SlotItem[],
  amount: number
}

type SlotItem = {slot: number, amount: number}