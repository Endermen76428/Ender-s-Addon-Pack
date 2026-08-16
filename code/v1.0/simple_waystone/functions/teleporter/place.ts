import { teleporterPadInfo } from "../../lib/teleporter/info"
import { teleporterPadCache } from "../../lib/cache/teleporter"
import { teleporterPadSpace } from "../../lib/teleporter/space"
import { world, system, Block } from "@minecraft/server"

export const teleporterPadTimer = new Map<string, number>() // Dimension/Location > Timer ID

export function teleporterPadPlace(block: Block): void {
  const id = `${block.dimension.id.replace("minecraft:", "")}/${block.x},${block.y},${block.z}`
  if(teleporterPadCache.getTeleporter(id)) return

  if(block.typeId.endsWith("_empty")) return teleporterPadInfo.create(id)

  block.dimension.spawnParticle("simple_waystone:teleporter_pad_register", block.bottomCenter())

  teleporterPadTimer.set(id, system.runTimeout(() => {
    teleporterPadTimer.delete(id)
    teleporterPadInfo.create(id)
    teleporterPadSpace.spawnShard(block, block.dimension.id, block.location)
  }, 20))
}