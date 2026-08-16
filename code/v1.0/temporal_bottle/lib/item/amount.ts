import { world, ItemStack } from "@minecraft/server"
import { apiNumbers } from "../math/numbers"

export const apiItemAmount = new class ApiItemAmount {
  increase(item: ItemStack | string, amount = 1): ItemStack | false {
    if(typeof item == "string"){
      const newItem = new ItemStack(item)
      if(apiNumbers.isOutRange(amount, 1, newItem.maxAmount)) return false
      newItem.amount = amount
      return newItem
    }

    if(apiNumbers.isOutRange(item.amount + amount, 1, item.maxAmount)) return false
    item.amount += amount
    return item
  }

  decrease(item: ItemStack, amount = 1): ItemStack | undefined {
    if(item.amount -1 < 1) return undefined
    item.amount -= amount
    return item
  }
}