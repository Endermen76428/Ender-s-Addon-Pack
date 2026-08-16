import { world, Player } from "@minecraft/server"
import { TimerTurnOff } from "../../functions/turnOffTimer"
import { apiConfig } from "./config"
import { apiWarn } from "../../../0-lib/player/warn"

export class TurnOffManager {
  private player: Player
  private time: number

  constructor(player: Player, timerIndex: number){
    this.player = player

    const executions = timeList[timerIndex]
    this.time = executions ?? 1
  }

  update(): void {
    if(this.time == 0){
      const config = apiConfig.get(this.player)
      config.functionType = "off"
      apiConfig.set(this.player, config)

      apiWarn.notify(this.player, "warning.utilities_vein_miner:turned_off", {type: "actionbar"})

      TimerTurnOff.delete(this.player.id)
      return
    }

    this.time--
  }
}

const timeList = [-1, 6, 12, 30, 60] // Time in seconds divide by 10