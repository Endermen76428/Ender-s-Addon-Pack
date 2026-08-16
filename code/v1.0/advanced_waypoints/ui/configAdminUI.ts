import { world, Player } from "@minecraft/server"
import { ModalFormData } from "@minecraft/server-ui"
import { Variables } from "../lib/variables"

export function waypointUIOptionsAdmin(player: Player): void {
  new ModalFormData()
  .title("ui.advanced_waypoints:config.title")
  .toggle("ui.advanced_waypoints:config.tp", {defaultValue: (r => typeof r != "boolean" ? true : r)(world.getDynamicProperty("c:tp"))})
  .toggle("ui.advanced_waypoints:config.cost", {defaultValue: (r => typeof r != "boolean" ? true : r)(world.getDynamicProperty("c:tpcost"))})
  .slider({translate: "ui.advanced_waypoints:config.distance"}, 100, 10000, {valueStep: 100, defaultValue: 1 / (r => typeof r != "number" ? 0.002 : r)(world.getDynamicProperty("c:tpdis"))})
  .show(player).then(({canceled, formValues}) => {
    if(canceled || formValues == undefined) return

    const tp = (r => typeof r != "boolean" ? true : r)(formValues[0])
    const cost = (r => typeof r != "boolean" ? true : r)(formValues[1])
    const distance = 1 / (r => typeof r != "number" ? 500 : r)(formValues[2])
    world.setDynamicProperty("c:tp", tp)
    Variables.teleportEnabled = tp
    world.setDynamicProperty("c:tpcost", cost)
    Variables.costXp = cost
    world.setDynamicProperty("c:tpdis", distance)
    Variables.xpByDistance = distance
  })
}