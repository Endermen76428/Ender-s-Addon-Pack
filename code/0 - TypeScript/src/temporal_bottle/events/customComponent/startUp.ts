import { startUpCommandFunc, startUpCommandHeader } from "./commands"
import { system } from "@minecraft/server"

system.beforeEvents.startup.subscribe(({itemComponentRegistry: customI, customCommandRegistry: customC}) => {
  customI.registerCustomComponent("temporal_bottle:bottle", { onUseOn: () => {} })

  customC.registerEnum("eap:function", ["add", "set"])
  customC.registerCommand(startUpCommandHeader.giveTime, startUpCommandFunc.giveTime)
  customC.registerCommand(startUpCommandHeader.recipes, startUpCommandFunc.recipes)
})