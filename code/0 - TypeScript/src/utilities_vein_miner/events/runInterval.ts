import { world, system, EntityComponentTypes, EquipmentSlot, LootTableManager, Player } from "@minecraft/server"
import { autoEnableAll, worksOnlyLogs, worksOnlyOres } from "../variables"
import { borderFunctions } from "../functions/preview"
import { getBlocks } from "../lib/block/selectArea"
import { apiBlock } from "../lib/block/apiBlock"
import { apiConfig } from "../lib/player/config"

export const lastBlockRegistered = new Map<string, number>()
export const playersList = new Set<Player>() // only with tag "utilities_vein_miner:alwaysShowEdges"

export let lootManager: LootTableManager
system.run(() => { lootManager = world.getLootTableManager() })

system.runInterval(() => {
  for(const player of playersList){
    if(!player.isValid){
      playersList.delete(player)
      continue
    }

    if(!player.isSneaking){
      lastBlockRegistered.delete(player.id)
      system.runJob(borderFunctions.remove(player))
      continue
    }

    const config = apiConfig.get(player)
    if(config.showSelection == false) continue
    if(config.functionType == "off"){
      system.runJob(borderFunctions.remove(player))
      continue
    }

    const blockInfo = player.getBlockFromViewDirection({maxDistance: 7})
    if(!blockInfo) continue

    const { block, face } = blockInfo

    const blockKey = (block.x << 20) ^ (block.y << 10) ^ block.z
    if(lastBlockRegistered.get(player.id) == blockKey) continue

    system.runJob(borderFunctions.remove(player))
    lastBlockRegistered.set(player.id, blockKey)

    const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
    if((lootManager.generateLootFromBlock(block, item)?.length ?? 0) == 0) return

    const blockIds = apiBlock.formatId(block.typeId)
    if(config.onlyOre || config.onlyLog){
      const id = blockIds[0]
      const isOre = (id && worksOnlyOres.has(id)) || block.hasTag("bedrock_awakening:ore")
      const isLog = (id && worksOnlyLogs.has(id)) || block.hasTag("bedrock_awakening:log") || block.hasTag("log")
    if(!(config.onlyOre && isOre) && !(config.onlyLog && isLog)) return
    }

    getBlocks({
      type: "preview",
      player: player,
      block: block,
      blockIds: blockIds,
      blockFace: face,
      origin: block,
      config: config,
      item,
    }, config.autoAll ? autoEnableAll.includes(blockIds[0] ?? "") ? "all" : undefined : undefined )
  }
}, 5)

system.run(() => {
  for(const player of world.getPlayers({tags: ["utilities_vein_miner:alwaysShowEdges"]})){
    playersList.add(player)
  }
})