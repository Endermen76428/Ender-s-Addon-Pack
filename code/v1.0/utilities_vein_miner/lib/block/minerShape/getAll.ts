import { functionController } from "../../../functions/controller"
import { GetBLocksInfo, getOffsetType } from "../selectArea"
import { world, system, Vector3 } from "@minecraft/server"
import { apiDurability } from "../../item/durability"

export const veinShapeGetAll = new class VeinShapeGetAll {
  getBlocks(info: GetBLocksInfo): void {
    const { blockIds, origin, config } = info

    const durability = apiDurability.getDurability(info.item, true)
    const maxSize = durability == Infinity || durability > config.maxSize ? config.maxSize : durability
    if(maxSize < 1) return

    const preOffsets = getOffsetType(info)

    const aproved: Vector3[] = []
    const testing: Vector3[] = [origin.location]
    const visited = new Set<number>()
    let realIndex = 0
    visited.add((origin.x << 20) ^ (origin.y << 10) ^ origin.z)

    system.runJob(function* BFS(): Generator<void> {
      while(realIndex < testing.length){
        const center = testing[realIndex++]
        if(!center) continue

        aproved.push(center)

        for(const offset of preOffsets){
          const offsetX = center.x + offset[0], offsetY = center.y + offset[1], offsetZ = center.z + offset[2]
          const offsetKey = (offsetX << 20) ^ (offsetY << 10) ^ offsetZ

          if(visited.has(offsetKey)) continue
          visited.add(offsetKey)

          const block = origin.dimension.getBlock({x: offsetX, y: offsetY, z: offsetZ})
          if(!block) continue
          if(!blockIds.includes(block.typeId)) continue

          testing.push(block.location)
          if(aproved.length >= maxSize){
            return functionController(info, aproved.slice(0, maxSize))
          }
        }
        yield
      }

      functionController(info, aproved.slice(0, maxSize))
    }())
  }
}