import { globalCachePlayerWaystones, globalCacheWaystones, globalCacheWaystonesPublic } from "./global"
import { IWaystoneInfo } from "../waystone/info"
import { exitDirection } from "../../ui/infoUI"

export const waystoneCache = new class WaystoneCache {
  private getPlayerCache(playerId: string): IPlayerCacheStructure {
    const cache = globalCachePlayerWaystones.get(playerId)

    if(cache) return cache

    const empty: IPlayerCacheStructure = { private: new Set(), public: new Set(), claim: new Set(), favorite: {private: new Set(), public: new Set()} }
    globalCachePlayerWaystones.set(playerId, empty)
    return empty
  }

  create(info: IWaystoneInfo): void {
    const id = info.dimension.replace("minecraft:", "") + `/${info.pos.x},${info.pos.y},${info.pos.z}`;

    this.getPlayerCache(info.owner)[info.access == 0 ? "private" : "public"].add(id)

    globalCacheWaystones.set(id, info)
    if(info.access == 1) globalCacheWaystonesPublic.add(id)
  }

  remove(id: string): void {
    const info = globalCacheWaystones.get(id)
    if(!info) return

    info.claim.forEach(playerId => this.getPlayerCache(playerId).claim.delete(id) );
    info.favorite.forEach(playerId => this.getPlayerCache(playerId).favorite[info.access == 0 ? "private" : "public"].delete(id) );

    this.getPlayerCache(info.owner)[info.access == 0 ? "private" : "public"].delete(id)

    globalCacheWaystones.delete(id)
  }

  claim(playerId: string, id: string): void {
    this.getPlayerCache(playerId).claim.add(id)

    globalCacheWaystones.get(id)?.claim.add(playerId)
  }

  updateColor(color: number, id: string): void {
    const cache = globalCacheWaystones.get(id)
    if(cache) cache.color = color
  }

  updateDiscount(discount: number, id: string): void {
    const cache = globalCacheWaystones.get(id)
    if(cache) cache.xpDiscount = discount /100
  }

  updateExitOffset(dirIndex: number, id: string): void {
    const dir = exitDirection[dirIndex]
    if(!dir) return

    const cache = globalCacheWaystones.get(id)
    if(cache) cache.offset = dir
  }

  updateFavorite(playerId: string, id: string, access: "private" | "public", value: boolean): void {
    if(value){
      globalCacheWaystones.get(id)?.favorite.add(playerId)
      this.getPlayerCache(playerId).favorite[access].add(id)
    } else {
      globalCacheWaystones.get(id)?.favorite.delete(playerId)
      this.getPlayerCache(playerId).favorite[access].delete(id)
    }
  }

  updateLock(lock: boolean, id: string): void {
    const cache = globalCacheWaystones.get(id)
    if(cache) cache.lock = lock
  }

  getWaystone(id: string): IWaystoneInfo | undefined { return globalCacheWaystones.get(id) }

  getPlayerWaystoneIds(playerId: string): IPlayerCacheStructure { return this.getPlayerCache(playerId) }

  getPublicWaystones(): IWaystoneInfo[] {
    const waystones: IWaystoneInfo[] = []

    const publicWaystones = globalCacheWaystonesPublic.values()
    for(let i = 0, len = globalCacheWaystonesPublic.size; i < len; i++){
      const id = publicWaystones.next().value
      if(!id) continue

      const value = globalCacheWaystones.get(id)
      if(value) waystones.push(value)
    }

    return waystones
  }
}

export interface IPlayerCacheStructure {
  private: Set<string>
  public: Set<string>
  claim: Set<string>
  favorite: {
    private: Set<string>
    public: Set<string>
  }
}