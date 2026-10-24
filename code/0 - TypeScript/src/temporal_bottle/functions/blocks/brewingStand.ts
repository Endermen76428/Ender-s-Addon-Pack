import { Block, BlockComponentTypes, Container, Entity, ItemComponentTypes, ItemPotionComponent, ItemStack, ItemTypes, Potions, system, world } from "@minecraft/server"
import { BACSBrewingStandRecipeDenyScore, BACSBrewingStandRecipeScore, compatibleAddonsTranslation } from "../../../1-bacs/recipes/variables"
import { brewingStandRecipeDenyList, brewingStandRecipeList } from "../../../1-bacs/recipes/brewingStand/recipes"
import { removeFromGlobalLoop } from "../../../1-bacs/globalLoop"
import { apiWarn } from "../../../0-lib/player/warn"

const brewingStandsInfo: { [key: string]: IIntervalInfo } = {}

export const temporalBottleFuncBrewingStand = new class TemporalBottleFuncBrewingStand {
  add(entity: Entity, block: Block, inventory: Container, multiplier: number, maxProcess: number): void {
    const id = (block.x << 20) ^ (block.z << 10) ^ block.y
    const oldInfo = brewingStandsInfo[id]
    if(oldInfo != undefined){
      oldInfo.multiplier = multiplier
    } else {
      brewingStandsInfo[id] = { entity, block, inventory, multiplier, progress: 0, maxProcess }
    }
  }

  update(): void {
    const brewingStands = Object.entries(brewingStandsInfo)
    const length = brewingStands.length
    let invalids = 0

    for(let i = 0; i < length; i++){
      const [ key, info ] = brewingStands[i] ?? []
      if(key == undefined || info == undefined) continue
      const { entity, block, inventory, multiplier, progress, maxProcess, gettingRecipe } = info

      // Remove a backpack da lista quando ela fica inválida
      if(!entity.isValid || !block.isValid || !inventory.isValid){
        invalids++
        delete brewingStandsInfo[key]
        continue
      }

      if(gettingRecipe != undefined) continue

      const input = inventory.getItem(0)
      if(input == undefined){
        info.progress = 0
        continue
      }

      const thrownType: TThrownType | undefined = input.typeId == "minecraft:gunpowder" ? "ThrownSplash" : input.typeId == "minecraft:dragon_breath" ? "ThrownLingering" : undefined

      let hasValidPotion = false
      for(let i = 0; i < 3; i++){
        const slotBase = inventory.getItem(i +1)

        if(slotBase == undefined) continue

        const base = slotBase?.getComponent(ItemComponentTypes.Potion)

        const potionId = base?.potionEffectType.id + "/" + input.typeId
        const vanillaRecipeId = brewingStandRecipeList[potionId]
        const potionAddonId = slotBase?.typeId + "/" + input.typeId
        const addonRecipeId = brewingStandRecipeList[potionAddonId]

        // Se qualquer uma das recipes estiver na lista de negação ignora
        if(brewingStandRecipeDenyList[potionId] == true || brewingStandRecipeDenyList[potionAddonId] == true) continue

        if(addonRecipeId != undefined || (base && thrownType && base.potionDeliveryType.id == transformDeliveryRequirements[thrownType]) || vanillaRecipeId != undefined){
          hasValidPotion = true
          break
        }

        // let brewBlock = block.dimension.getBlock({x: block.x, y: block.y +2, z: block.z})
        let brewBlock = block.dimension.getBlock({x: block.x, y: block.dimension.heightRange.min, z: block.z})
        for(let i2 = 0; i2 < 2; i2++){ if(brewBlock?.typeId == "minecraft:brewing_stand") brewBlock = brewBlock.east(1) }
        if(brewBlock == undefined) continue
        world.structureManager.place("mystructure:temporal_bottle/brewing_stand", block.dimension, brewBlock.location)

        info.gettingRecipe = brewBlock
        entity.triggerEvent("temporal_bottle:search_brewing_stand_recipe")

        const brewInv = brewBlock.getComponent(BlockComponentTypes.Inventory)?.container
        if(brewInv == undefined) continue

        brewInv.setItem(0, new ItemStack(input.typeId))
        brewInv.setItem(1, slotBase)

        const tickId = `${brewBlock.x},${brewBlock.y},${brewBlock.z}`
        world.tickingAreaManager.hasTickingArea(tickId) == false && world.tickingAreaManager.createTickingArea(tickId, {dimension: brewBlock.dimension, from: brewBlock, to: brewBlock})

        let players = entity.dimension.getPlayers({location: entity.location, maxDistance: 10})
        for(let p = 0, pLen = players.length; p < pLen; p++){
          const player = players[p]
          const inputAddonId = input.typeId.split(":", 1)[0] ?? ""
          const baseAddonId = slotBase.typeId.split(":", 1)[0] ?? ""
          if(player != undefined) apiWarn.notify(player, {translate: "bacs.warn.temporal_bottle:furnace.start_search.20", with: {rawtext:[
            {translate: input.localizationKey + (compatibleAddonsTranslation[inputAddonId] ? ".bacs" : "")},
            {translate: base?.potionEffectType.id ?? (slotBase.localizationKey + (compatibleAddonsTranslation[baseAddonId] ? ".bacs" : ""))}
          ]}}, {sound: "warn.ender_addon_pack:pop"})
        }

        system.runTimeout(() => {
          delete info.gettingRecipe

          if(brewBlock.isValid == false || brewInv.isValid == false){
            players = entity.dimension.getPlayers({location: entity.location, maxDistance: 10})
            for(let p = 0, pLen = players.length; p < pLen; p++){
              const player = players[p]
              if(player != undefined) apiWarn.notify(player, "bacs.warn.temporal_bottle:furnace.invalid_block", {sound: "warn.ender_addon_pack:break"})
            }
            return
          }

          const output = brewInv.getItem(1)

          brewInv.clearAll()
          brewBlock.setType("minecraft:bedrock")

          world.tickingAreaManager.removeTickingArea(tickId)

          if(output == undefined) return console.warn("§4Critial Fail!")
          const resultBase = base?.potionEffectType.id ?? slotBase.typeId

          if(output.typeId != slotBase.typeId){
            this.registerNewRecipe(resultBase, input.typeId, output.typeId != slotBase.typeId ? output.typeId : undefined)
          } else {
            this.registerNewRecipe(resultBase, input.typeId)
          }
          block.dimension.playSound("warn.temporal_bottle:recipe_finished", block.center())
        }, 401) // Tempo do suporte de poções vanilla executar
      }

      // Se alguma poção pode ser gerada no futuro, o progresso será aumentado
      if(hasValidPotion) info.progress += multiplier

      if(progress >= maxProcess){
        info.progress -= maxProcess

        let transformed = false
        for(let i = 0; i < 3; i++){
          const slotBase = inventory.getItem(i +1)
          if(slotBase == undefined) continue

          // Verifica se a poção é vanilla
          const base = slotBase?.getComponent(ItemComponentTypes.Potion)
          const vanillaRecipeId = brewingStandRecipeList[base?.potionEffectType.id + "/" + input.typeId]
          if(base && vanillaRecipeId != undefined){
            if(ItemTypes.get(vanillaRecipeId) != undefined){
              inventory.setItem(i +1, new ItemStack(vanillaRecipeId))
            } else {
              inventory.setItem(i +1, Potions.resolve(vanillaRecipeId, base.potionDeliveryType))
            }
            transformed = true
            continue
          }

          // verificar se a fabricação será uma transformação de tipo
          if(thrownType && base?.potionDeliveryType.id == transformDeliveryRequirements[thrownType]){
            this.transformDeliveryType(inventory, base, i +1, thrownType)
            transformed = true
            continue
          }

          // Verifia se a poção gerada é de addon
          const addonRecipeId = brewingStandRecipeList[slotBase?.typeId + "/" + input.typeId]
          if(addonRecipeId != undefined){
            inventory.setItem(i +1, new ItemStack(addonRecipeId))
            transformed = true
            continue
          }
        }

        // Se pelo menos uma das poções foi criada, o input é decrementado
        if(transformed){
          block.dimension.playSound("random.potion.brewed", block.center())
          if(input.amount < 2){
            inventory.setItem(0, undefined)
          } else {
            input.amount--
            inventory.setItem(0, input)
          }
        }
      }
    }

    // Desativa o loop se não tiver mais Suportes de Poções
    if(length == invalids){
      removeFromGlobalLoop("temporalBottleBrewingStand")
    }
  }

  private transformDeliveryType(inventory: Container, potion: ItemPotionComponent, index: number, type: TThrownType): void {
    inventory.setItem(index, Potions.resolve(potion.potionEffectType, type))
  }

  private registerNewRecipe(base: string, reagent: string, output?: string): void {
    if(output != undefined){
      brewingStandRecipeList[`${base}/${reagent}`] = output
      BACSBrewingStandRecipeScore.setScore(`${base}/${reagent}/${output}`, 0)
      // Adicionar o output como a base, para ele não inciar novamente o sistema de pesquisa, já que isso nunca ocorre no vanilla
      brewingStandRecipeDenyList[`${output}/${reagent}`] = true
      BACSBrewingStandRecipeDenyScore.setScore(`${output}/${reagent}`, 0)
    } else {
      brewingStandRecipeDenyList[`${base}/${reagent}`] = true
      BACSBrewingStandRecipeDenyScore.setScore(`${base}/${reagent}`, 0)
    }
  }
}

const transformDeliveryRequirements: Record<TThrownType, string> = {
  "ThrownSplash": "Consume",
  "ThrownLingering": "ThrownSplash"
}

type TThrownType = "ThrownSplash" | "ThrownLingering"

interface IIntervalInfo {
  entity: Entity
  block: Block
  inventory: Container
  multiplier: number
  progress: number
  maxProcess: number

  gettingRecipe?: Block
}