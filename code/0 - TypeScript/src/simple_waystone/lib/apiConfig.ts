import { Player } from "@minecraft/server"

const configCache = new Map<string, IConfigInfo>()

export const apiConfig = new class apiConfig {
  public defaultConfig: IConfigInfo = {
    organize: false,
    organizeDimension: 0,
    showDimension: 0,
    publicFirst: false
  }

  getConfig<T extends keyof IConfigInfo>(player: Player): IConfigInfo;
  getConfig<T extends keyof IConfigInfo>(player: Player, config: T): IConfigInfo[T];
  getConfig<T extends keyof IConfigInfo>(player: Player, config?: T): IConfigInfo | IConfigInfo[T] {
    const cache = configCache.get(player.id)
    if(cache){
      if(config != undefined) return cache[config]
      return cache
    }

    const dynamic = player.getDynamicProperty("config")
    if(!dynamic || typeof dynamic != "string"){
      if(config != undefined) return this.defaultConfig[config]
      return this.defaultConfig
    }

    const allConfig = JSON.parse(dynamic)
    if(!this.isConfig(allConfig)){
      player.setDynamicProperty(`config`, JSON.stringify(this.defaultConfig))
      if(config != undefined) return this.defaultConfig[config]
      return this.defaultConfig
    }

    if(config != undefined) return allConfig[config]
    return allConfig
  }

  setConfig(player: Player, config: IConfigInfo): void {
    player.setDynamicProperty("config", JSON.stringify(config))
    configCache.set(player.id, config)
  }

  private isConfig(obj: any): obj is IConfigInfo {
    return obj &&
    typeof obj === "object" &&
    typeof obj.organize === "boolean" &&
    typeof obj.organizeDimension === "number" &&
    typeof obj.showDimension === "number" &&
    typeof obj.publicFirst === "boolean"
  }
}

interface IConfigInfo {
  organize: boolean
  organizeDimension: number
  showDimension: number
  publicFirst: boolean
}