import { temporalBottleBlock } from "../lib/temporalBottle/block"
import { temporalBottleItem } from "../lib/temporalBottle/bottle"
import { Block, Player, system, world } from "@minecraft/server"
import { apiWarn } from "../../0-lib/player/warn"
import { maxSpeedTier } from "../lib/variables"

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
  if(!ev.isFirstEvent) return
  const { block, player, itemStack: item } = ev

  if(item?.typeId == "temporal_bottle:temporal_bottle") if(enableTemporalAccelerate(block, player)) ev.cancel = true
})

function enableTemporalAccelerate(block: Block, player: Player): boolean {
  const currentSpeed = temporalBottleBlock.getCurrentSpeed(block)

  if(currentSpeed == undefined){
    if(temporalBottleItem.hasTime(player, 0)){
      system.run(() => {
        block.dimension.spawnEntity("temporal_bottle:temporal_zone", block.bottomCenter())
        temporalBottleItem.decreaseTime(player, 0)
      })
    }
    return true
  }

  if(currentSpeed.tier +1 < maxSpeedTier){
    if(currentSpeed.entity.getProperty("temporal_bottle:search") != 0){
      apiWarn.notify(player, "entity.warn.temporal_bottle:temporal_zone.search.can_not_increase", {sound: "warn.ender_addon_pack:bass"})
      return true
    }

    if(temporalBottleItem.hasTime(player, currentSpeed.tier +1)){
      system.run(() => {
        currentSpeed.entity.triggerEvent("temporal_bottle:increase_tier")
        temporalBottleItem.decreaseTime(player, currentSpeed.tier +1)
      })
      return true
    }
  }
  return false
}