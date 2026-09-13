import { world, Player, Vector3 } from "@minecraft/server"
import { DeathPathPoint } from "../item/dynamic"

export const cacheTrackingLocations = new Map<string, Map<number, DeathPathPoint>>() // Player Id > Point Index > DeathPoint

export const apiTracking = new class ApiTracking {
  load(player: Player): void {
    const cache = (() => {
      const map = cacheTrackingLocations.get(player.id)
      if(map) return map

      const newCache = new Map<number, DeathPathPoint>()
      cacheTrackingLocations.set(player.id, newCache)
      return newCache
    })()

    for(const id of player.getDynamicPropertyIds() ?? []){
      let pos: Vector3 | 0 = 0
      let dimension: string | 0 = 0
      if(id.startsWith("p:") && !id.endsWith(".5")){
        pos = (r => typeof r == "object" ? r : 0)(player.getDynamicProperty(id))
        dimension = (r => typeof r == "string" ? r : 0)(player.getDynamicProperty(`${id}.5`))
      }
      pos && dimension && cache.set(Number(id.replace("p:", "")), { pos, dimension })
    }
  }

  get(player: Player): Map<number, DeathPathPoint> {
    return cacheTrackingLocations.get(player.id) ?? new Map<number, DeathPathPoint>()
  }

  savePoint(player: Player, index: number): void {
    const pos = {x: Math.floor(player.location.x), y: Math.floor(player.location.y), z: Math.floor(player.location.z)}
    const dimension = player.dimension.id.replace("minecraft:", "")
    const cache = this.get(player)
    cache.set(index, { pos, dimension })

    player.setDynamicProperty("count", index)
    player.setDynamicProperty(`p:${index}`, pos)
    player.setDynamicProperty(`p:${index}.5`, dimension)
  }

  deletePoint(player: Player, index: number): void {
    const cache = this.get(player)
    cache.delete(index)

    player.setDynamicProperty(`p:${index}`, undefined)
    player.setDynamicProperty(`p:${index}.5`, undefined)
  }
}