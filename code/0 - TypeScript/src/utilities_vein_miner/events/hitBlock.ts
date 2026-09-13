import { world, system, BlockComponentTypes, EquipmentSlot, Player } from "@minecraft/server"
import { autoEnableAll, worksOnlyLogs, worksOnlyOres } from "../variables"
import { apiEquippable } from "../lib/player/equippable"
import { borderFunctions } from "../functions/preview"
import { setTurnOff } from "../functions/turnOffTimer"
import { getBlocks } from "../lib/block/selectArea"
import { apiBlock } from "../lib/block/apiBlock"
import { apiConfig } from "../lib/player/config"

world.afterEvents.entityHitBlock.subscribe(({damagingEntity: entity, hitBlock: block, blockFace}) => {
  const player = entity as Player
  const config = apiConfig.get(player)
  const blockIds = apiBlock.formatId(block.typeId)
  const item = apiEquippable.getItemSlot(player, EquipmentSlot.Mainhand)

  if(config.showSelection) system.runJob(borderFunctions.remove(player))

  if(!player.isSneaking) return
  if(config.functionType == "off") return
  if(block.hasTag("bedrock_awakening:script_no_break")) return
  if(block.typeId == "minecraft:air") return
  if(block.typeId == "minecraft:bedrock") return
  if(block.getComponent(BlockComponentTypes.Inventory)) return

  if(config.onlyOre || config.onlyLog){
    const id = blockIds[0]
    const isOre = (id && worksOnlyOres.has(id)) || block.hasTag("bedrock_awakening:ore")
    const isLog = (id && worksOnlyLogs.has(id)) || block.hasTag("bedrock_awakening:log") || block.hasTag("log")
    if(!(config.onlyOre && isOre) && !(config.onlyLog && isLog)) return
  }

  if(!apiBlock.isValidDrop(player, block, item, config.cancelNoDrop)) return

  if(config.turnOff != 0) setTurnOff(player, config.turnOff)

  getBlocks({
    type: "preview",
    player: player,
    block: block,
    blockIds: blockIds,
    blockFace,
    origin: block,
    config: config,
    item,
  }, config.autoAll ? autoEnableAll.includes(blockIds[0] ?? "") ? "all" : undefined : undefined )
})