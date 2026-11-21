import { Container, Entity, EntityComponentTypes, EquipmentSlot, ItemComponentTypes, ItemStack, Player, system } from "@minecraft/server"
import { addToGlobalLoop, removeFromGlobalLoop } from "../../../../1-bacs/globalLoop"
import { IFoodInfo, travelBackpackFuncFeed } from "./feedListener"
import { getFoodInfo } from "./foodList"

const feedPatternListenList: { [key: string]: IIntervalInfo } = {} // Backpack Id > Interval Info
let amountOfListeners = 0

function startInverval(): void {
  const backpacks = Object.entries(feedPatternListenList)
  const length = backpacks.length
  let invalidPlayers = 0
  amountOfListeners = length

  for(let i = 0; i < length; i++){
    const [ key, info ] = backpacks[i] ?? []
    if(key == undefined || info == undefined) continue
    const { player, backpack, backpackInv, firstSlot, pattern, slot: playerHand, justOneLoop } = info

    // Remove a backpack da lista quando ela fica inválida
    if(!backpack.isValid){
      invalidPlayers++
      delete feedPatternListenList[key]
      continue
    }

    let currentParttern = ""
    for(let i = 0; i < 9; i++){
      const slot = firstSlot + i
      const item = backpackInv.getItem(slot)
      if(item == undefined){
        currentParttern += ","
        continue
      }

      const foodInfo = getFoodInfo(item)
      if(foodInfo == undefined){
        backpack.dimension.spawnItem(item, backpack.location)
        backpackInv.setItem(slot, undefined)
        continue
      }

      currentParttern += item.typeId + ","
    }

    if(pattern != currentParttern){
      const invComp = player.getComponent(EntityComponentTypes.Inventory)?.container
      if(invComp == undefined) continue

      const item = invComp.getItem(playerHand)
      if(item == undefined || item.getDynamicProperty("id") != backpack.id) continue

      info.pattern = currentParttern

      if(currentParttern == ",,,,,,,,,"){
        player.removeTag("travel_backpack:feed")
        item.setDynamicProperty("pattern", undefined)
        removeFromGlobalLoop("travelBackpackFeedListener")
        travelBackpackFuncFeed.remove(player)
        backpack.removeTag("can_enable_timer")
      } else {
        item.setDynamicProperty("pattern", currentParttern)
        player.addTag("travel_backpack:feed")
        addToGlobalLoop("travelBackpackFeedListener")
        travelBackpackFuncFeed.add(player, currentParttern)
        backpack.addTag("can_enable_timer")
      }
      invComp.setItem(playerHand, item)
    }

    if(justOneLoop){
      delete feedPatternListenList[key]
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

export const feedUpgradeFunctions = new class FeedUpgradeFunctions {
  add(player: Player, backpack: Entity, backpackInv: Container, firstSlot: number, slot: number, justOneLoop = false): void {
    feedPatternListenList[backpack.id] = { player, backpack, backpackInv, firstSlot, pattern: "", slot, justOneLoop }
    amountOfListeners == 0 && startInverval()
  }

  remove(backpack: Entity): void {
    delete feedPatternListenList[backpack.id]
  }
}

interface IIntervalInfo {
  player: Player
  backpack: Entity
  backpackInv: Container
  firstSlot: number
  pattern: string
  slot: number
  justOneLoop: boolean
}