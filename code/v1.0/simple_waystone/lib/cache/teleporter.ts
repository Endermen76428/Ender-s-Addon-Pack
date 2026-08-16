import { world, Vector3 } from "@minecraft/server"
import { globalCacheTeleporterPad } from "./global"

export const teleporterPadCache = new class TeleporterPadCache {
  getTeleporter(id: string): TeleporterPadStructure | undefined { return globalCacheTeleporterPad.get(id) }

  remove(id: string): void { globalCacheTeleporterPad.delete(id) }

  putShard(id: string, owner: string, dimension: string, pos: Vector3, broken: boolean): void {
    globalCacheTeleporterPad.set(id, {
      owner,
      dimension,
      pos,
      broken
    })
  }

  removeShard(id: string): void {
    globalCacheTeleporterPad.set(id, true)
  }
}

export type TeleporterPadStructure = TeleporterPadInfo | true

interface TeleporterPadInfo {
  owner: string
  dimension: string
  pos: Vector3
  broken: boolean
}