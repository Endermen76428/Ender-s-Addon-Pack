import { world, EquipmentSlot, EntityComponentTypes, GameMode, Player } from "@minecraft/server"
import { AddonConfig } from "../../variables"
import { apiItemAmount } from "./itemAmount"
import { apiCooldown } from "../apiCooldown"
import { apiWarn } from "../../../0-lib/player/warn"

export const apiTeleportItem = new class ApiTeleportItem {
  [key: string]: (player: Player) => boolean

  "ws:warpstone"(player: Player): false {
    apiCooldown.set(player, "warpstoneCooldown", AddonConfig.itemCooldown)
    apiWarn.playSound(player, "simple_waystone.block.waystone.teleport", {delaySound: 1})
    return false
  }

  "ws:golden_feather"(player: Player): boolean {
    if(player.getGameMode() == GameMode.Creative) return false
    const removed = apiItemAmount.decreaseHand(player, "ws:golden_feather")
    if(removed) apiWarn.playSound(player, "simple_waystone.item.golden_feather.used", {delaySound: 1})
    return !removed
  }

  "ws:return_scroll"(player: Player): boolean {
    if(player.getGameMode() == GameMode.Creative) return false
    const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
    if(!item || item.typeId != "ws:return_scroll") return true
    const comp = item.getComponent("durability")
    if(!comp) return true
    apiWarn.playSound(player, "simple_waystone.item.return_scroll.used", {delaySound: 1})
    if(comp.damage +1 > comp.maxDurability){
      player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, undefined)
      return false
    }
    comp.damage += 1
    player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, item)
    return false
  }
}