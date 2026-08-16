import { world, Player } from "@minecraft/server"

export const apiCooldown = new class ApiCooldown {
  timeUp(player: Player, id: string): {end: boolean, time: number} {
    const date = Math.floor(new Date().getTime() / 1000)
    const cooldownEnd = player.getDynamicProperty(id) as number ?? new Date().getTime() / 1000 -1
    return {
      end: date >= cooldownEnd,
      time: cooldownEnd - date
    }
  }

  set(player: Player, id: string, time: number): void {
    player.setDynamicProperty(id, Math.floor(new Date().getTime() / 1000) + time -1)
  }
}