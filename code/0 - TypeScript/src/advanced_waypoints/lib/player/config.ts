import { world, Player } from "@minecraft/server"

export const playerConfig = new Map<string, ConfigInfo>()

export const apiConfig = new class ApiConfig {
  get(player: Player): ConfigInfo {
    const storaged = playerConfig.get(player.id)

    if(storaged) return storaged

    const dynamic = player.getDynamicProperty("aw:config")
    if(typeof dynamic != "string") return defaulConfig

    const config = JSON.parse(dynamic)
    if(!this.isValid(config)){
      playerConfig.set(player.id, defaulConfig)
      return defaulConfig
    }
    playerConfig.set(player.id, config)
    return config
  }

  set(player: Player, config?: ConfigInfo): void {
    if(config){
      playerConfig.set(player.id, config)
    } else { playerConfig.delete(player.id) }

    player.setDynamicProperty("aw:config", config == undefined ? config : JSON.stringify(config))
  }

  private isValid(obj: any): obj is ConfigInfo {
    return obj &&
    typeof obj == "object" &&
    typeof obj.name == "boolean" &&
    typeof obj.dis == "boolean" &&
    typeof obj.beam == "boolean" &&
    typeof obj.showInfo == "boolean" &&
    typeof obj.showBeam == "boolean" &&
    typeof obj.pos == "boolean" &&
    typeof obj.createDP == "boolean" &&
    typeof obj.DPType == "number" &&
    typeof obj.utc == "number" &&
    typeof obj.scale == "number" &&
    typeof obj.share == "boolean"
  }
}

const defaulConfig: ConfigInfo = {
  name: true,
  dis: true,
  beam: true,
  showInfo: false,
  showBeam: false,
  pos: true,
  createDP: true,
  DPType: 0,
  utc: -3,
  scale: 10,
  share: true
}

export interface ConfigInfo {
  name: boolean
  dis: boolean
  beam: boolean
  showInfo: boolean
  showBeam: boolean
  pos: boolean
  createDP: boolean
  DPType: number
  utc: number
  scale: number
  share: boolean
}