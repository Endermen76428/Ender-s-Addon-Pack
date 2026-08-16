import { world, ItemStack, EntityComponentTypes, EquipmentSlot, Player } from "@minecraft/server"

export const apiItemAmount = new class ApiItemAmount {
  decreaseHand(player: Player, sameItem?: string): boolean {
    const comp = player.getComponent(EntityComponentTypes.Equippable)
    if(!comp) return false

    const item = comp.getEquipment(EquipmentSlot.Mainhand)

    if(!item) return false
    if(sameItem && item.typeId != sameItem) return false

    if(item.amount -1 < 1){
      comp.setEquipment(EquipmentSlot.Mainhand, undefined)
      return true
    }

    item.amount -= 1
    comp.setEquipment(EquipmentSlot.Mainhand, item)
    return true
  }
}