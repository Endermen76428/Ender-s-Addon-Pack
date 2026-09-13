import { ModalFormData } from "@minecraft/server-ui"
import { world, Player } from "@minecraft/server"
import { AddonConfig } from "../variables"
import { apiWarn } from "../../0-lib/player/warn"

export function waystoneUIAdmin(player: Player): void {
  new ModalFormData()
  .title("ui.simple_waystone:admin.settings.title")
  .slider({translate: "ui.simple_waystone:admin.settings.xp_max"}, 0, 30, {defaultValue: AddonConfig.xpMax, valueStep: 1})
  .slider({translate: "ui.simple_waystone:admin.settings.xp_by_distance"}, 100, 5000, {defaultValue: AddonConfig.xpByDistance, valueStep: 100})
  .slider({translate: "ui.simple_waystone:admin.settings.xp_between_dimension"}, 0, 30, {defaultValue: AddonConfig.xpByDimension, valueStep: 1})
  .toggle("ui.simple_waystone:admin.settings.tp_by_block", {defaultValue: AddonConfig.tpByBlock})
  .toggle("ui.simple_waystone:admin.settings.tp_between_dimension", {defaultValue: AddonConfig.tpBetweenDimension})
  .slider({translate: "ui.simple_waystone:admin.settings.tp_cooldown"}, 0, 300, {defaultValue: AddonConfig.tpCooldown, valueStep: 1})
  .slider({translate: "ui.simple_waystone:admin.settings.item_cooldown"}, 0, 300, {defaultValue: AddonConfig.itemCooldown, valueStep: 1})
  .toggle("ui.simple_waystone:admin.settings.disable_discount", {defaultValue: AddonConfig.disableDiscount})
  .submitButton("ui.simple_waystone:waystone.create.button")
  .show(player).then(({canceled, formValues}) => {
    if(canceled || formValues == undefined) return  apiWarn.notify(player, "warning.simple_waystone:waystone.cancel_settings", {type: "actionbar", sound: "warn.ender_addon_pack:break"})

    AddonConfig.xpMax = (r => typeof r == "number" ? r : AddonConfig.xpMax)(formValues[0])
    AddonConfig.xpByDistance = (r => typeof r == "number" ? r : AddonConfig.xpByDistance)(formValues[1])
    AddonConfig.xpByDimension = (r => typeof r == "number" ? r : AddonConfig.xpByDimension)(formValues[2])
    AddonConfig.tpByBlock = (r => typeof r == "boolean" ? r : AddonConfig.tpByBlock)(formValues[3])
    AddonConfig.tpBetweenDimension = (r => typeof r == "boolean" ? r : AddonConfig.tpBetweenDimension)(formValues[4])
    AddonConfig.tpCooldown = (r => typeof r == "number" ? r : AddonConfig.tpCooldown)(formValues[5])
    AddonConfig.itemCooldown = (r => typeof r == "number" ? r : AddonConfig.itemCooldown)(formValues[6])
    AddonConfig.disableDiscount = (r => typeof r == "boolean" ? r : AddonConfig.disableDiscount)(formValues[7])

    world.setDynamicProperty("config:xp_max", AddonConfig.xpMax)
    world.setDynamicProperty("config:xp_distance", AddonConfig.xpByDistance)
    world.setDynamicProperty("config:xp_dimension", AddonConfig.xpByDimension)
    world.setDynamicProperty("config:tp_by_block", AddonConfig.tpByBlock)
    world.setDynamicProperty("config:tp_betw_dimension", AddonConfig.tpBetweenDimension)
    world.setDynamicProperty("config:tp_cooldown", AddonConfig.tpCooldown)
    world.setDynamicProperty("config:item_cooldown", AddonConfig.itemCooldown)
    world.setDynamicProperty("config:disable_discount", AddonConfig.disableDiscount)

    apiWarn.playSound(player, "warn.ender_addon_pack:levelup")
    world.sendMessage({translate: "warning.simple_waystone:waystone.admin.save_settings", with: [player.name]})
  })
}