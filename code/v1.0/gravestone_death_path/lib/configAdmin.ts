import { world } from "@minecraft/server"

const cacheAdminConfig: ConfigAdmin = {
  teleport: true,
  needKey: true
}

export const apiConfigAdmin = new class ApiConfigAdmin {
  load(): void {
    cacheAdminConfig.teleport = (r => typeof r != "boolean" ? cacheAdminConfig.teleport : r)(world.getDynamicProperty("c:teleport"))
    cacheAdminConfig.needKey = (r => typeof r != "boolean" ? cacheAdminConfig.needKey : r)(world.getDynamicProperty("c:needKey"))
  }

  get<T extends keyof ConfigAdmin>(config: T): ConfigAdmin[T] {
    return cacheAdminConfig[config]
  }

  getAll(): ConfigAdmin { return cacheAdminConfig }

  update(rawInfo: (string | number | boolean | undefined)[]): void {
    const [ teleport, needKey, _ ] = rawInfo
    this.save({
      teleport: (r => typeof r == "boolean" ? r : cacheAdminConfig.teleport)(teleport),
      needKey: (r => typeof r == "boolean" ? r : cacheAdminConfig.needKey)(needKey)
    })
  }

  private save(config: ConfigAdmin): void {
    cacheAdminConfig.teleport = config.teleport
    cacheAdminConfig.needKey = config.needKey
    world.setDynamicProperty("c:teleport", config.teleport)
    world.setDynamicProperty("c:needKey", config.needKey)
  }
}

interface ConfigAdmin {
  teleport: boolean
  needKey: boolean
}