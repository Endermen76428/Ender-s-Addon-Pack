import { system, world } from "@minecraft/server"
import { apiWarn } from "../../0-lib/player/warn"

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
  if(ev.isFirstEvent == false) return
  if(ev.itemStack?.hasTag("travel_backpack:backpack") != true) return
  if(ev.player.isSneaking == false){
    ev.cancel = true
    system.run(() => {
      apiWarn.notify(ev.player, "item.warn.travel_backpack:backpack.need_shift.place", {type: "actionbar", sound: "warn.ender_addon_pack:pop"})
    })
    return
  }
})