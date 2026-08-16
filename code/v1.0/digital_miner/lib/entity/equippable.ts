import { world, Entity, EquipmentSlot, ItemStack } from "@minecraft/server"

export const apiEquippable = new class ApiEquippable {
  getItemSlot(entity: Entity, slot: EquipmentSlot): ItemStack | undefined {
    const equippable = entity.getComponent("equippable")
    if(!equippable) return
    return equippable.getEquipment(slot)
  }

  setItem(entity: Entity, item: ItemStack | undefined, slot: EquipmentSlot, sameItem = true): void {
    const equippable = entity.getComponent("equippable")
    if(!equippable) return
    if(sameItem) if(this.getItemSlot(entity, slot)?.typeId != item?.typeId) return
    equippable.setEquipment(slot, item)
  }
}

interface ItemSlot {
  item: ItemStack,
  slot: EquipmentSlot
}