import { world, Player } from "@minecraft/server"

const cachePlayerConfig = new Map<string, Config>()

export const apiConfig = new class ApiConfig {
  load(player: Player): void {
    const rawInfo = (r => typeof r != "string" ? undefined : JSON.parse(r))(player.getDynamicProperty("config"))
    if(rawInfo == undefined) return this.save(player, defaultConfig)

    cachePlayerConfig.set(player.id, {
      dropGrave: (r => typeof r == "boolean" ? r : defaultConfig.dropGrave)(rawInfo.dropGrave),
      pathType: (r => typeof r == "number" ? r : defaultConfig.pathType)(rawInfo.pathType),
      pathCheck: (r => typeof r == "number" ? r : defaultConfig.pathCheck)(rawInfo.pathCheck)
    })
  }

  get<T extends keyof Config>(player: Player, config: T): Config[T] {
    const cache = cachePlayerConfig.get(player.id) ?? defaultConfig
    return cache[config]
  }

  getAll(player: Player): Config {
    return cachePlayerConfig.get(player.id) ?? defaultConfig
  }

  update(player: Player, rawInfo: (string | number | boolean | undefined)[]): void {
    const [ dropGrave, pathType, pathCheck ] = rawInfo
    this.save(player, {
      dropGrave: (r => typeof r == "boolean" ? r : defaultConfig.dropGrave)(dropGrave),
      pathType: (r => typeof r == "number" ? r : defaultConfig.pathType)(pathType),
      pathCheck: (r => typeof r == "number" ? r : defaultConfig.pathCheck)(pathCheck)
    })
  }

  private save(player: Player, config: Config): void {
    cachePlayerConfig.set(player.id, config)
    player.setDynamicProperty("config", JSON.stringify(config))
  }
}

const defaultConfig: Config = {
  dropGrave: true,
  pathType: 1, // Random fire with Reaper
  pathCheck: 10
}

interface Config {
  dropGrave: boolean
  pathType: number
  pathCheck: number
}