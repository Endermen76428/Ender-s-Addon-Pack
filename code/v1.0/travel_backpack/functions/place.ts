import { world, Block, Direction, EntityComponentTypes, EquipmentSlot, GameMode, ItemStack, Player, Vector3, system } from "@minecraft/server"
import { spawnBackpack } from "../lib/backpack/spawn"

export const placeBackpack = new class PlaceBackpack {
  place(player: Player, item: ItemStack, blockTarget: Block, direction: Direction): void {
    const offset = offsetDirection[direction]

    const block = blockTarget.hasTag("travel_backpack:backpack") ? blockTarget : blockTarget.offset(offset)
    if(!block || !block.isValid) return

    if(!block.hasTag("travel_backpack:backpack")) return

    if(!player.isSneaking){
      block.setType("minecraft:air")
      player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, item)
      return
    }

    // Remove a backpack no criativo para evitar bug
    if(player.getGameMode() == GameMode.Creative){
      player.getComponent(EntityComponentTypes.Equippable)?.setEquipment(EquipmentSlot.Mainhand, undefined)
    }

    const entityPos = { x: block.x +0.5, y: block.y, z: block.z +0.5 }
    const backpackId = item.getDynamicProperty("id")

    // Pega a entidade da Área de Salvamento
    if(typeof backpackId == "string"){
      const savedEntity = world.getEntity(backpackId)
      if(savedEntity){
        savedEntity.teleport(entityPos, {dimension: player.dimension})

        savedEntity.triggerEvent("travel_backpack:add_on_ground")

        savedEntity.setDynamicProperty("pos", entityPos)
        return
      }
    }

    // Se a entitidade não conseguir ser pega, vai gerar uma nova
    const entity = spawnBackpack(player, item.typeId)
    entity.triggerEvent("travel_backpack:add_on_ground")

    entity.setDynamicProperty("pos", entityPos) // Caso a entidade saia do bloco ele vai mandar o ScriptEvent e usar isso para voltar para o local certo
  }
}

const offsetDirection: Record<Direction, Vector3> = {
  "North": { x:  0, y:  0, z: -1 },
  "South": { x:  0, y:  0, z:  1 },
  "East":  { x:  1, y:  0, z:  0 },
  "West":  { x: -1, y:  0, z:  0 },
  "Up":    { x:  0, y:  1, z:  0 },
  "Down":  { x:  0, y: -1, z:  0 }
}

export const backpackSizeEvent: { [key: string]: number } = {
  "travel_backpack:leather_backpack":   0,
  "travel_backpack:copper_backpack":    1,
  "travel_backpack:iron_backpack":      2,
  "travel_backpack:gold_backpack":      3,
  "travel_backpack:diamond_backpack":   4,
  "travel_backpack:netherite_backpack": 5,
}