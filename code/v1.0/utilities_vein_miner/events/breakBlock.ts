import { world, system, BlockComponentTypes, EquipmentSlot, ItemComponentTypes } from "@minecraft/server"
import { autoEnableAll, worksOnlyLogs, worksOnlyOres } from "../variables"
import { apiDeleteBlocks } from "../lib/player/deleteBlocks"
import { apiEquippable } from "../lib/player/equippable"
import { setTurnOff } from "../functions/turnOffTimer"
import { getBlocks } from "../lib/block/selectArea"
import { apiBlock } from "../lib/block/apiBlock"
import { apiConfig } from "../lib/player/config"

world.beforeEvents.playerBreakBlock.subscribe((ev) => {
  const { player, block } = ev
  const config = apiConfig.get(player)
  const blockIds = apiBlock.formatId(block.typeId)
  const item = apiEquippable.getItemSlot(player, EquipmentSlot.Mainhand)

  if(!player.isSneaking) return
  if(config.functionType == "off") return
  if(block.hasTag("bedrock_awakening:script_no_break")) return
  if(block.getComponent(BlockComponentTypes.Inventory)) return

  if(config.onlyOre || config.onlyLog){
    const id = blockIds[0]
    const isOre = (id && worksOnlyOres.has(id)) || block.hasTag("bedrock_awakening:ore")
    const isLog = (id && worksOnlyLogs.has(id)) || block.hasTag("bedrock_awakening:log") || block.hasTag("log")
    if(!(config.onlyOre && isOre) && !(config.onlyLog && isLog)) return
  }

  if(!apiBlock.isValidDrop(player, block, item, config.cancelNoDrop)) return

  if(apiDeleteBlocks.get(player).has(blockIds[0] ?? "")){
    const durability = item?.getComponent(ItemComponentTypes.Durability)
    if((durability?.damage ?? 0) +1 >= (durability?.maxDurability ?? 0)) return
    ev.cancel = true
    system.run(() => { block.setType("minecraft:air") })
  }

  if(config.turnOff != 0) setTurnOff(player, config.turnOff)

  getBlocks({
    type: "break",
    player: player,
    block: block,
    blockIds: blockIds,
    blockFace: player.getBlockFromViewDirection({maxDistance: 10})?.face ?? "Up",
    origin: block,
    config: config,
    item,
  }, config.autoAll ? autoEnableAll.includes(blockIds[0] ?? "") ? "all" : undefined : undefined )
})