import { world, Player, ItemStack, EquipmentSlot, EntityComponentTypes } from "@minecraft/server"
import { apiWandInfo } from "../wand"

export const apiConfig = new class ApiConfig {
  get(item: ItemStack): ConfigInfo {
    const size = (r => typeof r != "number" ? apiWandInfo.getMaxSize(item) : r)(item.getDynamicProperty("bw:size"))
    const connect = (r => typeof r != "boolean" ? true : r)(item.getDynamicProperty("bw:connect"))
    return { size, connect }
  }

  set(player: Player, item: ItemStack, config: ConfigInfo): void {
    item.setDynamicProperty("bw:size", config.size)
    item.setDynamicProperty("bw:connect", config.connect)

    player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, item)
  }
}

export interface ConfigInfo {
  size: number
  connect: boolean
}