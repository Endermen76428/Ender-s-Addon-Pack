import { temporalBottleItem } from "../lib/temporalBottle/bottle"
import { cachePlayerBottleSlot } from "../lib/variables/cache"
import { apiInventory } from "../lib/player/inventory"
import { world, system } from "@minecraft/server"
import "./customComponent/startUp"
import "./playerInteractBlock"
import "./inventoryChange"
import "./scriptEvent"
import "./breakBlock"

system.runInterval(() => {
  for(const player of world.getPlayers({tags: ["has_temporal_bottle"]})){
    temporalBottleItem.increaseTime(player)
  }
}, 20)

system.run(() => {
  world.getPlayers().forEach(player => {
    const item = apiInventory.getItem(player, "temporal_bottle:temporal_bottle")
    if(item){
      player.addTag("has_temporal_bottle")
      cachePlayerBottleSlot.set(player.id, item.slot)
    }
  })
})