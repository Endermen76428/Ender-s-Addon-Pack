import { world, Player } from "@minecraft/server"

const configCache = new Map<string, ConfigInfo>()

export const apiConfig = new class apiConfig {
  public defaultConfig = {
    organize: false,
    organizeDimension: 0,
    showDimension: 0
  }

  getConfig(player: Player): ConfigInfo {
    const cache = configCache.get(player.id)
    if(cache) return cache

    const dynamic = player.getDynamicProperty("config")
    if(!dynamic || typeof dynamic != "string") return this.defaultConfig

    const config = JSON.parse(dynamic)
    if(!this.isConfig(config)){
      player.setDynamicProperty(`config`, JSON.stringify(this.defaultConfig))
      return this.defaultConfig
    }

    return config
  }

  setConfig(player: Player, config: ConfigInfo): void {
    player.setDynamicProperty("config", JSON.stringify(config))
    configCache.set(player.id, config)
  }

  private isConfig(obj: any): obj is ConfigInfo {
    return obj &&
    typeof obj === "object" &&
    typeof obj.organize === "boolean" &&
    typeof obj.organizeDimension === "number" &&
    typeof obj.showDimension === "number"
  }
}

export interface ConfigInfo {
  organize: boolean
  organizeDimension: number
  showDimension: number
}