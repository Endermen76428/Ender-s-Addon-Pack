import { world, system, Player } from "@minecraft/server"
import { TurnOffManager } from "../lib/player/turnOff"
import { apiConfig } from "../lib/player/config"

export const TimerTurnOff = new Map<string, TurnOffManager>()

system.runInterval(() => {
  for(const [playerId, timer] of TimerTurnOff){
    timer.update()
  }
}, 20 * 10)

export function setTurnOff(player: Player, timerIndex?: number): void {
  const index = timerIndex ?? apiConfig.get(player).turnOff

  if(index == 0){
    TimerTurnOff.delete(player.id)
    return
  }

  TimerTurnOff.set(player.id, new TurnOffManager(player, index))
}