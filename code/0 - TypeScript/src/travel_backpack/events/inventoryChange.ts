import { addPlayerHoldListen } from "../functions/hold"
import { world } from "@minecraft/server"

const backpackTag = "travel_backpack:backpack"

world.afterEvents.playerInventoryItemChange.subscribe(({player, slot, itemStack, beforeItemStack}) => {
  const currentBackpackId = (r => typeof r != "string" ? undefined : r)(itemStack?.getDynamicProperty("id"))
  const oldBackpackId = (r => typeof r != "string" ? undefined : r)(beforeItemStack?.getDynamicProperty("id"))

  if(currentBackpackId) if(currentBackpackId == oldBackpackId) return

  if(slot == player.selectedSlotIndex){
    if(itemStack?.hasTag(backpackTag)){
      addPlayerHoldListen(player, itemStack, slot)
      return
    }
  }
})