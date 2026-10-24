import { compatibleAddonsTranslation, BACSFurnaceRecipeScore, BACSFurnaceRecipeDenyScore } from "../../../1-bacs/recipes/variables"
import { furnaceRecipeList, furnaceRecipeDenyList, furnaceHasRecipe } from "../../../1-bacs/recipes/furnace/recipes"
import { Block, BlockComponentTypes, Container, Entity, ItemStack, system, world } from "@minecraft/server"
import { activatedTemporalZoneScore, coalItem } from "../../lib/variables"
import { furnaceFuelList } from "../../../1-bacs/recipes/furnace/fuel"
import { removeFromGlobalLoop } from "../../../1-bacs/globalLoop"
import { apiNumbers } from "../../../0-lib/math/numbers"
import { apiWarn } from "../../../0-lib/player/warn"

const tempGettingRecipeTarget = new Set<string>() // Item Id
const furnacesInfo: { [key: string]: IIntervalInfo } = {}

export const temporalBottleFuncFurnace = new class TemporalBottleFuncFurnace {
  add(entity: Entity, block: Block, inventory: Container, multiplier: number, maxProcess: number): void {
    const id = (block.x << 20) ^ (block.z << 10) ^ block.y
    const oldInfo = furnacesInfo[id]
    if(oldInfo != undefined){
      oldInfo.multiplier = multiplier
    } else {
      const index = furnaceIndex[block.typeId]
      if(index == undefined) return

      activatedTemporalZoneScore.setScore(entity.id, 0)
      furnacesInfo[id] = { entity, block, index, inventory, multiplier, fuelTime: 0, progress: 0, maxProcess }
    }
  }

  update(): void {
    const furnaces = Object.entries(furnacesInfo)
    const length = furnaces.length
    let invalids = 0

    for(let i = 0; i < length; i++){
      const [ key, info ] = furnaces[i] ?? []
      if(key == undefined || info == undefined) continue
      const { entity, block, index, inventory, multiplier, fuelTime, progress, maxProcess, gettingRecipe } = info

      // Remove a backpack da lista quando ela fica inválida
      if(!entity.isValid || !block.isValid || !inventory.isValid){
        invalids++
        delete furnacesInfo[key]
        activatedTemporalZoneScore.removeParticipant(entity.id)
        continue
      }

      if(gettingRecipe != undefined) continue

      const input = inventory.getItem(0)
      if(input == undefined){
        if(progress > 0 || fuelTime > 0){
          info.progress = 0
          info.fuelTime -= apiNumbers.clamp(info.fuelTime - multiplier, 0, info.fuelTime)
        }
        continue
      }

      let output = inventory.getItem(2)

      // Se o output estiver cheio ele para de executar
      if(output && output.amount >= output.maxAmount) continue

      // Pega o item que será gerado ao fundir o input atual
      const expectedOutput = furnaceRecipeList[input.typeId]
      if(expectedOutput == undefined){
        // Se está na lista de receitas negadas ele pula a execução
        if(furnaceRecipeDenyList[`${index}/${input.typeId}`] != undefined) continue

        // Se outra fornalha no mundo já está procurando por essa recipe não é necessesario procurar novamente, mas a animação de procura será executada ainda
        if(tempGettingRecipeTarget.has(input.typeId)){
          if(gettingRecipe == undefined){
            entity.triggerEvent("temporal_bottle:search_furnace_recipe")
            info.gettingRecipe = block
            system.runTimeout(() => {
              delete info.gettingRecipe
            }, 200)
          }
          continue
        }

        tempGettingRecipeTarget.add(input.typeId)
        entity.triggerEvent("temporal_bottle:search_furnace_recipe")

        // let furnaceBlock = block.dimension.getBlock({x: block.x, y: block.y +2, z: block.z})
        // for(let i2 = 0; i2 < 5; i2++){ if(furnaceBlock && furnaceBlock?.typeId != "minecraft:air"){ furnaceBlock = furnaceBlock.east(1); break } }

        let furnaceBlock = block.dimension.getBlock({x: block.x, y: block.dimension.heightRange.min, z: block.z})
        for(let i2 = 0; i2 < 5; i2++){ if(furnaceBlock && furnaceBlock?.typeId != "minecraft:bedrock"){ furnaceBlock = furnaceBlock.east(1); break } }
        if(furnaceBlock == undefined || !furnaceBlock.isValid) continue

        const blastBlock = furnaceBlock?.north()
        const smokerBlock = furnaceBlock?.south()
        if(blastBlock == undefined || !blastBlock.isValid) continue
        if(smokerBlock == undefined || !smokerBlock.isValid) continue

        info.gettingRecipe = furnaceBlock
        furnaceBlock.setType("minecraft:furnace")
        blastBlock.setType("minecraft:blast_furnace")
        smokerBlock.setType("minecraft:smoker")

        const furnaceInv = furnaceBlock.getComponent(BlockComponentTypes.Inventory)?.container
        const blastInv = blastBlock.getComponent(BlockComponentTypes.Inventory)?.container
        const smokerInv = smokerBlock.getComponent(BlockComponentTypes.Inventory)?.container

        if(furnaceInv == undefined || blastInv == undefined || smokerInv == undefined) continue

        const inputItem = new ItemStack(input.typeId) // Recria o item mas somente com 1 unidade
        furnaceInv.setItem(0, inputItem), blastInv.setItem(0, inputItem), smokerInv.setItem(0, inputItem)
        furnaceInv.setItem(1, coalItem), blastInv.setItem(1, coalItem), smokerInv.setItem(1, coalItem)

        const tickId = `${furnaceBlock.x},${furnaceBlock.y},${furnaceBlock.z}`
        world.tickingAreaManager.hasTickingArea(tickId) == false && world.tickingAreaManager.createTickingArea(tickId, {dimension: furnaceBlock.dimension, from: blastBlock.location, to: smokerBlock.location})

        let players = entity.dimension.getPlayers({location: entity.location, maxDistance: 10})
        for(let p = 0, pLen = players.length; p < pLen; p++){
          const player = players[p]
          const addonId = input.typeId.split(":", 1)[0] ?? ""
          if(player != undefined) apiWarn.notify(player, {translate: "bacs.warn.temporal_bottle:furnace.start_search.10", with: {rawtext:[{translate: input.localizationKey + (compatibleAddonsTranslation[addonId] ? ".bacs" : "")}]}}, {sound: "warn.ender_addon_pack:pop"})
        }

        system.runTimeout(() => {
          delete info.gettingRecipe
          tempGettingRecipeTarget.delete(input.typeId)

          if(!furnaceBlock.isValid || !blastBlock.isValid || !smokerBlock.isValid || !furnaceInv.isValid || !blastInv.isValid || !smokerInv.isValid){
            players = entity.dimension.getPlayers({location: entity.location, maxDistance: 10})
            for(let p = 0, pLen = players.length; p < pLen; p++){
              const player = players[p]
              if(player != undefined) apiWarn.notify(player, "bacs.warn.temporal_bottle:furnace.invalid_block", {sound: "warn.ender_addon_pack:break"})
            }
            return
          }

          const furnaceOutput = furnaceInv.getItem(2)?.typeId, blastOutput = blastInv.getItem(2)?.typeId, smokerOutput = smokerInv.getItem(2)?.typeId
          furnaceInv.clearAll(), blastInv.clearAll(), smokerInv.clearAll()
          furnaceBlock.setType("minecraft:bedrock"), blastBlock.setType("minecraft:bedrock"), smokerBlock.setType("minecraft:bedrock")

          world.tickingAreaManager.removeTickingArea(tickId)

          // Se haver um output ele será adicionado a lista de recipes validas para aquele tipo de bloco e na lista global
          // Caso contrario será colocado na lista de recipes invalidas com o prefixo do bloco
          this.registerNewRecipe("minecraft:furnace", input.typeId, furnaceOutput)
          this.registerNewRecipe("minecraft:blast_furnace", input.typeId, blastOutput)
          this.registerNewRecipe("minecraft:smoker", input.typeId, smokerOutput)
          block.dimension.playSound("warn.temporal_bottle:recipe_finished", block.center())
        }, 200)

        continue
      }

      if(furnaceRecipeDenyList[`${index}/${input.typeId}`]) continue

      // Para de executar se ele for um output diferente do esperado
      if(output != undefined && expectedOutput != output.typeId){
        if(progress > 0){
          info.progress = 0
        }
        continue
      }

      // Pega a quantia minima de itens que podem ser fundidos tanto pela quantia no input quanto a quantia restante no output
      const canSmelt = Math.min(output ? (output.maxAmount - output.amount) : 64, input.amount)
      const maxTicks = Math.min(canSmelt * maxProcess, multiplier)

      // console.warn("Min: (", fuelTime, "+", progress, ") <", maxTicks, "=", (fuelTime + progress) < maxTicks, "/// (", canSmelt, ":", canSmelt * maxProcess, ") |", multiplier)
      if((fuelTime + progress) < maxTicks || fuelTime <= 0){
        const fuel = inventory.getItem(1)
        if(fuel == undefined){
          if(progress > 0){
            info.progress -= multiplier
          }
          continue
        }

        const gettedFuelTime = furnaceFuelList[fuel.typeId]
        if(gettedFuelTime == undefined){
          if(progress > 0){
            info.progress -= multiplier
          }
          continue
        }

        const itemFuelTime = gettedFuelTime * maxProcess
        // Pega a quantia de combustiveis necessarios para poder executar novamente caso não tenha pega tudo que resta
        const fuelNeeded = Math.min(fuel.amount, Math.ceil((maxTicks - fuelTime) / itemFuelTime))
        // console.warn("( (", maxTicks, "-", fuelTime, ") /", itemFuelTime, ") =", Math.ceil((maxTicks - fuelTime) / itemFuelTime), "ou", fuel.amount, "=", fuelNeeded, "items =>", itemFuelTime * fuelNeeded, "ticks => Current:", fuelTime + itemFuelTime * fuelNeeded)

        if(fuel.amount - fuelNeeded == 0){
          inventory.setItem(1, undefined)
        } else {
          fuel.amount -= fuelNeeded
          inventory.setItem(1, fuel)
        }
        info.fuelTime += itemFuelTime * fuelNeeded // 200 ticks = 10s tempo de assar 1 item na fornalha normal / 100 se for no smoker ou blast
      }

      const minConsume = Math.min(multiplier, info.fuelTime)
      const totalProgress = info.progress + minConsume
      // Pega o minino entre execuções possiveis por quantiade de itens e pela quantia que deveria ser fundida
      const amount = Math.min(canSmelt, Math.floor(totalProgress / maxProcess))
      // console.warn("Gerado:", info.progress, "+", minConsume, "=", totalProgress, "/", maxProcess, "=", amount, "| Sobra P:", totalProgress - amount * maxProcess, "F:", info.fuelTime - minConsume, "/ Consume:", minConsume, "/ Progress:", amount * maxProcess)
      info.progress = totalProgress - amount * maxProcess
      info.fuelTime -= minConsume

      if(amount <= 0) continue

      if(output == undefined){
        output = new ItemStack(expectedOutput, amount)
      } else {
        output.amount += amount
      }
      inventory.setItem(2, output)

      if(input.amount - amount == 0){
        inventory.setItem(0, undefined)
      } else {
        input.amount -= amount
        inventory.setItem(0, input)
      }
    }

    // Desativa o loop se não tiver mais fornalhas
    if(length == invalids){
      removeFromGlobalLoop("temporalBottleFurnace")
    }
  }

  private registerNewRecipe(blockId: string, input: string, output?: string): void {
    const index = furnaceIndex[blockId]
    if(index == undefined) return

    if(output != undefined){
      furnaceRecipeList[input] = output
      furnaceHasRecipe[blockId]?.add(input)
      BACSFurnaceRecipeScore.setScore(`${input}/${output}`, 0)
    } else {
      const id = `${index}/${input}`
      furnaceRecipeDenyList[id] = true
      BACSFurnaceRecipeDenyScore.setScore(id, 0)
    }
  }
}

const furnaceIndex: { [key: string]: number } = {
  "minecraft:furnace": 0,
  "minecraft:lit_furnace": 0,
  "minecraft:blast_furnace": 1,
  "minecraft:lit_blast_furnace": 1,
  "minecraft:smoker": 2,
  "minecraft:lit_smoker": 2
}

interface IIntervalInfo {
  entity: Entity
  block: Block
  index: number
  inventory: Container
  multiplier: number
  fuelTime: number
  progress: number
  maxProcess: number

  gettingRecipe?: Block
}