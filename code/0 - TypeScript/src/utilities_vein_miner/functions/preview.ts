import { world, system, Player, Vector3 } from "@minecraft/server"

export const borderFunctions = new class BorderFunctions {
  *show(player: Player, blocks: Vector3[], accuracy = false, edgeType: number): Generator<void> {
    // Cancel the preview Edge if the block was broken quickly
    const centerBlock = player.dimension.getBlock(blocks[0] ?? player.location)
    if(centerBlock?.typeId == "minecraft:air") return

    // const date = Date.now()
    const scanFaces = new Set<number>()
    for(const pos of blocks) scanFaces.add((pos.x << 20) ^ (pos.y << 10) ^ pos.z)

    const scannedBlocks = new Map<number, BlockAproved>()

    for(const pos of blocks){
      const x = pos.x, y = pos.y, z = pos.z
      const blockKey = (x << 20) ^ (y << 10) ^ z

      const block = scannedBlocks.get(blockKey) ?? { block: pos, face: new Set<string>(), expression: "" }
      for(const offset of facesList){
        const nx = x + offset.x
        const ny = y + offset.y
        const nz = z + offset.z
        const neighborKey = (nx << 20) ^ (ny << 10) ^ nz

        if(!scanFaces.has(neighborKey)) continue

        const face = offset.face
        const oppositeFace = offset.opposite
        const neighborBlock = scannedBlocks.get(neighborKey) ?? { block: { x: nx, y: ny, z: nz }, face: new Set<string>(), expression: "" }

        if(face && oppositeFace){
          block.face.add(face)
          block.expression += `v.${face}=true;`
          neighborBlock.face.add(oppositeFace)
        }

        scannedBlocks.set(neighborKey, neighborBlock)
      }
      scannedBlocks.set(blockKey, block)
    }

    const accuracyTest = accuracy ? accuracyTestList[1] : accuracyTestList[0]

    let spawned = 0
    for(const [_, {block, face, expression}] of scannedBlocks){
      if(face.has("north") && face.has("south") && face.has("east") && face.has("west") && face.has("up") && face.has("down")) continue
      if(!accuracyTest(face)) continue

      if(spawned++ % 16 == 0) yield
      try {
        const entity = player.dimension.spawnEntity("utilities_vein_miner:selected_block", {x: block.x + 0.5, y: block.y + 0.5, z: block.z + 0.5})
        entity.addTag(`utilities_vein_miner_owner:${player.id}`)

        system.runTimeout(() => {
          if(entity.isValid) entity.playAnimation("animation.utilities_vein_miner.selected_block.edges", {
            players: [player],
            nextState: "none",
            stopExpression: `v.show = true; v.type = ${edgeType -1}; ${expression}`
          })
        }, 2)
      } catch {}
    }

    // console.warn(`§aTotal Time:§r <${(new Date().getTime() - date)}ms> / Entities: §a${player.dimension.getEntities({type: "utilities_vein_miner:selected_block"}).length}`)
  }

  *remove(player: Player): Generator<void> {
    const edges = player.dimension.getEntities({type: "utilities_vein_miner:selected_block", tags: [`utilities_vein_miner_owner:${player.id}`]})
    for(const entity of edges){
      try { entity.remove() } catch {}
      yield
    }
  }
}

const facesList: FaceListInfo[] = [
  { x: 0, y: 0, z: -1, face: "north", opposite: "south" },
  { x: 0, y: 0, z: 1, face: "south", opposite: "north" },
  { x: 1, y: 0, z: 0, face: "east", opposite: "west" },
  { x: -1, y: 0, z: 0, face: "west", opposite: "east" },
  { x: 0, y: 1, z: 0, face: "up", opposite: "down" },
  { x: 0, y: -1, z: 0, face: "down", opposite: "up" },

  { x: 0, y: -1, z: -1, face: "bn", opposite: "ts"},
  { x: 0, y: -1, z: 1, face: "bs", opposite: "tn"},
  { x: 1, y: -1, z: 0, face: "be", opposite: "tw"},
  { x: -1, y: -1, z: 0, face: "bw", opposite: "te"},
  { x: 0, y: 1, z: -1, face: "tn", opposite: "bs"},
  { x: 0, y: 1, z: 1, face: "ts", opposite: "bn"},
  { x: 1, y: 1, z: 0, face: "te", opposite: "bw"},
  { x: -1, y: 1, z: 0, face: "tw", opposite: "be"},

  { x: -1, y: 0, z: -1, face: "nw", opposite: "se"},
  { x: -1, y: 0, z: 1, face: "sw", opposite: "ne"},
  { x: 1, y: 0, z: -1, face: "ne", opposite: "sw"},
  { x: 1, y: 0, z: 1, face: "se", opposite: "nw"},

  { x: 1, y: 1, z: 1},
  { x: 1, y: 1, z: -1},
  { x: 1, y: -1, z: 1},
  { x: 1, y: -1, z: -1},
  { x: 1, y: 1, z: 1},
  { x: 1, y: 1, z: -1},
  { x: 1, y: -1, z: 1},
  { x: 1, y: -1, z: -1}
]

export const accuracyTestList: [((face: Set<string>) => boolean), ((face: Set<string>) => boolean)] = [
  (face) => { // Not Accuracy
    return !(
      (face.has("north") && face.has("south") && face.has("east") && face.has("west")) ||
      (face.has("north") && face.has("south") && face.has("up") && face.has("down")) ||
      (face.has("east") && face.has("west") && face.has("up") && face.has("down"))
    )
  },

  (face) => { // Accuracy
    return (
      (!face.has("north") && !face.has("east")) || (!face.has("north") && face.has("east") && face.has("ne")) || (face.has("north") && !face.has("east") && face.has("ne")) ||
      (!face.has("north") && !face.has("west")) || (!face.has("north") && face.has("west") && face.has("nw")) || (face.has("north") && !face.has("west") && face.has("nw")) ||
      (!face.has("north") && !face.has("down")) || (face.has("down") && face.has("bn") && !face.has("north")) || (!face.has("down") && face.has("bn") && face.has("north")) ||
      (!face.has("north") && !face.has("up")) || (face.has("up") && face.has("tn") && !face.has("north")) || (!face.has("up") && face.has("tn") && face.has("north")) ||

      (!face.has("south") && !face.has("east")) || (!face.has("south") && face.has("east") && face.has("se")) || (face.has("south") && !face.has("east") && face.has("se")) ||
      (!face.has("south") && !face.has("west")) || (!face.has("south") && face.has("west") && face.has("sw")) || (face.has("south") && !face.has("west") && face.has("sw")) ||
      (!face.has("south") && !face.has("down")) || (face.has("down") && face.has("bs") && !face.has("south")) || (!face.has("down") && face.has("bs") && face.has("south")) ||
      (!face.has("south") && !face.has("up")) || (face.has("up") && face.has("ts") && !face.has("south")) || (!face.has("up") && face.has("ts") && face.has("south")) ||

      (!face.has("down") && !face.has("east")) || (face.has("down") && face.has("be") && !face.has("east")) || (!face.has("down") && face.has("be")) ||
      (!face.has("down") && !face.has("west")) || (face.has("down") && face.has("bw") && !face.has("west")) || (!face.has("down") && face.has("bw")) ||
      (!face.has("up") && !face.has("east")) || (face.has("up") && face.has("te") && !face.has("east")) || (!face.has("up") && face.has("te")) ||
      (!face.has("up") && !face.has("west")) || (face.has("up") && face.has("tw") && !face.has("west")) || (!face.has("up") && face.has("tw"))
    )
  }
]

interface FaceListInfo {
  x: number
  y: number
  z: number
  face?: string
  opposite?: string
}

export interface BlockAproved {
  block: Vector3
  face: Set<string>
  expression: string
}