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
    const itemList: { [key: string]: {amount: number, items: ItemStack[]} } = {}
    for(let i = 0; i < size; i++){
      const item = inventory.getItem(i)
      if(item){
        const itemInfo = itemList[item.typeId]
        if(itemInfo == undefined){
          itemList[item.typeId] = { amount: item.amount, items: [item]}
        } else {
          itemInfo.amount += item.amount
          itemInfo.items.push(item)
        }
        inventory.setItem(i, undefined)
      }
    }

    const sortedItems = Object.entries(itemList).sort((a, b) => b[1].amount - a[1].amount || a[0].localeCompare(b[0]))
    for(let i = 0, len = sortedItems.length; i < len; i++){
      const info = sortedItems[i]
      if(info == undefined) continue

      for(let i2 = 0, len2 = info[1].items.length; i2 < len2; i2++){
        const item = info[1].items[i2]
        if(item != undefined) inventory.addItem(item)
      }
    }
  }
}