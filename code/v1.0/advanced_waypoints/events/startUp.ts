import { world, system, CommandPermissionLevel, CustomCommandStatus, Player } from "@minecraft/server"
import { backwardCompatibilityWorld } from "../lib/backwardCompatibility"
import { apiWaypointsCache } from "../lib/waypoints/info/cache"
import { waypointUIOptionsAdmin } from "../ui/configAdminUI"
import { waypointMenu } from "../ui/mainUI"

system.beforeEvents.startup.subscribe(({itemComponentRegistry: customI, customCommandRegistry: customC}) => {
  customI.registerCustomComponent("advanced_waypoints:use", {
    onUse: ({source: player}, {params}) => {
      const { type } = params as {type: string}
      return waypointMenu(player, player.isSneaking, type == "normal")
    }
  })

  customC.registerCommand(
    {
      name: "eap:waypoint",
      description: "commands.advanced_waypoints.main_panel",
      cheatsRequired: false,
      permissionLevel: CommandPermissionLevel.Any
    },
    ({sourceEntity: player}) => {
      player && player instanceof Player && system.run(() => waypointMenu(player))
      return { status: CustomCommandStatus.Success }
    }
  ),
  customC.registerCommand({
    name: "eap:waypointconfig",
    description: "commands.advanced_waypoints.teleport",
    cheatsRequired: false,
    permissionLevel: CommandPermissionLevel.Admin
  }, ({sourceEntity: player}) => {
    player && player instanceof Player && system.run(() => waypointUIOptionsAdmin(player))
    return { status: CustomCommandStatus.Success };
  })
})

// Initialize Cache
system.run(() => {
  if(world.getDynamicProperty("aw:8.0")) world.getAllPlayers().forEach(player => {
    apiWaypointsCache.load(player)
  })

  if(!world.getDynamicProperty("aw:8.1")) backwardCompatibilityWorld.convert_v8_1()
})