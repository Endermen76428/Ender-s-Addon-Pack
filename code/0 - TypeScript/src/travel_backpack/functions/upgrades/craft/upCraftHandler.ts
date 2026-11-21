import { Container, Entity, ItemStack, system } from "@minecraft/server"
import { craftUpgradeRecipes } from "./recipes"

const craftListenList: { [key: string]: IntervalInfo } = {} // Backpack Id > Interval Info
let amountOfListeners = 0

function startInverval(): void {
  const backpacks = Object.entries(craftListenList)
  const length = backpacks.length
  let invalidPlayers = 0
  amountOfListeners = length

  for(let i = 0; i < length; i++){
    const [ key, info ] = backpacks[i] ?? []
    if(key == undefined || info == undefined) continue
    const { backpack, backpackInv, firstSlot, amount, lastItem, lastMin, lastAmount } = info

    // Remove a backpack da lista quando ela fica inválida
    if(!backpack.isValid){
      invalidPlayers++
      delete craftListenList[key]
      continue
    }

    let craftPattern = ""
    let minAmount = Infinity
    const items: (ItemStack | undefined)[] = Array.from({length: 9})
    // Pegará os 9 slots da Crafting Table para verificar o craft
    for(let i = firstSlot, len = firstSlot +9; i < len; i++){
      const item = backpackInv.getItem(i)
      craftPattern += (item?.typeId ?? "") + (i - firstSlot == 8 ? "" : "/")
      items[i - firstSlot] = item

      if(item != undefined) minAmount = Math.min(minAmount, item.amount)
    }
    minAmount = Math.min(minAmount, amount)

    const currentOutputItem = backpackInv.getItem(firstSlot +10)
    const craft = craftUpgradeRecipes.getResult(backpack, craftPattern, items)
    if(craft){
      if(lastItem && !currentOutputItem){
        // Se havia um item ali mas agora não tem é porque ele foi pego, então decrementa todos os 9 slots
        const decrementAmount = Math.min(lastMin ?? Infinity, minAmount, Math.floor((lastAmount ?? 0) / craft.amount))
        for(let i = firstSlot, len = firstSlot +9; i < len; i++){
          const item = backpackInv.getItem(i)
          if(item){
            if(item.amount > decrementAmount){
              item.amount -= decrementAmount
              backpackInv.setItem(i, item)
            } else backpackInv.setItem(i)
          }
        }

        if(craft.remnant){
          const location = backpack.dimension.getPlayers({location: backpack.location, closest: 1})[0]?.location ?? backpack.location
          for(let i = 0, len = craft.remnant.length; i < len; i++){
            const outputRemnant = craft.remnant[i]
            if(!outputRemnant) continue

            backpack.dimension.spawnItem(new ItemStack(outputRemnant.output, outputRemnant.amount), location)
          }
        }

        delete info.lastItem
      } else if(lastItem == undefined || craft.output != lastItem[0] || amount != lastItem[1] || minAmount != lastMin){
        // Adiciona o item do Craft, a verificação serve somente para não ficar executando varias vezes sem motivo
        const outputItem = new ItemStack(craft.output, craft.amount)
        outputItem.amount = Math.min(outputItem.amount * minAmount, Math.floor(outputItem.maxAmount / craft.amount) * craft.amount)
        backpackInv.setItem(firstSlot +10, outputItem)
        info.lastItem = [craft.output, amount]
        info.lastMin = minAmount
        info.lastAmount = outputItem.amount
      }
    } else {
      // Se o craft não existir, limpar o slot de output
      backpackInv.setItem(firstSlot +10)
      delete info.lastItem
    }
  }

  // Cancela o loop se não tiver mais backpacks
  if(length == invalidPlayers){
    amountOfListeners = 0
    return
  }

  // Reinicia o loop depois de 1 tick
  system.run(() => startInverval())
}

export const craftUpgradeFunctions = new class CraftUpgradeFunctions {
  add(backpack: Entity, backpackInv: Container, firstSlot: number): void {
    const itemCraftAmount = backpackInv.getItem(firstSlot +11)
    let amount = 1
    if(itemCraftAmount == undefined || !itemCraftAmount.hasTag("travel_backpack:craft_amount")){
      backpackInv.setItem(firstSlot +11, new ItemStack("travel_backpack:craft_amount_1"))
    } else {
      amount = craftAmountByItem[itemCraftAmount.typeId] ?? 1
    }

    craftListenList[backpack.id] = { backpack, backpackInv, firstSlot, amount }
    amountOfListeners == 0 && startInverval()
  }

  remove(backpack: Entity): void {
    delete craftListenList[backpack.id]
  }

  updateAmount(backpackId: string, amount: number): void {
    const info = craftListenList[backpackId]
    if(info == undefined) return

    info.amount = amount
  }
}

const craftAmountByItem: { [key: string]: number } = {
  "travel_backpack:craft_amount_1":  1,
  "travel_backpack:craft_amount_2":  2,
  "travel_backpack:craft_amount_4":  4,
  "travel_backpack:craft_amount_8":  8,
  "travel_backpack:craft_amount_16": 16,
  "travel_backpack:craft_amount_32": 32,
  "travel_backpack:craft_amount_64": 64
}

interface IntervalInfo {
  backpack: Entity
  backpackInv: Container
  firstSlot: number
  amount: number
  lastItem?: [string, number] // Item Id, Amount Config
  lastMin?: number // Last Min Amount found
  lastAmount?: number // Last Amount in Craft Slot
}