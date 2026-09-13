import { world, system, Block, Entity } from "@minecraft/server"

export const temporalBottleBlock = new class TemporalBottleBlock {
  getCurrentSpeed(block: Block): EntitiesTier | undefined {
    const entities = block.dimension.getEntitiesAtBlockLocation(block).filter(value => value.typeId == "temporal_bottle:temporal_bottle_entity")
    if(entities.length == 0) return

    const entitiesTier: EntitiesTier[] = entities.map(value => {
      const tier = value.getProperty("temporal_bottle:tier")
      return { entity: value, tier: typeof tier != "number" ? 0 : tier }
    })

    const highTierIndex = this.getHighestTierIndex(entitiesTier)
    system.run(() => { entities.forEach((value, index) => index != highTierIndex && value.isValid && value.remove()) })
    return entitiesTier[highTierIndex]
  }

  private getHighestTierIndex(entities: EntitiesTier[]): number {
    let highestTier = 0

    for(let i = 0; i < entities.length; i++){
      if((entities[i]?.tier ?? 0) > (entities[highestTier]?.tier ?? 0)) highestTier = i
    }

    return highestTier
  }

  getBlockTime(blockId: string): BlockTime | undefined {
    const furnace = furnaceTimeList[blockId]
    if(furnace) return { type: "furnace", time: furnace}

    const hopper = hopperTimeList[blockId]
    if(hopper) return { type: "hopper", time: hopper}
    const brewingStand = brewingStandTimeList[blockId]
    if(brewingStand) return { type: "brewing_stand", time: brewingStand}
    return
  }
}

// ---------------------
// Time in Seconds
// ---------------------
const brewingStandTimeList: { [key: string]: number } = {
  "minecraft:brewing_stand": 30
}

const furnaceTimeList: { [key: string]: number } = {
  "minecraft:furnace": 10,
  "minecraft:blast_furnace": 5,
  "minecraft:smoker": 5,

  "minecraft:lit_furnace": 10,
  "minecraft:lit_blast_furnace": 5,
  "minecraft:lit_smoker": 5
}

const hopperTimeList: { [key: string]: number } = {
  "minecraft:hopper": 2.5
}

interface EntitiesTier {
  entity: Entity
  tier: number
}

interface BlockTime {
  type: "brewing_stand" | "campfire" | "furnace" | "hopper"
  time: number
}