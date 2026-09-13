import { world, BlockPermutation, ItemStack, Block, EquipmentSlot, Player } from "@minecraft/server"
import { teleporterPadInfo } from "../../lib/teleporter/info"
import { teleporterPadCache } from "../../lib/cache/teleporter"
import { apiEquippable } from "../../lib/player/equippable"
import { apiWarn } from "../../../0-lib/player/warn"
import { teleporterPadSpace } from "../../lib/teleporter/space"

export const teleporterPadInteract = new class TeleporterPadInteract {
  place(block: Block, player: Player): void {
    const item = apiEquippable.getItem(player, EquipmentSlot.Mainhand)
    if(!item || !item.hasTag("simple_waystone:teleport_shard")) return

    const savedDimension = item.getDynamicProperty("0"), savedPos = item.getDynamicProperty("1")
    if(typeof savedDimension != "string" || typeof savedPos != "object") return this.registerShard(block, player, item)

    if(block.dimension.id == savedDimension && block.x == savedPos.x && block.y == savedPos.y && block.z == savedPos.z) return apiWarn.notify(player, "warning.simple_waystone:teleporter.place_shard.same", {sound: "warn.ender_addon_pack:bass"})

    if(teleporterPadCache.getTeleporter(`${savedDimension.replace("minecraft:", "")}/${savedPos.x},${savedPos.y},${savedPos.z}`) == undefined){
      apiEquippable.setItem(player, new ItemStack(item.typeId), EquipmentSlot.Mainhand)
      return apiWarn.notify(player, "warning.simple_waystone:teleporter.place_shard.target_no_longer_exist", {sound: "warn.ender_addon_pack:bass"})
    }

    block.setPermutation(BlockPermutation.resolve("ws:teleporter_pad", {
      "ws:broken": item.typeId.endsWith("_broken"),
      "minecraft:cardinal_direction": block.permutation.getState("minecraft:cardinal_direction") ?? "south"
    }))
    apiEquippable.setItem(player, undefined, EquipmentSlot.Mainhand)

    teleporterPadInfo.putShard(block, player.id, savedDimension, savedPos, item.typeId.endsWith("_broken"))
  }

  private registerShard(block: Block, player: Player, item: ItemStack): void {
    teleporterPadInfo.remove(block)
    teleporterPadSpace.setFullPad(block, item.typeId.endsWith("_broken"))
    apiEquippable.setItem(player, undefined, EquipmentSlot.Mainhand)
  }

  remove(block: Block, player: Player): void {
    if(!player.isSneaking) return

    const id = `${block.dimension.id.replace("minecraft:", "")}/${block.x},${block.y},${block.z}`
    const teleporter = teleporterPadCache.getTeleporter(id)

    if(!teleporter || teleporter == true) return
    if(player.id != teleporter.owner) return apiWarn.notify(player, "warning.simple_waystone:teleporter.not_owner", {sound: "warn.ender_addon_pack:bass"})

    teleporterPadInfo.removeShard(block)
    teleporterPadSpace.spawnShard(block, teleporter.dimension, teleporter.pos)
  }
}