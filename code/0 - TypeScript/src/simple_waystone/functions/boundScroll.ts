import { Block, EquipmentSlot, ItemComponentTypes, ItemStack, Player, world } from "@minecraft/server"
import { colorDimension, waystoneRotate, waystonOffset } from "../ui/listUI"
import { apiTeleportItem } from "../lib/item/teleportItem"
import { apiEquippable } from "../lib/player/equippable"
import { waystoneCache } from "../lib/cache/waystone"
import { apiWarn } from "../../0-lib/player/warn"

export function boundScrollTeleport(player: Player, item: ItemStack): void {
  const pos = item.getDynamicProperty("pos")
  const dim = item.getDynamicProperty("dim")
  if(typeof pos != "object" || typeof dim != "string") return apiWarn.notify(player, "item.warn.simple_waystone:bound_scroll.corrupted", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})

  if(apiTeleportItem["ws:return_scroll"](player, pos)) return

  const cache = waystoneCache.getWaystone(`${dim}/${pos.x},${pos.y},${pos.z}`)
  if(cache == undefined){
    const damage = item.getComponent(ItemComponentTypes.Durability)?.damage ?? 0
    const scroll = new ItemStack("ws:return_scroll")
    scroll.getComponent(ItemComponentTypes.Durability)!.damage = damage
    apiEquippable.setItem(player, scroll, EquipmentSlot.Mainhand)
    return apiWarn.notify(player, "item.warn.simple_waystone:bound_scroll.invalid_waystone", {type: "actionbar", sound: "warn.ender_addon_pack:break"})
  }

  const rot = player.getRotation()
  let target = {x: cache.pos.x +0.5, y: cache.pos.y, z: cache.pos.z +0.5}
  if(cache.offset == "auto"){
    const direction = (rot.y < 45 || rot.y > 325) ? "north" : (rot.y > 45 && rot.y < 135) ? "east" : (rot.y > 135 && rot.y < 225) ? "south" : "west"
    const offset = waystonOffset[direction] ?? ["y", 0]
    target[offset[0]] += offset[1]
  } else {
    const offset = waystonOffset[cache.offset] ?? ["y", 0]
    target[offset[0]] += offset[1] *2
  }
  player.teleport(target, {dimension: world.getDimension(dim), rotation: {x: 0, y: waystoneRotate[cache.offset] ?? rot.y}})
}

export function boundScrollRegister(player: Player, item: ItemStack, block: Block): void {
  const dim = block.dimension.id.replace("minecraft:", "")
  const cache = waystoneCache.getWaystone(`${dim}/${block.location.x},${block.location.y},${block.location.z}`)
  if(cache == undefined) return

  const waystoneName = `${colorDimension[cache.dimension] ?? ""}${cache.name}`
  apiWarn.notify(player, {translate: "item.warn.simple_waystone:bound_scroll.registered", with: [waystoneName]}, {type: "actionbar", sound: "warn.ender_addon_pack:pop"})
  if(item.typeId == "ws:bound_scroll"){
    item.setDynamicProperty("pos", block.location)
    item.setDynamicProperty("dim", dim)
    item.setLore([`§7Waystone: ${waystoneName}`])
    apiEquippable.setItem(player, item, EquipmentSlot.Mainhand)
    return
  }

  const damage = item.getComponent(ItemComponentTypes.Durability)?.damage ?? 0
  const scroll = new ItemStack("ws:bound_scroll")
  scroll.getComponent(ItemComponentTypes.Durability)!.damage = damage

  scroll.setDynamicProperty("pos", block.location)
  scroll.setDynamicProperty("dim", dim)
  scroll.setLore([`§7Waystone: ${waystoneName}`])
  apiEquippable.setItem(player, scroll, EquipmentSlot.Mainhand)
}