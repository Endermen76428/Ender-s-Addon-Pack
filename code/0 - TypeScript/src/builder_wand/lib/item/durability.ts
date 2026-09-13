import { world, EquipmentSlot, EntityComponentTypes, ItemComponentTypes, ItemStack, Player } from "@minecraft/server"
import { apiEquippable } from "../player/equippable"

export const apiDurability = new class ApiDurability {
  getDurability(item?: ItemStack): number {
    const durability = item?.getComponent(ItemComponentTypes.Durability)
    if(!durability) return Infinity

    const unbreakingLv = this.getUnbreakingLevel(item)
    if(unbreakingLv > 0){
      const amount = durability.maxDurability - durability.damage
      return amount + (amount / this.generateUnbreakingChange(item, unbreakingLv))
    }

    return durability.maxDurability - durability.damage
  }

  remove(player: Player, item: ItemStack, damage = 1, noBreak = false): boolean {
    const equippable = player.getComponent(EntityComponentTypes.Equippable)
    if(!equippable) return false

    if(equippable.getEquipment(EquipmentSlot.Mainhand)?.typeId !== item.typeId) return false

    const durability = item.getComponent(ItemComponentTypes.Durability)
    if(!durability) return true

    damage = Math.min(Math.max(Math.floor(damage * this.generateUnbreakingChange(item)), 0), Infinity)
    if(damage < 1) damage = Math.random() < 0.5 ? 1 : 0

    if(durability.damage + damage >= durability.maxDurability +1){
      durability.damage = durability.maxDurability
      apiEquippable.setItem(player, item, EquipmentSlot.Mainhand)
      return true
    }

    durability.damage += damage
    apiEquippable.setItem(player, item, EquipmentSlot.Mainhand)
    return true
  }

  private generateUnbreakingChange(item?: ItemStack, unbreaking?: number): number {
    const enchant = unbreaking ?? this.getUnbreakingLevel(item)
    return 1/(enchant +1)
  }

  private getUnbreakingLevel(item?: ItemStack): number {
    return item?.getComponent(ItemComponentTypes.Enchantable)?.getEnchantment("unbreaking")?.level ?? 0
  }
}