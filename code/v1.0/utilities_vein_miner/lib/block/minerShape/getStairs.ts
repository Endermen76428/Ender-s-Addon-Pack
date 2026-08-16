import { functionController } from "../../../functions/controller"
import { world, system, Vector3 } from "@minecraft/server"
import { defaultFaceDirection } from "../../../variables"
import { apiDurability } from "../../item/durability"
import { GetBLocksInfo } from "../selectArea"
import { apiBlock } from "../apiBlock"

export const veinShapeGetStairs = new class VeinShapeGetStairs {
  getBlocks(info: GetBLocksInfo, up = true): void {
    const { player, blockIds, origin, item, config, type } = info

    const degress = player.getRotation().y +180
    const faceDirection = degress < 45 || degress > 315 ? 0 : degress > 45 && degress < 135 ? 1 : degress > 135 && degress < 225 ? 2 : 3
    const direction = defaultFaceDirection[faceDirection]
    const directionVertical = up ? 1 : -1
    if(direction == undefined) return

    const durability = apiDurability.getDurability(item, true)
    const maxSize = durability == Infinity || durability > config.maxSize ? config.maxSize : durability

    const blocks: Vector3[] = []

    system.runJob(function* stairs(): Generator<void> {
      let i = type == "preview" ? 0 : 1
      if(type == "break") blocks.push(origin.location)
      while(blocks.length < maxSize){
        const offsetX = origin.x + (direction.x * i)
        const offsetY = origin.y + (directionVertical * i)
        const offsetZ = origin.z + (direction.z * i)
        i++
        try {
          const block = origin.dimension.getBlock({x: offsetX, y: offsetY, z: offsetZ})
          if(!block) break
          if(!blockIds.includes(block.typeId)) break
          blocks.push({x: offsetX, y: offsetY, z: offsetZ})
          yield
        } catch { break }
      }

      functionController(info, blocks)
    }())
  }
}