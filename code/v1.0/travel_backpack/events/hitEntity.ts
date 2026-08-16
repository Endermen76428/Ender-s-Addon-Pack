import { removeBackpack } from "../functions/remove"
import { world, Player } from "@minecraft/server"

world.afterEvents.entityHitEntity.subscribe(({damagingEntity: player, hitEntity: entity}) => {
  if(!(player instanceof Player)) return

  if(player.isSneaking && entity.typeId == "travel_backpack:backpack"){ return removeBackpack.remove(player, entity) }
})