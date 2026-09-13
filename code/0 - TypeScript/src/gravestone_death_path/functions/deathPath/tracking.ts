import { world, system, Player, Vector3 } from "@minecraft/server"
import { apiTracking } from "../../lib/math/tracking"
import { apiConfig } from "../../lib/player/config"

const cacheLastPos = new Map<string, Vector3>() // Player Id > Last Position

const maxLimit = 300
const maxDistance = 4 * 4

system.runInterval(() => {
  for(const player of world.getPlayers({excludeTags: ["gravestone_death_path:no_tracking"]})){
    // for(const [ index, { pos} ] of apiTracking.get(player).entries()){
    //   player.dimension.spawnParticle("minecraft:basic_flame_particle", {x: pos.x +0.5, y: pos.y +0.5, z: pos.z +0.5})
    // }

    const lastpos = cacheLastPos.get(player.id) ?? (r => { cacheLastPos.set(player.id, player.location); return player.location })()

    const { x, y, z } = player.location
    const disX = lastpos.x - x, disY = lastpos.y - y, disZ = lastpos.z - z
    if(disX * disX + disY * disY + disZ * disZ < maxDistance) continue

    const count = (r => typeof r != "number" ? 0 : r)(player.getDynamicProperty("count"))

    if(hasClosePoint(player, count)) continue

    cacheLastPos.set(player.id, player.location)
    apiTracking.savePoint(player, count +1)

    // console.warn("count:", count, "| removed:", count -maxLimit, "| dynamics:", player.getDynamicPropertyIds().length, "| bytes: ", player.getDynamicPropertyTotalByteCount())
    if(count >= maxLimit) apiTracking.deletePoint(player, count -maxLimit)
  }
}, 20)

function hasClosePoint(player: Player, currentIndex: number): boolean {
  let removeFromIndex = currentIndex
  let lastPos: Vector3 | undefined = undefined
  const cache = apiTracking.get(player)

  for(let i = 0; i < apiConfig.get(player, "pathCheck"); i++){
    const { pos } = cache.get(currentIndex -i) ?? {}
    if(!pos) break

    const disX = pos.x - player.location.x, disY = pos.y - player.location.y, disZ = pos.z - player.location.z
    if(disX * disX + disY * disY + disZ * disZ < maxDistance){
      removeFromIndex = currentIndex -i
      lastPos = pos
      continue
    }
  }

  // console.warn("Find:", removeFromIndex, "| Current:", currentIndex)
  if(removeFromIndex != currentIndex && lastPos != undefined){
    player.setDynamicProperty("count", removeFromIndex)
    cacheLastPos.set(player.id, lastPos)
    const cache = apiTracking.get(player)

    for(let i = removeFromIndex +1; i <= currentIndex; i++){
      cache.delete(i)
      player.setDynamicProperty(`p:${i}`, undefined)
      player.setDynamicProperty(`p:${i}.5`, undefined)
    }

    return true
  }

  return false
}