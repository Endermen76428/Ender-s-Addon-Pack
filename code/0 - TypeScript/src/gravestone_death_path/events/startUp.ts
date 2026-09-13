import { world, system, CommandPermissionLevel, CustomCommandStatus, Player, CustomCommandParamType } from "@minecraft/server"
import { showDeathKnowledgePanel } from "../functions/deathKnowledge/statusPanel"
import { showConfigAdminPanel, showConfigPanel } from "../functions/config"
import { deathKnowledgeXpHandler } from "../functions/commands/deathXp"
import { collectGravestone } from "../functions/gravestone/collect"
import { deathPathLocator } from "../functions/deathPath/locator"
import { apiDeathKnowledge } from "../lib/player/deathKnowledge"
import { teleportToGravestone } from "../functions/key/teleport"
import { apiScoreboard } from "../../0-lib/math/scoreboard"
import { showKeyPanel } from "../functions/key/keyPanel"
import { apiConfigAdmin } from "../lib/configAdmin"
import { apiTracking } from "../lib/math/tracking"
import { apiWarn } from "../../0-lib/player/warn"
import { apiConfig } from "../lib/player/config"
import { apiTimer } from "../lib/player/timer"

system.run(() => { world.gameRules.keepInventory = true })
export let usedOnBlock = false

system.beforeEvents.startup.subscribe(({blockComponentRegistry: customB, itemComponentRegistry: customI, customCommandRegistry: customC}) => {
  customI.registerCustomComponent("gravestone_death_path:gravestone_key", {
    onUseOn({source: player, itemStack: item, block}){
      usedOnBlock = true

      if(!(player instanceof Player)) return
      if(block.hasTag("gravestone_death_path:gravestone")) return

      const keyOwner = item.getDynamicProperty("owner")
      if(typeof keyOwner != "number") return apiWarn.notify(player, "item.warn.gravestone_death_path:key.corrupted", {sound: "warn.ender_addon_pack:break"})

      if(keyOwner != Number(player.id)) return apiWarn.notify(player, "item.warn.gravestone_death_path:key.invalid_owner", {sound: "warn.ender_addon_pack:bass"})

      if(player.isSneaking) return

      if(!apiTimer.checkCooldown(player, "timer:key").finished && !player.hasTag("dev")) return
      apiTimer.setCooldown(player, "timer:key", 5)

      deathPathLocator.start(player, item, block)
    },

    onUse({source: player, itemStack: item}){
      system.run(() => {
        // Reset the variable for the next use
        if(usedOnBlock){
          usedOnBlock = false
          return
        }

        if(!item) return

        if(item.typeId == "gravestone_death_path:gravestone_key") return showKeyPanel(player)

        return teleportToGravestone(player, item)
      })
    }
  })

  customB.registerCustomComponent("gravestone_death_path:collect", {
    onPlayerInteract: ({block, player}) => {
      if(!player || !player.isValid) return

      const blockId = `${block.x},${block.y},${block.z}`
      const score = apiScoreboard.getObj(`gravestone_death_path:${player.id}`)
      if(!score.hasParticipant(blockId)) return apiWarn.notify(player, "block.warn.gravestone_death_path:gravestone.collect.other_owner", {sound: "warn.ender_addon_pack:bass"})

      collectGravestone(block, player)
    }
  })

  customC.registerCommand({
    name: "eap:config",
    description: "commands.gravestone_death_path.config",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false
  },
  ({sourceEntity}) => {
    sourceEntity instanceof Player && system.run(() => { showConfigPanel(sourceEntity) })
    return { status: CustomCommandStatus.Success }
  })
  customC.registerCommand({
    name: "eap:configadm",
    description: "commands.gravestone_death_path.config_adm",
    permissionLevel: CommandPermissionLevel.Admin,
    cheatsRequired: false
  },
  ({sourceEntity}) => {
    sourceEntity instanceof Player && system.run(() => { showConfigAdminPanel(sourceEntity) })
    return { status: CustomCommandStatus.Success }
  })

  customC.registerCommand({
    name: "eap:skill",
    description: "commands.gravestone_death_path:skill",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false
  },
  ({sourceEntity}) => {
    sourceEntity instanceof Player && system.run(() => { showDeathKnowledgePanel(sourceEntity) })
    return { status: CustomCommandStatus.Success }
  })

  customC.registerEnum("eap:xpFunc", ["give", "remove", "set"])
  customC.registerCommand({
    name: "eap:deathxp",
    description: "commands.gravestone_death_path:deathxp",
    permissionLevel: CommandPermissionLevel.GameDirectors,
    cheatsRequired: true,
    mandatoryParameters: [
      {name: "player", type: CustomCommandParamType.PlayerSelector},
      {name: "eap:xpFunc", type: CustomCommandParamType.Enum},
      {name: "amount", type: CustomCommandParamType.Integer}
    ]
  },
  (ev, players, type, amount) => {
    const player = players[0]
    if(!(player instanceof Player)) return
    if(typeof type != "string") return
    if(typeof amount != "number") return

    deathKnowledgeXpHandler(player, type, amount)

    return { status: CustomCommandStatus.Success }
  })

  customC.registerEnum("eap:skillFunc", ["reset"])
  customC.registerCommand({
    name: "eap:deathskill",
    description: "commands.gravestone_death_path:deathskill",
    permissionLevel: CommandPermissionLevel.GameDirectors,
    cheatsRequired: true,
    mandatoryParameters: [
      {name: "player", type: CustomCommandParamType.PlayerSelector},
      {name: "eap:skillFunc", type: CustomCommandParamType.Enum},
    ]
  },
  (ev, players, type) => {
    const player = players[0]
    if(!(player instanceof Player)) return

    apiDeathKnowledge.resetStatus(player)

    return { status: CustomCommandStatus.Success }
  })
})

// Load Cache on /reload
system.run(() => {
  apiConfigAdmin.load()
  world.getAllPlayers().forEach(player => {
    apiConfig.load(player)
    apiDeathKnowledge.load(player)
    apiTracking.load(player)
  })
})