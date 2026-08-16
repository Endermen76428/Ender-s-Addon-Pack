import { world, system, Container, Entity, Player, ItemStack } from "@minecraft/server"
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
    const { backpack, backpackInv, firstSlot, lastItem } = info

    // Remove a backpack da lista quando ela fica inválida
    if(!backpack.isValid){
      invalidPlayers++
      craftListenList[key]
      continue
    }

    let craftPattern = ""
    const items: (ItemStack | undefined)[] = Array.from({length: 9})
    // Pegará os 9 slots da Crafting Table para verificar o craft
    for(let i = firstSlot, len = firstSlot +9; i < len; i++){
      const item = backpackInv.getItem(i)
      craftPattern += (item?.typeId ?? "") + (i - firstSlot == 8 ? "" : "/")
      items[i - firstSlot] = item
    }

    const currentOutputItem = backpackInv.getItem(firstSlot +10)

    const craft = craftUpgradeRecipes.getResult(backpack, craftPattern, items)
    if(craft){
      if(lastItem && !currentOutputItem){
        // Se havia um item ali mas agora não tem é porque ele foi pego, então decrementa todos os 9 slots
        for(let i = firstSlot, len = firstSlot +9; i < len; i++){
          const item = backpackInv.getItem(i)
          if(item){
            if(item.amount > 1){
              item.amount--
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
      } else if(craft.output != lastItem){
        // Adiciona o item do Craft, a verificação serve somente para não ficar executando varias vezes sem motivo
        backpackInv.setItem(firstSlot +10, new ItemStack(craft.output, craft.amount))
        info.lastItem = craft.output
      }
    } else {
      // Se o craft não existir, limpar o slot de output
      backpackInv.setItem(firstSlot +10)
      delete info.lastItem
    }
  }

  // Cancela o loop se não tiver mais jogadores
  if(length == invalidPlayers){
    amountOfListeners = 0
    return
  }

  // Reinicia o loop depois de 1 tick
  system.run(() => startInverval())
}

export const craftUpgradeFunctions = new class CraftUpgradeFunctions {
  add(backpack: Entity, backpackInv: Container, firstSlot: number): void {
    craftListenList[backpack.id] = { backpack, backpackInv, firstSlot: firstSlot +10 }
    amountOfListeners == 0 && startInverval()
  }

  remove(backpack: Entity): void {
    delete craftListenList[backpack.id]
  }
}

interface IntervalInfo {
  backpack: Entity
  backpackInv: Container
  firstSlot: number
  lastItem?: string
}