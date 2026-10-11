import { Block, BlockPermutation, system, world } from "@minecraft/server"
import { teleporterPadInfo } from "../../lib/teleporter/info"
import { apiNumbers } from "../../../0-lib/math/numbers"
import { netherDepthFunction } from "./waystone"

export function generateTeleporterPad(block: Block): void {
  const rot = block.permutation.getState("minecraft:cardinal_direction")
  const dimensionId = dimensions[Math.floor(Math.random() *3)]
  if(dimensionId == undefined) return

  const originId = `${dimensionId}/${block.x},${block.y},${block.z}`
  teleporterPadInfo.create(originId)
  block.setType("minecraft:air")
  system.runTimeout(() => {
    const dimension = world.getDimension(dimensionId)

    const randomX = Math.floor(apiNumbers.randomBetween(1000, 7000)) * Math.sign(block.x)
    const randomZ = Math.floor(apiNumbers.randomBetween(1000, 7000)) * Math.sign(block.z)

    const tickId = `${block.x},${block.z}`
    world.tickingAreaManager.createTickingArea(tickId, {dimension, from: {x: block.x + randomX -1, y: dimension.heightRange.min, z: block.z + randomZ -1}, to: {x: block.x + randomX +1, y: dimension.heightRange.max, z: block.z + randomZ +1}})

    const pos = {x: block.x + randomX, y: block.y, z: block.z + randomZ}
    // Um loop para caso as chunks não carreguem a tempo
    function waitChunkLoad(execute = 0){
      if(execute >= 25) return console.warn("§eWatchdog")
      if(dimension.isChunkLoaded(pos) == false){
        system.runTimeout(() => { waitChunkLoad(execute +1) }, 20)
        return
      }
      let target = dimension.getTopmostBlock({x: pos.x, z: pos.z})
      if(target == undefined || !target.isValid){
        block.setPermutation(BlockPermutation.resolve("ws:teleporter_pad_empty", {"minecraft:cardinal_direction": rot ?? "north"}))
        return
      }

      if(dimensionId == "nether"){
        const floor = netherDepthFunction(target, 1)
        target = dimension.getBlock({x: target.x, y: floor, z: target.z})
      }
      target = target?.above(1)

      if(target == undefined || !target.isValid){
        block.setPermutation(BlockPermutation.resolve("ws:teleporter_pad_empty", {"minecraft:cardinal_direction": rot ?? "north"}))
        return
      }

      teleporterPadInfo.putShard(block, "none", target.dimension.id, target.location, false)
      teleporterPadInfo.putShard(target, "none", block.dimension.id, block.location, false)
      block.setPermutation(BlockPermutation.resolve("ws:teleporter_pad", {"minecraft:cardinal_direction": rot ?? "north"}))
      world.structureManager.place("mystructure:simple_waystone/teleporter_pad/plate_" + dimensionId, block.dimension, {x: block.x -1, y: block.y -1, z: block.z -1})
      target.setPermutation(BlockPermutation.resolve("ws:teleporter_pad", {"minecraft:cardinal_direction": rot ?? "north"}))
      world.structureManager.place("mystructure:simple_waystone/teleporter_pad/plate_" + dimensionId, dimension, {x: target.x -1, y: target.y -1, z: target.z -1})
      world.tickingAreaManager.removeTickingArea(tickId)
    }
    system.runTimeout(() => { waitChunkLoad() }, 20)
  }, 5)
}

const dimensions = ["overworld", "nether", "the_end"]