import { world, Player } from "@minecraft/server"

export const apiTimer = new class apiTimer {
  checkCooldown(player: Player, id: string): cooldownInfo {
    if(this.getTime() > this.getCooldown(player, id)) return {finished: true, time: this.getCooldown(player, id) - this.getTime()}
    return {finished: false, time: this.getTime() - this.getCooldown(player, id)}
  }

  getTime(): number { return Date.now() /1000 }

  getCooldown(player: Player, id: string): number {
    const cooldown = player.getDynamicProperty(id)
    if(!cooldown || typeof cooldown != "number") return this.getTime() -0.001
    return cooldown
  }

  setCooldown(player: Player, id: string, time: number): void {
    player.setDynamicProperty(id, this.getTime() + time)
  }
}

interface cooldownInfo {
  finished: boolean,
  time: number
}