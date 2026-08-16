import { cachePlayerBottleSlot } from "../lib/variables/cache"
import { apiInventory } from "../lib/player/inventory"
import { world, Player } from "@minecraft/server"

world.afterEvents.playerInventoryItemChange.subscribe(({player, slot, beforeItemStack: oldItem, itemStack: newItem}) => {
  const remove = oldItem?.typeId == "temporal_bottle:temporal_bottle"
  const add = newItem?.typeId == "temporal_bottle:temporal_bottle"

  if(remove || add) return checkTemporalBottle(player, slot, add)
})

function checkTemporalBottle(player: Player, slot: number, add: boolean): void {
  if(add && cachePlayerBottleSlot.get(player.id) == slot) return

  const item = apiInventory.getItem(player, "temporal_bottle:temporal_bottle")

  if(!item){
    player.removeTag("has_temporal_bottle")
    cachePlayerBottleSlot.delete(player.id)
    return
  }

  cachePlayerBottleSlot.set(player.id, slot != item.slot ? item.slot : slot)
  player.addTag("has_temporal_bottle")
}