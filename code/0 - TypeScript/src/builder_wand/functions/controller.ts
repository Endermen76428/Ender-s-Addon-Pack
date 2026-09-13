import { world, system, Vector3, GameMode } from "@minecraft/server"
import { GetBLocksInfo } from "../lib/block/getBlocks"
import { apiDurability } from "../lib/item/durability"
import { apiInventory } from "../lib/player/inventory"
import { apiWarn } from "../../0-lib/player/warn"
import { showBorders } from "./preview"
import { placeBlocks } from "./place"

export function functionController(info: GetBLocksInfo, blocks: Vector3[], direction: Vector3, preOffsets: [number, number, number, string][]): void {
  const { type, player, blockIds, blockFace, item } = info

  const ids = [...blockIds]

  const isCreativeWand = item.hasTag("builder_wand:creative_wand")
  const isCreative = player.getGameMode() == GameMode.Creative || isCreativeWand
  const inventoryItems = isCreative ? {list: [], amount: Infinity} : apiInventory.getItems(player, ids, blocks.length)
  const limit = inventoryItems.amount > blocks.length ? blocks.length : inventoryItems.amount

  const selectedBlocks = blocks.slice(0, limit)

  if(type == "preview"){
    apiWarn.notify(player, {translate: "warning.builder_wand:will_place", with: [String(limit)]}, {type: "actionbar"})
    system.runJob(showBorders(player, selectedBlocks, blockFace, preOffsets))
    return
  }

  if(!isCreative && type == "place"){
    // Se falhar em retirar a durabilidade ele volta e não executa o place
    if(!apiDurability.remove(player, item, selectedBlocks.length, true)) return
  }

  system.runJob(placeBlocks(player, ids, selectedBlocks, direction, inventoryItems))
}