import { Block, Entity, system } from "@minecraft/server"

export const temporalBottleBlock = new class TemporalBottleBlock {
  getCurrentSpeed(block: Block): EntitiesTier | undefined {
    const entities = block.dimension.getEntitiesAtBlockLocation(block).filter(value => value.typeId == "temporal_bottle:temporal_zone")
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
}

// ---------------------
// Time in Seconds
// ---------------------
export const blocksTimeList: { [key: string]: BlockTime } = {
  "minecraft:furnace": {type: "furnace", time: 10},
  "minecraft:lit_furnace": {type: "furnace", time: 10},
  "minecraft:blast_furnace": {type: "furnace", time: 5},
  "minecraft:lit_blast_furnace": {type: "furnace", time: 5},
  "minecraft:smoker": {type: "furnace", time: 5},
  "minecraft:lit_smoker": {type: "furnace", time: 5},

  "minecraft:brewing_stand": {type: "brewing_stand", time: 20},

  "minecraft:hopper": {type: "hopper", time: 2.5} // 2.5 itens por segundo = 1 item a cada 8 ticks
}

interface EntitiesTier {
  entity: Entity
  tier: number
}

interface BlockTime {
  type: "brewing_stand" | "furnace" | "hopper"
  time: number
}