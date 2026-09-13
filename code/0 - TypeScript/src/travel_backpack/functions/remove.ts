import { Entity, EntityComponentTypes, EquipmentSlot, ItemStack, Player } from "@minecraft/server"

export const removeBackpack = new class RemoveBackpack {
  remove(player: Player, entity: Entity): void {
    const block = entity.dimension.getBlock(entity.location)
    if(!block || !block.isValid) return

    entity.setDynamicProperty("pos", undefined)
    entity.triggerEvent("travel_backpack:remove_on_ground")

    try {
      const item = new ItemStack(block.typeId)
      if(!item) return

      item.setDynamicProperty("id", entity.id)
      item.setLore([{translate: "lore.travel_backpack:backpack.id", with: [entity.id]}])

      entity.dimension.runCommand(`setblock ${block.x} ${block.y} ${block.z} air destroy`)

      const equippable = player.getComponent(EntityComponentTypes.Equippable)
      const hand = equippable?.getEquipment(EquipmentSlot.Mainhand)
      if(hand == undefined){
        equippable?.setEquipment(EquipmentSlot.Mainhand, item)
      } else {
        entity.dimension.spawnItem(item, block.center())
      }
    } catch {}

    entity.teleport({x: player.location.x, y: player.dimension.heightRange.min +1, z: player.location.z}, {dimension: player.dimension})
  }
}