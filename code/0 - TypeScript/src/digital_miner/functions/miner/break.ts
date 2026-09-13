import { globalFilterTagCache, globalFilterTypeCache, globalFilterTypeTagCache, globalUpgradesCache } from "../../lib/variables"
import { ItemStack, Block, BlockPermutation } from "@minecraft/server"
import { apiScoreboard } from "../../../0-lib/math/scoreboard"
import { apiMinerSpace } from "../../lib/block/minerSpace"
import { apiVec3 } from "../../lib/math/vector3"
import { apiString } from "../../lib/string"

export function breakDigitalMiner(block: Block, permutation: BlockPermutation): void {
  const minerCenter = apiMinerSpace.getCenter(block, permutation)
  if(!minerCenter) return

  const scoreId = `${apiString.getDimension(block)}/${apiVec3.toString(minerCenter)}`

  block.dimension.fillBlocks(apiMinerSpace.getSize(minerCenter), "minecraft:air")
  block.dimension.getEntities({location: {x: minerCenter.x +0.5, y: minerCenter.y +0.5, z: minerCenter.z +0.5}, maxDistance: 1.5, type: "digital_miner:anchor_upgrade"}).forEach(entity => entity.remove())

  const digitalMinerItem = new ItemStack("digital_miner:digital_miner")

  const typeFilter = []
  const tagFilter = []
  const scoreInfo = apiScoreboard.getObj(`digital_miner/miner/${scoreId}`)

  digitalMinerItem.setDynamicProperty("max_y", scoreInfo.getScore("info/max_y") ?? block.dimension.heightRange.max)
  digitalMinerItem.setDynamicProperty("min_y", scoreInfo.getScore("info/min_y") ?? block.dimension.heightRange.min)
  digitalMinerItem.setDynamicProperty("radius", scoreInfo.getScore("info/radius") ?? 32)

  for(const id of scoreInfo.getParticipants()){
    if(id.displayName.startsWith("info/up_")){
      const lv = scoreInfo.getScore(id) ?? 0
      digitalMinerItem.setDynamicProperty(id.displayName.replace("info/up_", ""), lv)
      continue
    }
    if(id.displayName.startsWith("type/")){
      typeFilter.push(id.displayName.replace("type/", ""))
      continue
    }
    if(id.displayName.startsWith("tag/")){
      tagFilter.push(id.displayName.replace("tag/", ""))
    }
  }
  digitalMinerItem.setDynamicProperty("type", JSON.stringify(typeFilter))
  digitalMinerItem.setDynamicProperty("tag", JSON.stringify(tagFilter))

  block.dimension.spawnItem(digitalMinerItem, {x: minerCenter.x +0.5, y: minerCenter.y +0.5, z: minerCenter.z +0.5})

  apiScoreboard.removeObj(scoreInfo)

  globalFilterTypeCache.delete(scoreId)
  globalFilterTagCache.delete(scoreId)
  globalUpgradesCache.delete(scoreId)
  globalFilterTypeTagCache.delete(scoreId)
}