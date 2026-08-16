import { world, system, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus as Status, Player } from "@minecraft/server"
import { configPanel, functionList } from "../functions/configUI"
import { setTurnOff } from "../functions/turnOffTimer"
import { apiConfig } from "../lib/player/config"
import { apiWarn } from "../../0-lib/player/warn"

system.beforeEvents.startup.subscribe(({customCommandRegistry: customC}) => {
  customC.registerEnum("eap:functions", [...functionList])
  customC.registerCommand({
    name: "eap:veinminer",
    description: "commands.utilities_vein_miner.settings_panel",
    cheatsRequired: false,
    permissionLevel: CommandPermissionLevel.Any,
    optionalParameters: [
      {type: CustomCommandParamType.Enum, name: "eap:functions"}
    ]
  }, (({sourceEntity: player}, type) => {
    if(!player || !(player instanceof Player)) return { status: Status.Failure }

    if(type != undefined){
      const config = apiConfig.get(player)
      config.functionType = type
      apiConfig.set(player, config)

      if(config.functionType != "off") setTurnOff(player, config.turnOff)

      system.run(() => apiWarn.notify(player, "warning.utilities_vein_miner:config_complete", {type: "actionbar",sound: "warn.ender_addon_pack:break_amethyst"}))
      return { status: Status.Success }
    }

    system.run(() => configPanel.open(player))
    return { status: Status.Success }
  }))
})