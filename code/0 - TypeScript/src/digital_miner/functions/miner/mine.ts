import { world, ItemStack, Block, BlockVolume, Container, EnchantmentType, ItemComponentTypes, ListBlockVolume, Player } from "@minecraft/server"
import { globalBlocksLocations, globalBlocksLocationsAmount, globalToolCache, globalUpgradesCache } from "../../lib/variables"
import { apiScoreboard } from "../../../0-lib/math/scoreboard"
import { apiMinerSpace } from "../../lib/block/minerSpace"
import { minerUIUpgrades, Upgrades } from "./ui/upgrades"
import { apiWarn } from "../../../0-lib/player/warn"
import { apiVec3 } from "../../lib/math/vector3"
import { filterDigitalMiner } from "./filter"
import { apiString } from "../../lib/string"
import { infoDigitalMiner } from "./info"

const gettingBlocks = new Set<string>()

export const mineDigitalMiner = new class MineDigitalMiner {
  mine(block: Block): void {
    const offset = apiVec3.offsetDirection[block.permutation.getState("minecraft:cardinal_direction") ?? ""]
    if(!offset) return infoDigitalMiner.turnState(block.dimension, block.location, false)

    const container = apiMinerSpace.getContainer(block.dimension, {x: block.x + offset.x * 2, y: block.y, z: block.z + offset.z * 2})
    if(!container) return infoDigitalMiner.turnState(block.dimension, block.location, false)

    this.getBlocksToMine(block, container)
  }

  private getBlocksToMine(block: Block, inventory: Container): void {
    const id = `${apiString.getDimension(block)}/${apiVec3.toString(block.location)}`
    // Break Blocks
    if(globalBlocksLocations.has(id)) return this.breakBlocks(block, id, inventory)

    // Get all blocks
    if(gettingBlocks.has(id)) return
    gettingBlocks.add(id)
    this.getBlocks(block, id)
  }

  private getBlocks(block: Block, id: string): void {
    const scoreInfo = apiScoreboard.getObj(`digital_miner/miner/${apiString.getDimension(block)}/${apiVec3.toString(block.location)}`)
    const filterList = filterDigitalMiner.getTypeTag(block.dimension, block.location)

    if(filterList.type.length + filterList.tag.length < 1) return infoDigitalMiner.turnState(block.dimension, block.location, false)

    const radius = apiScoreboard.getScore(scoreInfo, "info/radius")
    const maxHeight = apiScoreboard.getScore(scoreInfo, "info/max_y")
    const minHeight = apiScoreboard.getScore(scoreInfo, "info/min_y")
    const minPos = {x: block.x - radius, y: minHeight, z: block.z - radius}
    const maxPos = {x: block.x + radius, y: maxHeight, z: block.z + radius}
    const maxExecute = (radius *2) / 16
    const maxExecuteCeil = Math.ceil(maxExecute)
    let maxExecuteShow = maxExecuteCeil ** 2

    const allBlocks: ListBlockVolume[] = []

    for(let x = 0; x < maxExecute; x++){
      for(let z = 0; z < maxExecute; z++){
        const pos1 = {x: minPos.x + (x * 16), y: minHeight, z: minPos.z + (z * 16)}
        const pos2 = {x: pos1.x +(x +1 < maxExecute ? 15 : maxExecute % 16 == 0 ? 15 : maxPos.x - pos1.x), y: maxHeight, z: pos1.z +(z +1 < maxExecute ? 15 : maxExecute % 16 == 0 ? 15 : maxPos.z - pos1.z)}

        const blocks = block.dimension.getBlocks(new BlockVolume(pos1, pos2), {includeTypes: filterList.type, includeTags: filterList.tag, excludeTypes: ["minecraft:air"], excludeTags: ["bedrock_awakening:script_no_break", "not_feature_replaceable"]}, true)
        if(blocks.getCapacity() == 0){
          maxExecuteShow--
          continue
        }

        allBlocks.push(blocks)

        for(const player of block.dimension.getEntities({type: "minecraft:player", location: block.center(), maxDistance: 7})){
          player instanceof Player && apiWarn.notify(player, {translate: "warn.digital_miner:miner.scanning", with: [`${allBlocks.length}/${maxExecuteShow}`]}, {type: "actionbar"})
        }
      }
    }

    globalBlocksLocations.set(id, allBlocks.map(volume => volume.getBlockLocationIterator()))
    globalBlocksLocationsAmount.set(id, allBlocks.reduce((acc, volume) => acc + volume.getCapacity(), 0))
    gettingBlocks.delete(id)

    for(const player of block.dimension.getEntities({type: "minecraft:player", location: block.center(), maxDistance: 7})){
      player instanceof Player && apiWarn.notify(player, {translate: "warn.digital_miner:miner.found_blocks", with: [`${allBlocks.reduce((acc, value) => acc + value.getCapacity(), 0) ?? 0}`]}, {type: "actionbar"})
    }
  }

  private breakBlocks(block: Block, id: string, inventory: Container, amount = 0): void {
    const blocks = globalBlocksLocations.get(id) ?? []
    if(blocks.length < 1) return infoDigitalMiner.turnState(block.dimension, block.location, false)

    const targetSelection = blocks[0]
    if(!targetSelection) return

    const upgrades = mineDigitalMiner.getUpgrade(id)
    const tool = this.getTool(id, upgrades)

    for(let i = amount, max = (Math.floor(upgrades.stack * 2) || 1); i < max; i++){
      const { value: pos, done } = targetSelection.next()
      if(done){
        blocks.splice(0, 1)
        return this.breakBlocks(block, id, inventory, i)
      }

      try {
        const targetBlock = block.dimension.getBlock(pos)
        if(!targetBlock) continue

        const allItems = world.getLootTableManager()
        .generateLootFromBlock(targetBlock, tool)
        ?.reduce<Record<string, ItemStack>>((acc, item) => {
          const selected = acc[item.typeId]
          if(!selected){
            acc[item.typeId] = item
            return acc
          }
          selected.amount += item.amount
          return acc
        }, {});
        if(!allItems) continue

        globalBlocksLocationsAmount.set(id, (globalBlocksLocationsAmount.get(id) ?? 1) -1)
        targetBlock.setType("minecraft:air")

        for(const [key, item] of Object.entries(allItems)){
          if(inventory.emptySlotsCount == 0){
            block.dimension.getEntities({type: "minecraft:player", location: block.center(), maxDistance: 7}).forEach(player => {
              player instanceof Player && apiWarn.notify(player, {translate: "warn.digital_miner:miner.container_full"}, {type: "actionbar", sound: "warn.ender_addon_pack:bass"})
            })
            return infoDigitalMiner.turnState(block.dimension, block.location, false)
          }
          inventory.addItem(item)
        }
      } catch {}
    }
  }

  private getUpgrade(id: string): Upgrades {
    const cacheUpgrades = globalUpgradesCache.get(id)
    if(cacheUpgrades) return cacheUpgrades

    const upgrades = minerUIUpgrades.getUpgrades(id)
    globalUpgradesCache.set(id, upgrades)
    return upgrades
  }

  private getTool(id: string, upgrades: Upgrades): ItemStack | undefined {
    const cache = globalToolCache.get(id)
    if(cache) return cache

    // const itemId = toolList[upgrades.tool ?? 0]
    const itemId = toolList[4]
    if(!itemId) return

    const item = new ItemStack(itemId)
    const enchant = item.getComponent(ItemComponentTypes.Enchantable)
    if(!enchant) return

    if(upgrades.fortune > 0) enchant.addEnchantment({type: new EnchantmentType("minecraft:fortune"), level: upgrades.fortune})
    else if(upgrades.silk_touch > 0) enchant.addEnchantment({type: new EnchantmentType("minecraft:silk_touch"), level: new EnchantmentType("minecraft:silk_touch").maxLevel})

    globalToolCache.set(id, item)
    return item
  }
}

const toolList: string[] = ["minecraft:wooden_pickaxe", "minecraft:stone_pickaxe", "minecraft:iron_pickaxe", "minecraft:diamond_pickaxe", "minecraft:netherite_pickaxe", "minecraft:shears"]