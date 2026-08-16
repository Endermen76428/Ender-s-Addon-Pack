import { PlayerInteractWithBlockBeforeEvent as BeforeInteractBlock } from "@minecraft/server"
import { temporalBottleBlock } from "../lib/temporalBottle/block"
import { temporalBottleItem } from "../lib/temporalBottle/bottle"
import { maxSpeedTier } from "../lib/variables/cache"
import { world, system } from "@minecraft/server"

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
  if(!ev.isFirstEvent) return

  if(enableTemporalAccelerate(ev)) return
})

function enableTemporalAccelerate(ev: BeforeInteractBlock): boolean {
  const { block, player, itemStack: item } = ev

  if(item?.typeId != "temporal_bottle:temporal_bottle") return false
  const currentSpeed = temporalBottleBlock.getCurrentSpeed(block)

  if(!currentSpeed){
    if(temporalBottleItem.hasTime(player, 0)){
      ev.cancel = true
      system.run(() => {
        block.dimension.spawnEntity("temporal_bottle:temporal_bottle_entity", block.bottomCenter())
        temporalBottleItem.decreaseTime(player, 0)
      })
    }
    return true
  }

  if(currentSpeed.tier +1 < maxSpeedTier){
    if(temporalBottleItem.hasTime(player, currentSpeed.tier +1)){
      system.run(() => {
        currentSpeed.entity.triggerEvent("temporal_bottle:increase_tier")
        temporalBottleItem.decreaseTime(player, currentSpeed.tier +1)
      })
      ev.cancel = true
      return true
    }
  }
  return false
}