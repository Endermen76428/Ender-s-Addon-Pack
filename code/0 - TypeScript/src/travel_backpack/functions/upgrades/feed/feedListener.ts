import { Container, EntityComponentTypes, EntityHungerComponent, EntitySaturationComponent, ItemStack, Player, world } from "@minecraft/server"
import { removeFromGlobalLoop } from "../../../../1-bacs/globalLoop"
import { backpackUpgradesIndex } from "../../../lib/variables"
import { foodList } from "./foodList"

const playersInfo: { [key: string]: IIntervalInfo } = {}
let execution = 0

export const travelBackpackFuncFeed = new class TravelBackpackFuncFeed {
  add(player: Player, pattern: string): void {
    const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container
    if(inventory == undefined) return

    const hungerComp = player.getComponent(EntityComponentTypes.Hunger)
    const saturationComp = player.getComponent(EntityComponentTypes.Saturation)
    if(hungerComp == undefined || saturationComp == undefined) return

    const nutrition: IFoodInfo[] = []
    const items = pattern.split(",")
    for(let i = 0, len = items.length; i < len; i++){
      const item = items[i]
      if(item == undefined) continue

      const info = foodList[item]
      if(info == undefined){
        // tentar pegar o component de food
        continue
      }

      nutrition.push({type: item, food: info.food, saturation: info.saturation, effects: info.effects, convert: info.convert, noConsume: info.noConsume})
    }

    nutrition.sort((a, b) => a.food - b.food)

    playersInfo[player.id] = { player, inventory, hungerComp, saturationComp, nutrition, pattern }
  }

  remove(player: Player): void {
    delete playersInfo[player.id]
  }

  update(): void {
    if(execution < 1){
      execution++
      return
    }

    execution = 0

    const players = Object.entries(playersInfo)
    const length = players.length
    let invalids = 0

    for(let i = 0; i < length; i++){
      const [ key, info ] = players[i] ?? []
      if(key == undefined || info == undefined) continue
      const { player, inventory, hungerComp, saturationComp, nutrition, pattern } = info

      // Remove o player da lista quando ela fica inválida
      if(!player.isValid || !inventory.isValid || !hungerComp.isValid){
        invalids++
        delete playersInfo[key]
        continue
      }

      const minNutritionInfo = nutrition[0]
      if(minNutritionInfo == undefined){
        invalids++
        delete playersInfo[key]
        continue
      }

      if(hungerComp.effectiveMax - hungerComp.currentValue >= minNutritionInfo.food || hungerComp.currentValue <= 6){
        let targetNutrition = minNutritionInfo

        for(let i = 1, len = nutrition.length; i < len; i++){
          const nutriInfo = nutrition[i]
          if(nutriInfo == undefined) continue

          // console.warn("Test1:", hungerComp.currentValue, "+", nutriInfo.saturation, ">", hungerComp.effectiveMax, "=", hungerComp.currentValue + nutriInfo.saturation > hungerComp.effectiveMax)
          if(hungerComp.currentValue + nutriInfo.saturation > hungerComp.effectiveMax) continue
          // console.warn("Test2:", targetNutrition.food, ">", nutriInfo.food, "=", targetNutrition.food < nutriInfo.food)
          if(targetNutrition.food > nutriInfo.food) continue

          targetNutrition = nutriInfo
        }
        // console.warn("Selected:", targetNutrition.type, targetNutrition.food, targetNutrition.saturation)

        for(let i = 0, len = inventory.size; i < len; i++){
          const item = inventory.getItem(i)
          if(item == undefined) continue
          if(item.hasTag("travel_backpack:backpack") == false) continue
          if(item.getDynamicProperty("pattern") != pattern) continue

          const backpackId = item.getDynamicProperty("id")
          if(typeof backpackId != "string") continue

          const backpackEntity = world.getEntity(backpackId)
          if(backpackEntity == undefined || backpackEntity.isValid == false) continue

          const backpackInv = backpackEntity.getComponent(EntityComponentTypes.Inventory)?.container
          if(backpackInv == undefined) continue

          const firstSlot = backpackUpgradesIndex[backpackInv.size]?.[0]
          if(firstSlot == undefined) continue

          let slot: number | undefined = undefined
          let food: ItemStack | undefined = undefined
          for(let i = firstSlot +32, len = firstSlot +41; i < len; i++){
            const item = backpackInv.getItem(i)
            if(item == undefined || item.typeId != targetNutrition.type) continue
            food = item
            slot = i
            break
          }

          if(food == undefined || slot == undefined) continue

          if(targetNutrition.noConsume == undefined){
            if(food.amount <= 1){
              backpackInv.setItem(slot, undefined)
            } else {
              food.amount--
              backpackInv.setItem(slot, food)
            }

            if(targetNutrition.convert){
              const convertItem = backpackInv.addItem(new ItemStack(targetNutrition.convert))
              if(convertItem != undefined) player.dimension.spawnItem(convertItem, player.location) // o AddItem Retorna o proprio item se ele não conseguir colocar dentro do container, por exemplo se ele tiver cheio
            }
          }

          hungerComp.setCurrentValue(Math.min(hungerComp.currentValue + targetNutrition.food, hungerComp.effectiveMax))
          saturationComp.setCurrentValue(Math.min(saturationComp.currentValue + targetNutrition.saturation, hungerComp.currentValue, saturationComp.effectiveMax)) // A saturação nunca é maior doque a quantia de fome do player

          if(targetNutrition.effects){
            for(let i = 0, len = targetNutrition.effects.length; i < len; i++){
              const effect = targetNutrition.effects[i]
              if(effect == undefined) continue

              if(Math.random() < effect.chance){
                player.addEffect(effect.id, effect.time *20, {amplifier: effect.amplifier})
              }
            }
          }
        }
      }
    }

    // Desativa o loop se não tiver mais fornalhas
    if(length == invalids){
      removeFromGlobalLoop("travelBackpackFeedListener")
    }
  }
}

interface IIntervalInfo {
  player: Player
  inventory: Container
  pattern: string
  hungerComp: EntityHungerComponent
  saturationComp: EntitySaturationComponent
  nutrition: IFoodInfo[]
}

export interface IFoodInfo {
  type: string
  food: number
  saturation: number
  effects?: TFoodEffect
  convert?: string
  noConsume?: true // Usado para itens que não são consumidos ao comer, tipo a carne infinita do trinkets
}

export type TFoodEffect = ({id: string, time: number, amplifier: number, chance: number})[]