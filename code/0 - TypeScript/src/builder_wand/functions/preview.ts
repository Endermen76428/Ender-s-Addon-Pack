import { world, Direction, Player, Vector3 } from "@minecraft/server"
import { FaceDirections } from "../lib/block/getBlocks"
import { apiBlock } from "../lib/block/apiBlock"

export function *showBorders(player: Player, blocks: Vector3[], blockFace: Direction, preOffsets: [number, number, number, string][]): Generator<void> {
  // const date = Date.now()

  const blockKeys = new Set<number>()
  for(let i = 0, len = blocks.length; i < len; i++){
    const pos = blocks[i]
    if(!pos) continue

    blockKeys.add((pos.x << 20) ^ (pos.y << 10) ^ pos.z)
  }

  const faceDirection = apiBlock.getFaceDregress(blockFace)
  const direction = FaceDirections[faceDirection]
  if(direction == undefined) return

  const id = "builder_wand:selected_area_" + particleType[blockFace] + "_"

  // let i = 0
  // let total = 0
  for(let i = 0, len = blocks.length; i < len; i++){
    const pos = blocks[i]
    if(!pos) continue
    // let neighbors = 0
    for(let i2 = 0, len2 = preOffsets.length; i2 < len2; i2++){
      const offset = preOffsets[i2]
      if(!offset) continue

      const offsetX = pos.x + offset[0], offsetY = pos.y + offset[1], offsetZ = pos.z + offset[2]
      const blockKey = (offsetX << 20) ^ (offsetY << 10) ^ offsetZ
      if(!blockKeys.has(blockKey)){
        player.dimension.spawnParticle(id + offset[3], {x: pos.x - direction.x +0.5, y: pos.y - direction.y, z: pos.z - direction.z +0.5})
        // neighbors++
      }
    }

    // if(neighbors > 0){
    //   i++
    //   total += neighbors
    // }

    yield
  }

  // console.warn(`§aTotal Time:§r <${(new Date().getTime() - date)}ms> / Blocks: §a${i}§r / Total: §c${total}§r`)
}

const particleType: Record<Direction, string> = {
  "North": "n",
  "South": "s",
  "East": "e",
  "West": "w",
  "Up": "u",
  "Down": "d"
}