import { functionController } from "../../../functions/controller"
import { GetBLocksInfo, getOffsetType } from "../selectArea"
import { world, system, Vector3 } from "@minecraft/server"
import { defaultFaceDirection } from "../../../variables"
import { apiDurability } from "../../item/durability"
import { apiBlock } from "../apiBlock"

export const veinShapeGetTunnel = new class VeinShapeGetTunnel {
  getBlocks(info: GetBLocksInfo, sideRange: number, heightRange: number, depthRange?: number): void {
    const { blockIds, blockFace, origin, item, config } = info

    const maxWidth = Math.floor(sideRange /2)
    const maxHeight = Math.floor(heightRange /2)
    const maxDepth = depthRange ? (depthRange -1) : Infinity
    const is1x2 = heightRange == 2

    const faceDirection = apiBlock.getFaceDregress(blockFace)
    const direction = defaultFaceDirection[faceDirection]
    if(direction == undefined) return
    const isVertical = direction.y != 0

    const durability = apiDurability.getDurability(item, true)
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

        const distanceX = center.x - origin.x
        const distanceY = center.y - origin.y
        const distanceZ = center.z - origin.z

        let currentDepth = 0
        let currentSideA = 0
        let currentSideB = 0

        if (isVertical) {
          currentDepth = distanceY * direction.y
          currentSideA = distanceX
          currentSideB = distanceZ
        } else {
          currentDepth = distanceX * direction.x + distanceZ * direction.z
          currentSideA = distanceX * direction.z - distanceZ * direction.x
          currentSideB = distanceY
        }

        if (currentDepth < 0 || currentDepth > maxDepth) continue

        if (isVertical) {
          if (Math.abs(currentSideA) > maxWidth) continue
          if (Math.abs(currentSideB) > maxWidth) continue
        } else {
          if (Math.abs(currentSideA) > maxWidth) continue
          if (Math.abs(currentSideB) > maxHeight || (is1x2 && currentSideB === 1)) continue
        }

        aproved.push(center)

        for(const offset of preOffsets){
          const offsetX = center.x + offset[0], offsetY = center.y + offset[1], offsetZ = center.z + offset[2]
          const offsetKey = (offsetX << 20) ^ (offsetY << 10) ^ offsetZ

          if(visited.has(offsetKey)) continue
          visited.add(offsetKey)

          const block = origin.dimension.getBlock({x: offsetX, y: offsetY, z: offsetZ})
          if(!block) continue
          if(!blockIds.includes(block.typeId)) continue

          testing.push({x: offsetX, y: offsetY, z: offsetZ})
          if(aproved.length >= maxSize) return functionController(info, aproved.slice(0, maxSize))
        }
        yield
      }

      functionController(info, aproved.slice(0, maxSize))
    }())
  }
}