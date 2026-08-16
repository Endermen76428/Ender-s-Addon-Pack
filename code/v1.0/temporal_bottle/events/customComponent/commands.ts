import { world, system, CommandPermissionLevel, CustomCommand, CustomCommandOrigin, CustomCommandParamType, CustomCommandResult, CustomCommandStatus as Status, EquipmentSlot, Player } from "@minecraft/server"
import { temporalBottleItem } from "../../lib/temporalBottle/bottle"
import { apiEquippable } from "../../lib/player/equippable"
import { apiNumbers } from "../../lib/math/numbers"

export const startUpCommandFunc: Record<StartUpCommandIds, (origin: CustomCommandOrigin, ...args: any[]) => CustomCommandResult | undefined> = {
  "giveTime": ({sourceEntity: player}, functionType, timeAmount) => {
    if(!player || !(player instanceof Player) || typeof functionType != "string" || typeof timeAmount != "number") return { status: Status.Failure }

    const item = apiEquippable.getItemSlot(player, EquipmentSlot.Mainhand)
    if(!item || item.typeId != "temporal_bottle:temporal_bottle") return { status: Status.Failure, message: "warn.temporal_bottle:custom_command.give_time.fail.invalid_item" }

    if(functionType == "set"){
      system.run(() => { temporalBottleItem.setTime(player, apiNumbers.clamp(timeAmount, 0, 2147483647), player.selectedSlotIndex) })
      return { status: Status.Success, message: "warn.temporal_bottle:custom_command.give_time.success.set" }
    }

    const currentTime = temporalBottleItem.getTime(player, player.selectedSlotIndex)
    system.run(() => { temporalBottleItem.setTime(player, apiNumbers.clamp(currentTime + timeAmount, 0, 2147483647), player.selectedSlotIndex) })
    return { status: Status.Success, message: "warn.temporal_bottle:custom_command.give_time.success.add" }
  }
}

export const startUpCommandHeader: Record<StartUpCommandIds, CustomCommand> = {
  "giveTime": {
    name: "eap:givetime",
    description: "commands.temporal_bottle:give_time.description",
    cheatsRequired: true,
    permissionLevel: CommandPermissionLevel.GameDirectors,
    mandatoryParameters: [
      { name: "eap:function", type: CustomCommandParamType.Enum },
      { name: "eap:time", type: CustomCommandParamType.Integer }
    ]
  }
}

type StartUpCommandIds = "giveTime"