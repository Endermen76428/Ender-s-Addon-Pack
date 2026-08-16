import { world, Block, Player, Vector3 } from "@minecraft/server"
import { apiScoreboard } from "../math/scoreboard"

export const warpstonePedestalInfo = new class WarpstonePedestalInfo {
  create(block: Block, player: Player): void {
    const score = apiScoreboard.addObj(`simple_waystone/wp/${block.dimension.id.replace("minecraft:", "")}/${block.x},${block.y},${block.z}`)
    score.setScore(`0/${player.id}`, 0)
    score.setScore(`0/color`, 0)
  }

  remove(pos: Vector3, dimension: string): void {
    apiScoreboard.removeObj(`simple_waystone/wp/${dimension.replace("minecraft:", "")}/${pos.x},${pos.y},${pos.z}`, true)
  }
}