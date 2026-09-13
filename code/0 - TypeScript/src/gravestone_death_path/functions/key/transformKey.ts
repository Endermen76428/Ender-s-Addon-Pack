import { world, ItemStack, EntityComponentTypes, Player } from "@minecraft/server"
import { apiInventory } from "../../lib/player/inventory"
import { apiConfigAdmin } from "../../lib/configAdmin"
import { apiWarn } from "../../../0-lib/player/warn"

export function transformIntoTpKey(player: Player): void {
  if(!apiConfigAdmin.get("teleport")) return apiWarn.notify(player, "item.warn.gravestone_death_path:key.teleport_disabled", {sound: "warn.ender_addon_pack:break"})

  const playerInv = player.getComponent(EntityComponentTypes.Inventory)?.container
  if(!playerInv) return

  // Find any ender pearl on player's inventory
  let { item, slot } = apiInventory.getItems(playerInv, "minecraft:ender_pearl")[0] ?? {}
  if(!item || slot == undefined) return apiWarn.notify(player, "ui.warn.gravestone_death_path:key.no_ender_pearl", {sound: "warn.ender_addon_pack:bass"})

  const handItem = playerInv.getItem(player.selectedSlotIndex)
  if(!handItem || handItem.typeId != "gravestone_death_path:gravestone_key") return apiWarn.notify(player, "ui.warn.gravestone_death_path:key.invalid_hand_key", {sound: "warn.ender_addon_pack:break"})

  if(item.amount -1 == 0) item = undefined
  else item.amount--
  playerInv.setItem(slot, item)

  // Transfer all info in normal key to teleport key
  const tpKey = new ItemStack("gravestone_death_path:gravestone_key_tp")

  tpKey.setLore(handItem.getLore())
  handItem.getDynamicPropertyIds().forEach(id => {
    tpKey.setDynamicProperty(id, handItem.getDynamicProperty(id))
  })

  playerInv.setItem(player.selectedSlotIndex, tpKey)
  apiWarn.notify(player, "ui.warn.gravestone_death_path:key.transformated_into_tp", {sound: "warn.ender_addon_pack:levelup"})
}