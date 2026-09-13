import { world, ItemStack, Entity, EquipmentSlot, EntityComponentTypes } from "@minecraft/server"

export const apiEquippable = new class apiEquippable {
  getItem(entity: Entity, slot: EquipmentSlot): ItemStack | undefined {
    const equippable = entity.getComponent(EntityComponentTypes.Equippable)
    if(!equippable) return
    return equippable.getEquipment(slot)
  }

  setItem(entity: Entity, item: ItemStack | undefined, slot: EquipmentSlot): void {
    const equippable = entity.getComponent(EntityComponentTypes.Equippable)
    if(!equippable) return
    equippable.setEquipment(slot, item)
  }
}

interface ItemSlot {
  item: ItemStack,
  slot: EquipmentSlot
}