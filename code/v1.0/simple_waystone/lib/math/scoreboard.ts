import { world, Entity, ScoreboardIdentity, ScoreboardObjective } from "@minecraft/server"

export const apiScoreboard = new class ApiScoreboard {
  // Objectives
  addObj(scoreId: string, displayName?: string): ScoreboardObjective {
    if(world.scoreboard.getObjective(scoreId)) return this.getObj(scoreId)
    return world.scoreboard.addObjective(scoreId, displayName)
  }

  getObj(scoreId: string): ScoreboardObjective {
    const score = world.scoreboard.getObjective(scoreId)
    if(!score) return this.addObj(scoreId)
    return score
  }

  removeObj(scoreId: string | ScoreboardObjective, checkBefore = false): boolean {
    if(checkBefore && typeof scoreId == "string") if(world.scoreboard.getObjective(scoreId) == undefined) return false
    return world.scoreboard.removeObjective(scoreId)
  }

  hasObj(scoreId: string): boolean {
    return world.scoreboard.getObjective(scoreId) != undefined
  }

  // Score
  addScore(scoreId: string | ScoreboardObjective, participant: Participant, amount = 0): number {
    const score = typeof scoreId == "string" ? this.getObj(scoreId) : scoreId
    return score.addScore(participant, amount)
  }

  getScore(scoreId: string | ScoreboardObjective, participant: Participant): number {
    const score = typeof scoreId == "string" ? this.getObj(scoreId) : scoreId
    if(!this.hasParticipant(scoreId, participant)) return this.addScore(scoreId, participant)

    const value = score.getScore(participant)
    if(value == undefined) return this.addScore(scoreId, participant)

    return value
  }

  setScore(scoreId: string | ScoreboardObjective, participant: Participant, amount?: number): void {
    const score = typeof scoreId == "string" ? this.getObj(scoreId) : scoreId
    if(amount == undefined){ score.removeParticipant(participant); return }

    score.setScore(participant, amount)
  }

  hasParticipant(scoreId: string | ScoreboardObjective, participant: Participant): boolean {
    const score = typeof scoreId == "string" ? this.getObj(scoreId) : scoreId
    return score.hasParticipant(participant)
  }

  removeParticipant(scoreId: string | ScoreboardObjective, participant: Participant): boolean {
    const score = typeof scoreId == "string" ? this.getObj(scoreId) : scoreId
    return score.removeParticipant(participant)
  }
}

type Participant = string | Entity | ScoreboardIdentity