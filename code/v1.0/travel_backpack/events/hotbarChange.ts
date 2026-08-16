import { addPlayerHoldListen } from "../functions/hold"
import { world } from "@minecraft/server"

world.afterEvents.playerHotbarSelectedSlotChange.subscribe(({player, itemStack, newSlotSelected}) => {
  if(itemStack && itemStack.hasTag("travel_backpack:backpack")){
    addPlayerHoldListen(player, itemStack, newSlotSelected)
    return
  }
})