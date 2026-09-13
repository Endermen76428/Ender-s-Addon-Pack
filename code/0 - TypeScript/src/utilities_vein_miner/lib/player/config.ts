import { world, Player } from "@minecraft/server"

const configCache = new Map<string, ConfigInfo>()

export const apiConfig = new class apiConfig {
  get(player: Player): ConfigInfo {
    const cacheConfig = configCache.get(player.id)
    if(cacheConfig) return cacheConfig

    const dynamic = player.getDynamicProperty("utilities_vein_miner:config_info")
    if(typeof dynamic != "string") return defaultConfig

    const config = JSON.parse(dynamic)
    if(!this.isValid(config)) return defaultConfig

    return config
  }

  set(player: Player, config: ConfigInfo): void {
    configCache.set(player.id, config)
    player.setDynamicProperty("utilities_vein_miner:config_info", JSON.stringify(config))
  }

  clear(player: Player): void {
    configCache.delete(player.id)
  }

  private isValid(obj: any): obj is ConfigInfo {
    return obj &&
    typeof obj == "object" &&
    typeof obj.showSelection == "boolean" &&
    typeof obj.functionType == "string" &&
    typeof obj.turnOff == "number" &&

    typeof obj.showInfo == "boolean" &&
    typeof obj.maxSize == "number" &&
    typeof obj.edgeSize == "number" &&
    typeof obj.cancelNoDrop == "boolean" &&
    typeof obj.autoAll == "boolean" &&
    typeof obj.onlyOre == "boolean" &&
    typeof obj.onlyLog == "boolean" &&
    typeof obj.accuracy == "boolean" &&
    typeof obj.cancelOpenItem == "boolean" &&
    typeof obj.connectedDiagonals == "boolean" &&
    typeof obj.quick == "boolean"
  }
}

export const defaultConfig: ConfigInfo = {
  showSelection: false,
  functionType: "all",
  turnOff: 0,
  // Advanced Settings
  showInfo: true,
  maxSize: 64,
  edgeSize: 3,
  quick: false,
  cancelNoDrop: true,
  autoAll: true,
  onlyOre: false,
  onlyLog: false,
  accuracy: false,
  cancelOpenItem: false,
  connectedDiagonals: true
} as const

export interface ConfigInfo {
  showSelection: boolean
  functionType: FunctionType
  turnOff: number
  // Advanced Settings
  showInfo: boolean
  maxSize: number
  edgeSize: number
  quick: boolean
  cancelNoDrop: boolean
  autoAll: boolean
  onlyOre: boolean
  onlyLog: boolean
  accuracy: boolean
  cancelOpenItem: boolean
  connectedDiagonals: boolean
}

export type FunctionType = "off" | "all" | "1x1_tunnel" | "1x2_tunnel" | "1x3_tunnel" | "3x2_tunnel" | "3x2_tunnel_small" | "3x3_tunnel" | "3x3_tunnel_small" | "mining_tunnel" | "escape_tunnel"