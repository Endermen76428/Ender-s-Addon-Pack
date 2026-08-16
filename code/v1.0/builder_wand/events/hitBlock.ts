import { world, Player, EntityComponentTypes, EquipmentSlot } from "@minecraft/server"
import { GetBlocks2D } from "../lib/block/getBlocks"
import { apiBlock } from "../lib/block/apiBlock"
import { apiConfig } from "../lib/player/config"
import { apiTimer } from "../lib/player/timer"

const lastBlockHitted = new Map<string, number>()

world.afterEvents.entityHitBlock.subscribe(({damagingEntity: entity, hitBlock: block, blockFace}) => {
  if(block.isAir || block.typeId == "minecraft:water") return

  const player = entity as Player
  const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)

  if(!item) return
  if(!item.hasTag("builder_wand:wand")) return

  if(!apiTimer.check(player, "bw:preview_cool").finished){
    if(lastBlockHitted.get(player.id) == block.x * block.y * block.z) return
  }

  apiTimer.set(player, "bw:preview_cool", 1)
  lastBlockHitted.set(player.id, block.x * block.y * block.z)

  GetBlocks2D.getBlocks({
    type: "preview",
    player,
    item,
    block,
    blockFace,
    blockIds: new Set(apiBlock.formatId(block.typeId)),
    config: apiConfig.get(item)
  })
})