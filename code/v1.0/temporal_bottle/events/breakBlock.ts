import { temporalBottleBlock } from "../lib/temporalBottle/block"
import { world, system } from "@minecraft/server"

world.beforeEvents.playerBreakBlock.subscribe((ev) => {
  const { block } = ev

  const entity = temporalBottleBlock.getCurrentSpeed(block)
  if(entity) if(entity.entity.isValid) system.run(() => { entity.entity.remove() } )
})