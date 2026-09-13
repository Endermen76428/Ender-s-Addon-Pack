import { world, system, BlockPermutation, Entity, EntityComponentTypes, ItemStack } from "@minecraft/server"

const cacheCraftPatterns = new Map<string, false | CraftPatternInfo>([["////////", false]]) // Pattern Id > Denied Craft + Output Id + No Consumed Items
const cachebackpackGetting = new Set<string>() // Backpack Id

export const craftUpgradeRecipes = new class CraftUpgradeRecipes {
  getResult(backapck: Entity, pattern: string, items: ItemsList): CraftPatternInfo | undefined {
    const result = cacheCraftPatterns.get(pattern)
    if(result) return result

    if(result == undefined){
      if(cachebackpackGetting.has(backapck.id)) return

      cachebackpackGetting.add(backapck.id)
      this.generateUnknownRecipe(backapck, pattern, items)
      return
    }
    return
  }

  private generateUnknownRecipe(backpack: Entity, pattern: string, items: ItemsList): void {
    const minHeight = {x: backpack.location.x, y: backpack.dimension.heightRange.min, z: backpack.location.z}

    const crafterBlock = backpack.dimension.getBlock(minHeight)
    if(!crafterBlock || !crafterBlock.isValid) return

    const trapdoorBlock = crafterBlock.north(1)
    const redstoneBlock = crafterBlock.south(1)
    if(!trapdoorBlock || !redstoneBlock) return

    crafterBlock.setPermutation(BlockPermutation.resolve("minecraft:crafter", {"orientation": "north_up"}))
    trapdoorBlock.setType("minecraft:trapdoor")

    for(let i = 0, len = items.length; i < len; i++){
      const item = items[i]
      item && backpack.runCommand(`replaceitem block ${crafterBlock.x} ${crafterBlock.y} ${crafterBlock.z} slot.container ${i} ${item.typeId}`)
    }

    redstoneBlock.setType("minecraft:redstone_block")
    system.runTimeout(() => {
      const entities = backpack.dimension.getEntitiesAtBlockLocation(trapdoorBlock)
      let gettedItem: ItemStack | undefined
      let remnant: CraftInfo[] = []
      for(let i = 0, len = entities.length; i < len; i++){
        const entity = entities[i]
        if(!entity || entity.typeId != "minecraft:item") continue

        const itemComp = entity.getComponent(EntityComponentTypes.Item)?.itemStack
        if(!itemComp) continue

        entity.remove()
        if(!gettedItem){
          gettedItem = itemComp
        } else {
          remnant.push({output: itemComp.typeId, amount: itemComp.amount})
        }
      }

      trapdoorBlock.setType("minecraft:bedrock")
      redstoneBlock.setType("minecraft:bedrock")

      if(gettedItem == undefined){
        cachebackpackGetting.delete(backpack.id)
        cacheCraftPatterns.set(pattern, false)
        backpack.runCommand(`setblock ${crafterBlock.x} ${crafterBlock.y} ${crafterBlock.z} bedrock`)
        return
      }

      cachebackpackGetting.delete(backpack.id)
      crafterBlock.setType("minecraft:bedrock")

      cacheCraftPatterns.set(pattern, {output: gettedItem.typeId, amount: gettedItem.amount, remnant: remnant.length > 0 ? remnant : undefined})
    }, 7)
  }
}

type ItemsList = (ItemStack | undefined)[]
interface CraftPatternInfo extends CraftInfo {
  remnant?: CraftInfo[]
}

interface CraftInfo {
  output: string
  amount: number
}