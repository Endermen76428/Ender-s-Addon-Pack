import { Block, Entity, EntityComponentTypes, EquipmentSlot, ItemStack, Player, system } from "@minecraft/server"
import { BackpackDimension, backpackSizeTier, backpackTypeTier, dimensionCenter } from "../lib/variables"

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

  brokenBlock(block: Block, id: string): void {
    const entities = block.dimension.getEntitiesAtBlockLocation(block.location)
    let entity: Entity | undefined = undefined

    for(let i = 0, len = entities.length; i < len; i++){
      const e = entities[i]
      if(e == undefined || e.isValid == false) continue
      if(e.typeId != "travel_backpack:backpack") continue

      const inv = e.getComponent(EntityComponentTypes.Inventory)?.container
      if(inv == undefined) continue

      const tier = backpackSizeTier[inv.size]
      if(tier == undefined) continue

      if(backpackTypeTier[tier] == id){
        entity = e
        break
      }
    }

    if(entity == undefined) return

    const item = new ItemStack(id)
    if(!item) return

    item.setDynamicProperty("id", entity.id)
    item.setLore([{translate: "lore.travel_backpack:backpack.id", with: [entity.id]}])
    entity.dimension.spawnItem(item, block.center())

    entity.setDynamicProperty("pos", undefined)
    entity.triggerEvent("travel_backpack:remove_on_ground")
    entity.teleport(dimensionCenter, {dimension: BackpackDimension})
  }
}