import { apiConfig, ConfigInfo, defaultConfig } from "../lib/player/config"
import { apiDeleteBlocks } from "../lib/player/deleteBlocks"
import { ModalFormData } from "@minecraft/server-ui"
import { playersList } from "../events/runInterval"
import { world, Player } from "@minecraft/server"
import { apiWarn } from "../../0-lib/player/warn"
import { setTurnOff } from "./turnOffTimer"
import { Variables } from "../variables"

export const configPanel = new class configPanel {
  open(player: Player): void {
    const config = apiConfig.get(player)
    new ModalFormData()
    .title("ui.utilities_vein_miner:config.title")
    .toggle("ui.utilities_vein_miner:config.show_selection", {defaultValue: config.showSelection})
    .toggle("ui.utilities_vein_miner:config.show_when_sneaking", {defaultValue: player.hasTag("utilities_vein_miner:alwaysShowEdges")})
    .dropdown("ui.utilities_vein_miner:config.function_type", functionList.map(value => `ui.utilities_vein_miner:config.function_type.${value}`), {defaultValueIndex: functionList.findIndex(value => value == config.functionType)})
    .dropdown("ui.utilities_vein_miner:config.turn_off", turnOffList.map(value => `ui.utilities_vein_miner:config.turn_off.${value}`), {defaultValueIndex: config.turnOff})
    .toggle("ui.utilities_vein_miner:config.advanced")
    .show(player).then(({ canceled, formValues }) => {
      if(canceled || !formValues) return apiWarn.notify(player, "warning.utilities_vein_miner:config_canceled", {type: "actionbar", sound: "warn.ender_addon_pack:break"})
      const [ edges, alwaysShow, type, turnOff, advanced ] = formValues

      if(typeof edges != "boolean" || typeof alwaysShow != "boolean" || typeof type != "number" || typeof turnOff != "number" || typeof advanced != "boolean") return;

      if(alwaysShow){
        player.addTag("utilities_vein_miner:alwaysShowEdges")
        playersList.add(player)
      } else {
        player.removeTag("utilities_vein_miner:alwaysShowEdges")
        playersList.delete(player)
      }
      config.showSelection = edges
      config.functionType = validateFunctionType(type)
      config.turnOff = turnOff
      apiConfig.set(player, config)

      setTurnOff(player, config.turnOff)

      if(advanced) return this.advanced(player, config)

      apiWarn.notify(player, "warning.utilities_vein_miner:config_complete", {type: "actionbar",sound: "warn.ender_addon_pack:break_amethyst"})
    })
  }

  private advanced(player: Player, config: ConfigInfo): void {
    new ModalFormData()
    .title("ui.utilities_vein_miner:config.title")
    .slider({translate: "ui.utilities_vein_miner:config.max_size"}, 16, Variables.maxSize, {valueStep: 16, defaultValue: config.maxSize})
    .slider({translate: "ui.utilities_vein_miner:config.thick_edges"}, 1, 5, {valueStep: 1, defaultValue: config.edgeSize})
    .toggle("ui.utilities_vein_miner:config.show_info", {defaultValue: config.showInfo, tooltip: "ui.utilities_vein_miner:config.show_info.tooltip"})
    .toggle("ui.utilities_vein_miner:config.quick_settings", {defaultValue: config.quick})
    .toggle("ui.utilities_vein_miner:config.cancel_no_drop", {defaultValue: config.cancelNoDrop})
    .toggle("ui.utilities_vein_miner:config.auto_all", {defaultValue: config.autoAll})
    .toggle("ui.utilities_vein_miner:config.only_ore", {defaultValue: config.onlyOre})
    .toggle("ui.utilities_vein_miner:config.only_log", {defaultValue: config.onlyLog})
    .toggle("ui.utilities_vein_miner:config.accuracy", {defaultValue: config.accuracy})
    .toggle("ui.utilities_vein_miner:config.connected_diagonals", {defaultValue: config.connectedDiagonals})
    .toggle("ui.utilities_vein_miner:config.delete_blocks", {tooltip: {"rawtext":[{"translate": "ui.utilities_vein_miner:config.delete_blocks.list"},{"text":[...apiDeleteBlocks.get(player)].map(value => value.replace("minecraft:", "")).join(" | ")}]}})
    .show(player).then(({ canceled, formValues }) => {
      if(canceled || !formValues) return apiWarn.notify(player, "warning.utilities_vein_miner:config_canceled", {type: "actionbar", sound: "warn.ender_addon_pack:break"})

      const lastQuick = config.quick
      this.processInput(config, formValues)
      apiConfig.set(player, config)

      if(lastQuick == false && config.quick == true) apiWarn.notify(player, "warning.utilities_vein_miner:quick_setting_enabled")
      if(formValues[10] == true) return this.deleteBlocks(player)

      apiWarn.notify(player, "warning.utilities_vein_miner:config_complete", {type: "actionbar",sound: "warn.ender_addon_pack:break_amethyst"})
    })
  }

  private deleteBlocks(player: Player): void {
    const blocks = apiDeleteBlocks.get(player)
    const buttons = apiDeleteBlocks.allBlocks.map(value => ({id: `tile.${specialTranslate[value] ? specialTranslate[value] : value.replace("minecraft:", "")}.name`, enabled: blocks.has(value)}))
    const form = new ModalFormData()
    .title("ui.utilities_vein_miner:config.delete_blocks")
    buttons.forEach(button => form.toggle(button.id, {defaultValue: button.enabled}))
    form.show(player).then(({ canceled, formValues }) => {
      if(canceled) return apiWarn.notify(player, "warning.utilities_vein_miner:config_canceled", {type: "actionbar", sound: "warn.ender_addon_pack:break"})

      const selectedBlocks = [...apiDeleteBlocks.allBlocks].filter((value, index) => formValues?.[index] == true)
      apiDeleteBlocks.set(player, selectedBlocks)
      apiWarn.notify(player, "warning.utilities_vein_miner:config_complete", {type: "actionbar",sound: "warn.ender_addon_pack:break_amethyst"})
    })
  }

  private processInput(config: ConfigInfo, inputs: formValues[]): void {
    const [ size, edgeSize, showInfo, quick, cancelDrop, autoAll, onlyOre, onlyLog, accuracy, diagonal, cancelOpen ] = inputs

    if(typeof size == "number") config.maxSize = size
    if(typeof edgeSize == "number") config.edgeSize = edgeSize
    if(typeof showInfo == "boolean") config.showInfo = showInfo
    if(typeof quick == "boolean") config.quick = quick
    if(typeof cancelDrop == "boolean") config.cancelNoDrop = cancelDrop
    if(typeof autoAll == "boolean") config.autoAll = autoAll
    if(typeof onlyOre == "boolean") config.onlyOre = onlyOre
    if(typeof onlyLog == "boolean") config.onlyLog = onlyLog
    if(typeof accuracy == "boolean") config.accuracy = accuracy
    if(typeof diagonal == "boolean") config.connectedDiagonals = diagonal
    if(typeof cancelOpen == "boolean") config.cancelOpenItem = cancelOpen
  }
}

function validateFunctionType(input: number): functionType {
  function isFunctionType(value: any): value is functionType { return functionList.includes(value) }
  if(typeof functionList[input] !== "string" || !isFunctionType(functionList[input])) return defaultConfig.functionType
  return functionList[input]
}

const specialTranslate: { [key: string]: string } = {
  "minecraft:stone": "stone.stone",
  "minecraft:andesite": "stone.andesite",
  "minecraft:diorite": "stone.diorite",
  "minecraft:granite": "stone.granite"
}

export const turnOffList = ["no", "1_minute", "2_minute", "5_minute", "10_minute"] as const
export const functionList = ["off", "all", "1x1_tunnel", "1x2_tunnel", "1x3_tunnel", "3x2_tunnel", "3x2_tunnel_small", "3x3_tunnel", "3x3_tunnel_small", "mining_tunnel", "escape_tunnel"] as const
type formValues = string | number | boolean | undefined
type functionType = typeof functionList[number]