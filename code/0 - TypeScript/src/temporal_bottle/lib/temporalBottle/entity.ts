import { temporalBottleFuncBrewStand } from "../../functions/brewingStand"
import { temporalBottleFuncFurnace } from "../../functions/furnace"
import { world, system, Block, Entity } from "@minecraft/server"
import { furnaceFuelStoredAmount } from "../variables/cache"
import { temporalBottleBlock } from "./block"
import { temporalBottleInfo } from "./info"

const accelerationRunInterval = new Map<string, number>()

export const temporalBottleEntity = new class TemporalBottleEntity {
  createInterval(entity: Entity): void {
    const block = entity.dimension.getBlock(entity.location)
    if(!block) return

    const blockSpeed = temporalBottleBlock.getBlockTime(block.typeId)
    if(blockSpeed == undefined) return

    const speedTier = temporalBottleBlock.getCurrentSpeed(block)
    if(!speedTier) return

    const tickInterval = temporalBottleInfo.tickInterval(blockSpeed.time, speedTier.tier)

    const oldRunIntervalId = accelerationRunInterval.get(entity.id)
    oldRunIntervalId != undefined && system.clearRun(oldRunIntervalId)

    const runIntervalId = system.runInterval(() => {
      if(!entity.isValid){
        furnaceFuelStoredAmount.delete((block.x << 20) ^ (block.y << 10) ^ block.z)
        return system.clearRun(runIntervalId)
      }

      const execute = accelerationTypeFunc[blockSpeed.type]
      if(execute) execute(block)
    }, tickInterval)

    accelerationRunInterval.set(entity.id, runIntervalId)
  }
}

const accelerationTypeFunc: { [key: string]: (block: Block) => void } = {
  "furnace": (block) => temporalBottleFuncFurnace.smelt(block),
  "brewing_stand": (block) => temporalBottleFuncBrewStand.brewing(block)
}