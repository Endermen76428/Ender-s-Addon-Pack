import { world, ItemStack, Player, EquipmentSlot, GameMode } from "@minecraft/server"
import { cachePlayerBottleSlot } from "../variables/cache"
import { apiEquippable } from "../player/equippable"
import { apiInventory } from "../player/inventory"
import { timeCostByUse } from "../variables/cache"
import { temporalBottleInfo } from "./info"

export const temporalBottleItem = new class TemporalBottleItem {
  increaseTime(player: Player): void {
    const slot = cachePlayerBottleSlot.get(player.id)
    if(slot == undefined) return

    const item = apiInventory.getItemSlot(player, slot)
    if(!item || item.typeId != "temporal_bottle:temporal_bottle") return

    const time = (r => typeof r != "number" ? 0 : r)(item.getDynamicProperty("bottle:time")) +1
    item.setDynamicProperty("bottle:timeT", (r => typeof r != "number" ? r == undefined ? time : 1 : r +1)(item.getDynamicProperty("bottle:timeT")))

    this.updateTimeText(item, time)
    apiInventory.setItem(player, item, slot)
    return
  }

  decreaseTime(player: Player, tier = 0): void {
    if(player.getGameMode() == GameMode.Creative) return

    const item = apiEquippable.getItemSlot(player, EquipmentSlot.Mainhand)
    if(!item || item.typeId != "temporal_bottle:temporal_bottle") return

    const time = (r => typeof r != "number" ? 0 : r)(item.getDynamicProperty("bottle:time")) - temporalBottleInfo.timeByTier(tier)

    this.updateTimeText(item, time)
    return apiEquippable.setItem(player, item, EquipmentSlot.Mainhand)
  }

  setTime(player: Player, time: number, slot?: number): void {
    let item: { item: ItemStack, slot: number }
    if(slot){
      const itemSlot = apiInventory.getItemSlot(player, slot)
      if(!itemSlot) return
      item = {item: itemSlot, slot}
    } else {
      const itemSlot = apiInventory.getItem(player, "temporal_bottle:temporal_bottle")
      if(!itemSlot) return
      item = itemSlot
    }

    item.item.setDynamicProperty("bottle:time")
    item.item.setDynamicProperty("bottle:timeT", time)
    this.updateTimeText(item.item, time)
    apiInventory.setItem(player, item.item, item.slot)
  }

  hasTime(player: Player, tier = 0): boolean {
    if(player.getGameMode() == GameMode.Creative) return true

    const item = apiEquippable.getItemSlot(player, EquipmentSlot.Mainhand)
    if(!item || item.typeId != "temporal_bottle:temporal_bottle") return false

    let currentTime = item.getDynamicProperty("bottle:time")
    if(typeof currentTime != "number") currentTime = 0

    return currentTime >= timeCostByUse * (2 ** tier)
  }

  getTime(player: Player, slot?: number): number {
    let item: { item: ItemStack, slot: number }
    if(slot){
      const itemSlot = apiInventory.getItemSlot(player, slot)
      if(!itemSlot) return -1
      item = {item: itemSlot, slot}
    } else {
      const itemSlot = apiInventory.getItem(player, "temporal_bottle:temporal_bottle")
      if(!itemSlot) return -1
      item = itemSlot
    }

    let currentTime = item.item.getDynamicProperty("bottle:time")
    if(typeof currentTime != "number") currentTime = 0

    return currentTime
  }

  private updateTimeText(item: ItemStack, time: number): void {
    item.setDynamicProperty("bottle:time", time)
    const totalTime = (r => typeof r != "number" ? 0 : r)(item.getDynamicProperty("bottle:timeT"))

    const day = (time/86400|0), TDay = (totalTime/86400|0)
    const hour = ((time % 86400)/3600|0), THour = ((totalTime % 86400)/3600|0)
    const minute = ((time % 3600)/60|0).toString().padStart(2, "0"), TMinute = ((totalTime % 3600)/60|0).toString().padStart(2, "0")
    const second = (time % 60).toString().padStart(2, "0"), TSecond = (totalTime % 60).toString().padStart(2, "0")
    item.setLore([
      {translate: "item_subtitle.temporal_bottle:stored_time", with: [`${day < 1 ? "" : `${day}:`}${hour < 1 ? "" : `${hour.toString().padStart(2, "0")}:`}${minute}:${second}`]},
      {translate: "item_subtitle.temporal_bottle:total_time", with: [`${TDay < 1 ? "" : `${TDay}:`}${THour < 1 ? "" : `${THour.toString().padStart(2, "0")}:`}${TMinute}:${TSecond}`]}
    ])
  }
}