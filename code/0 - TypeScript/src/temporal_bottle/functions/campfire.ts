import { world, Block, BlockComponentTypes } from "@minecraft/server"

export const temporalBottleFuncCampfire = new class TemporalBottleFuncCampfire {
  bake(block: Block): void {
    // Campfire doesn't have Inventory
    const blockInv = block.getComponent(BlockComponentTypes.Inventory)?.container
    if(!blockInv) return
  }
}