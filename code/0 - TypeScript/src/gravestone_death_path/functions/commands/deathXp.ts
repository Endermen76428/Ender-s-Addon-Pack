import { apiDeathKnowledgeXp, maxDeathKnowledgeXp } from "../../lib/player/deathKnowledge"
import { world, Player } from "@minecraft/server"
import { apiNumber } from "../../lib/math/number"

export function deathKnowledgeXpHandler(player: Player, type: string, value: number): void {
  const exe = deathKnowledgeExecutions[type]
  exe && exe(player, value)
}

const deathKnowledgeExecutions: { [key: string]: (player: Player, value: number) => void } = {
  "give": (player, value) => {
    apiDeathKnowledgeXp.increaseXp(player, apiNumber.clamp(value, -maxDeathKnowledgeXp, maxDeathKnowledgeXp))
  },

  "set": (player, value) => {
    apiDeathKnowledgeXp.setXp(player, apiNumber.clamp(value, 0, maxDeathKnowledgeXp))
  },

  "remove": (player, value) => {
    apiDeathKnowledgeXp.increaseXp(player, -apiNumber.clamp(value, -maxDeathKnowledgeXp, maxDeathKnowledgeXp))
  }
}