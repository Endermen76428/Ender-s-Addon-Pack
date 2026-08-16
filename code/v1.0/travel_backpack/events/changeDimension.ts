import { world, EntityComponentTypes, system } from "@minecraft/server"
import { addPlayerHoldListen } from "../functions/hold"

world.afterEvents.playerDimensionChange.subscribe(({player}) => {
  system.runTimeout(() => {
    if(!player.isValid) return

    const hand = player.getComponent(EntityComponentTypes.Inventory)?.container.getItem(player.selectedSlotIndex)
    if(!hand || !hand.hasTag("travel_backpack:backpack")) return

    addPlayerHoldListen(player, hand, player.selectedSlotIndex)
  }, 40)
})