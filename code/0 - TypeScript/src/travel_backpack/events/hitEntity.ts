import { removeBackpack } from "../functions/remove"
import { apiWarn } from "../../0-lib/player/warn"
import { world, Player } from "@minecraft/server"

world.afterEvents.entityHitEntity.subscribe(({damagingEntity: player, hitEntity: entity}) => {
  if(!(player instanceof Player)) return

  if(entity.typeId != "travel_backpack:backpack") return

  if(player.isSneaking){
    removeBackpack.remove(player, entity)
  } else {
    apiWarn.notify(player, "item.warn.travel_backpack:backpack.need_shift.remove", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})
  }
})