import { BACSFurnaceRecipeDenyScore, BACSFurnaceRecipeScore, coalItem, furnaceReloadScore } from "../../../lib/variables"
import { Block, BlockComponentTypes, Container, Entity, ItemStack, system } from "@minecraft/server"
import { furnaceRecipeDenyList, furnaceRecipeList } from "./recipes"
import { furnaceArrowIcons, furnaceFlameIcons } from "./visual"
import { apiWarn } from "../../../../0-lib/player/warn"
import { furnaceFuelList } from "./fuel"

const furnaceListenList: { [key: string]: IntervalInfo } = {} // Backpack Id > Interval Info
let amountOfListeners = 0
const inverseProgress = 1 / 200

function startInverval(): void {
  const backpacks = Object.entries(furnaceListenList)
  const length = backpacks.length
  let invalidPlayers = 0
  amountOfListeners = length

  for(let i = 0; i < length; i++){
    const [ key, info ] = backpacks[i] ?? []
    if(key == undefined || info == undefined) continue
    const { backpack, backpackInv, firstSlot, tryStop, fuelMax, fuelTime, progress, gettingRecipe } = info

    // Remove a backpack da lista quando ela fica inválida
    if(!backpack.isValid){
      invalidPlayers++
      delete furnaceListenList[key]
      continue
    }

    if(gettingRecipe != undefined) continue

    if(fuelTime > 0){
      const levelOld = Math.floor(((fuelTime +1) * fuelMax) *13)
      const level = Math.floor((fuelTime * fuelMax) *13)
      if(level != levelOld) backpackInv.setItem(firstSlot +3, furnaceFlameIcons[level])
      info.fuelTime--
    }

    const input = backpackInv.getItem(firstSlot)
    // Se o player não estiver mais dentro da interface e se não haver mais combustivel ou progresso ele vai parar a execução e ativar o timer de arquivamento da backpack
    if(tryStop){
      if(fuelTime == 0 && progress <= 0){
        backpack.setDynamicProperty("f", undefined)
        backpack.setDynamicProperty("fm", undefined)
        backpack.setDynamicProperty("p", undefined)
        backpackInv.setItem(firstSlot +4, furnaceArrowIcons[0])

        furnaceUpgradeFunctions.remove(backpack)
        backpack.getProperty("travel_backpack:on_ground") == false && backpack.triggerEvent("travel_backpack:add_timer")
        continue
      }
    }

    // Se não tiver mais um item no input ele reseta o progresso
    if(input == undefined){
      if(progress > 0){
        backpackInv.setItem(firstSlot +4, furnaceArrowIcons[0])
        info.progress = 0
        backpack.setDynamicProperty("p", undefined)
      }
      continue
    }

    let output = backpackInv.getItem(firstSlot +2)

    // Se o output estiver cheio ele para de executar
    if(output && output.amount >= output.maxAmount) continue

    // Pega o item que será gerado ao fundir o input atual
    const expectedOutput = furnaceRecipeList[input.typeId]
    if(expectedOutput == undefined){
      // Se o input está na lista de negação é porque não tem recipe
      if(furnaceRecipeDenyList[input.typeId] == true) continue

      // Se o output não exitir para esse input, executará o sistema para pegar o item
      const furnaceBlock = backpack.dimension.getBlock({x: backpack.location.x, y: backpack.dimension.heightRange.min, z: backpack.location.z})
      if(furnaceBlock == undefined || !furnaceBlock.isValid) continue

      (furnaceBlock.typeId != "minecraft:furnace" && furnaceBlock.typeId != "minecraft:lit_furnace") && furnaceBlock.setType("minecraft:furnace")
      const inv = furnaceBlock.getComponent(BlockComponentTypes.Inventory)?.container
      if(inv == undefined) continue

      inv.clearAll()
      inv.setItem(0, new ItemStack(input.typeId))
      inv.setItem(1, coalItem)

      info.gettingRecipe = furnaceBlock

      const players = backpack.dimension.getPlayers({location: backpack.location, maxDistance: 7})
      for(let pI = 0, pLen = players.length; pI < pLen; pI++){
        const player = players[pI]
        player && apiWarn.notify(player, {rawtext:[{text: "§a"}, {translate: input.localizationKey}, {translate: "entity.warn.travel_backpack:furnace.start_search"}]}, {sound: "warn.ender_addon_pack:levelup"})
      }
      system.runTimeout(() => {
        delete info.gettingRecipe

        const players = backpack.dimension.getPlayers({location: backpack.location, maxDistance: 7})
        if(!furnaceBlock.isValid || !inv.isValid){
          for(let pI = 0, pLen = players.length; pI < pLen; pI++){
            const player = players[pI]
            player && apiWarn.notify(player, {translate: "entity.warn.travel_backpack:furnace.unexpected_error"}, {sound: "warn.ender_addon_pack:break"})
          }
          return
        }

        const output = inv.getItem(2)
        inv.clearAll()
        furnaceBlock.setType("minecraft:bedrock")
        if(output == undefined){
          furnaceRecipeDenyList[input.typeId] = true
          BACSFurnaceRecipeDenyScore.setScore(input.typeId, 0)
          for(let pI = 0, pLen = players.length; pI < pLen; pI++){
            const player = players[pI]
            player && apiWarn.notify(player, {rawtext:[{text: "§c"}, {translate: input.localizationKey}, {translate: "entity.warn.travel_backpack:furnace.recipe_not_found"}]}, {sound: "warn.ender_addon_pack:bass"})
          }
          return
        }

        furnaceRecipeList[input.typeId] = output.typeId
        BACSFurnaceRecipeScore.setScore(`${input.typeId}/${output.typeId}`, 0)

        for(let pI = 0, pLen = players.length; pI < pLen; pI++){
          const player = players[pI]
          player && apiWarn.notify(player, {rawtext:[{text: "§e"}, {translate: output.localizationKey}, {translate: "entity.warn.travel_backpack:furnace.recipe_found"}, {translate: input.localizationKey}]}, {sound: "warn.ender_addon_pack:pop"})
        }
      }, 201)
      continue
    }

    if(output != undefined && expectedOutput != output.typeId){
      if(progress > 0){
        backpackInv.setItem(firstSlot +4, furnaceArrowIcons[0])
        info.progress = 0
        backpack.setDynamicProperty("p", undefined)
      }
      continue
    }

    // Se não haver mais combustivel, tentará pegar um novo do slot de fuel. Se não haver decrementará o progressp
    if(fuelTime == 0){
      const fuel = backpackInv.getItem(firstSlot +1)
      if(fuel == undefined){
        if(progress > 0){
          const levelOld = Math.floor(((progress +1) * inverseProgress) *22)
          const level = Math.floor((progress * inverseProgress) *22)
          if(level != levelOld) backpackInv.setItem(firstSlot +4, furnaceArrowIcons[level])
          info.progress -= 2
          backpack.setDynamicProperty("p", info.progress)
        }
        continue
      }

      const gettedFuelTime = furnaceFuelList[fuel.typeId]
      if(gettedFuelTime == undefined){
        if(progress > 0){
          const levelOld = Math.floor(((progress +1) * inverseProgress) *22)
          const level = Math.floor((progress * inverseProgress) *22)
          if(level != levelOld) backpackInv.setItem(firstSlot +4, furnaceArrowIcons[level])
          info.progress -= 2
          backpack.setDynamicProperty("p", info.progress)
        }
        continue
      }

      if(fuel.amount -1 == 0){
        backpackInv.setItem(firstSlot +1, undefined)
      } else {
        fuel.amount--
        backpackInv.setItem(firstSlot +1, fuel)
      }
      info.fuelTime = gettedFuelTime *200 // 200 ticks = 10s tempo de assar 1 item na fornalha
      info.fuelMax = 1 / (gettedFuelTime *200) // é a função inversa, já que a multiplicação é mais rapida doque divisão, e o max fuel vai ser usado muito la em cima pra atualizar o nivel da chama
      backpack.setDynamicProperty("fm", gettedFuelTime *200) // Salva o maxFuel pra caso o player saia do mapa
    }

    const levelOld = Math.floor(((progress -1) * inverseProgress) *22)
    const level = Math.floor((progress * inverseProgress) *22)
    if(level != levelOld){
      backpackInv.setItem(firstSlot +4, furnaceArrowIcons[level])
      backpack.setDynamicProperty("f", fuelTime)
      backpack.setDynamicProperty("p", progress)
    }

    info.progress++
    // Gera o resultado
    if(info.progress == 200){
      if(output == undefined){
        output = new ItemStack(expectedOutput)
      } else {
        output.amount++
      }
      backpackInv.setItem(firstSlot +4, furnaceArrowIcons[0]) // Sempre reseta o progresso ao fundir um item, evita bugs visuais

      // Decremetanta o input
      backpackInv.setItem(firstSlot +2, output)
      if(input.amount -1 == 0){
        backpackInv.setItem(firstSlot, undefined)
      } else {
        input.amount--
        backpackInv.setItem(firstSlot, input)
      }
      info.progress = 0
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

export const furnaceUpgradeFunctions = new class FurnaceUpgradeFunctions {
  add(backpack: Entity, backpackInv: Container, firstSlot: number): void {
    if(backpack.getProperty("travel_backpack:on_ground") == false){
      backpack.triggerEvent("travel_backpack:remove_timer")
      backpack.addTag("can_enable_timer")
    }

    furnaceReloadScore.setScore(backpack.id, 0)

    const info = furnaceListenList[backpack.id]
    if(info == undefined){
      const fuelTime = (r => typeof r != "number" ? 0 : r)(backpack.getDynamicProperty("f"))
      const fuelMax = (r => typeof r != "number" ? 0 : r)(backpack.getDynamicProperty("fm"))
      const progress = (r => typeof r != "number" ? 0 : r)(backpack.getDynamicProperty("p"))
      furnaceListenList[backpack.id] = { backpack, backpackInv, firstSlot, tryStop: false, fuelMax: 1 / fuelMax, fuelTime, progress }
    } else {
      info.tryStop = false
    }
    amountOfListeners == 0 && startInverval()
  }

  enableTryStop(backpack: Entity): void {
    const info = furnaceListenList[backpack.id]
    if(info == undefined) return

    info.tryStop = true
  }

  remove(backpack: Entity): void {
    furnaceReloadScore.removeParticipant(backpack.id)
    delete furnaceListenList[backpack.id]
  }
}

interface IntervalInfo {
  backpack: Entity
  backpackInv: Container
  firstSlot: number
  tryStop: boolean
  fuelTime: number
  fuelMax: number
  progress: number // 0 à 199 - são 200 ticks = 10s tempo da fornalha

  gettingRecipe?: Block
}