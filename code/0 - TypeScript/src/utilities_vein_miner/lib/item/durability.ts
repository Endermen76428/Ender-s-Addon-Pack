import { world, ItemStack, EquipmentSlot, GameMode, Player } from "@minecraft/server"
import { apiEquippable } from "../player/equippable"
import { apiWarn } from "../../../0-lib/player/warn"

export const apiDurability = new class apiDurability {
  getDurability(item?: ItemStack, allowEnchant = false): number {
    const durability = item?.getComponent("durability")
    if(!durability) return Infinity
    if(allowEnchant && this.getUnbreakingLevel(item) > 0){
      const amount = this.getDurability(item)
      return amount + (amount / this.generateUnbreakingChange(item))
    }
    return durability.maxDurability - durability.damage
  }

  generateUnbreakingChange(item?: ItemStack): number {
    const enchant = this.getUnbreakingLevel(item)
    return 1/(enchant +1)
  }

  getUnbreakingLevel(item?: ItemStack): number {
    return item?.getComponent("enchantable")?.getEnchantment("unbreaking")?.level ?? 0
  }

  remove(player: Player, item: ItemStack, damage = 1, noBreak = false): boolean {
    if(player.getGameMode() == GameMode.Creative) return true

    if(player.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand)?.typeId !== item.typeId) return false

    const durability = item.getComponent("durability")
    if(!durability) return true

    damage = Math.min(Math.max(Math.floor(damage * this.generateUnbreakingChange(item)), 0), Infinity)
    if(damage < 1) damage = Math.random() < 0.5 ? 1 : 0

    if(noBreak){
      if(durability.damage + damage >= durability.maxDurability +1){
        durability.damage = durability.maxDurability
        apiEquippable.setItem(player, item, EquipmentSlot.Mainhand)
        return true
      }
    } else if(durability.damage + damage >= durability.maxDurability +1){
      apiWarn.notify(player, "", {sound: "warn.ender_addon_pack:break"})
      apiEquippable.setItem(player, undefined, EquipmentSlot.Mainhand)
      return true
    }

    durability.damage += damage
    apiEquippable.setItem(player, item, EquipmentSlot.Mainhand)
    return true
  }
}