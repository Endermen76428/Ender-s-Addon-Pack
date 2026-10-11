import { globalCacheTeleporterPad } from "./global"
import { Vector3 } from "@minecraft/server"

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

export type TeleporterPadStructure = ITeleporterPadInfo | true

interface ITeleporterPadInfo {
  owner: string
  dimension: string
  pos: Vector3
  broken: boolean
}