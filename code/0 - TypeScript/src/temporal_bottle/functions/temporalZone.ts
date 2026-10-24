import { blocksTimeList, temporalBottleBlock } from "../lib/temporalBottle/block"
import { Block, BlockComponentTypes, Entity } from "@minecraft/server"
import { temporalBottleFuncBrewingStand } from "./blocks/brewingStand"
import { temporalBottleFuncFurnace } from "./blocks/furnace"
import { addToGlobalLoop } from "../../1-bacs/globalLoop"

export const temporalZone = new class TemporalZone {
  create(entity: Entity): void {
    const block = entity.dimension.getBlock(entity.location)
    if(block == undefined || !block.isValid) return

    const blockSpeed = blocksTimeList[block.typeId]
    if(blockSpeed == undefined) return

    const speedTier = temporalBottleBlock.getCurrentSpeed(block)
    if(!speedTier) return

    let multiplier = 1 << (speedTier.tier +1)
    multiplier = multiplier < 0 ? 2147483647 : multiplier

    const exe = accelerationTypeFunc[blockSpeed.type]
    exe && exe(entity, block, 1 << (speedTier.tier +1), blockSpeed.time)
  }
}

const accelerationTypeFunc: { [key: string]: (entity: Entity, block: Block, multiplier: number, time: number) => void } = {
  "furnace": (entity, block, multiplier, time) => {
    const inventory = block.getComponent(BlockComponentTypes.Inventory)?.container
    if(inventory == undefined) return

    temporalBottleFuncFurnace.add(entity, block, inventory, multiplier, time *20) // Transforma o tempo de duração da ação em ticks
    addToGlobalLoop("temporalBottleFurnace")
  },

  "brewing_stand": (entity, block, multiplier, time) => {
    const inventory = block.getComponent(BlockComponentTypes.Inventory)?.container
    if(inventory == undefined) return

    temporalBottleFuncBrewingStand.add(entity, block, inventory, multiplier, time *20) // Transforma o tempo de duração da ação em ticks
    addToGlobalLoop("temporalBottleBrewingStand")
  }
}