import { world, ItemStack, Player } from "@minecraft/server"
import { apiConfigAdmin } from "../../lib/configAdmin"
import { apiWarn } from "../../../0-lib/player/warn"

export function teleportToGravestone(player: Player, item: ItemStack): void {
  if(!apiConfigAdmin.get("teleport")) return apiWarn.notify(player, "item.warn.gravestone_death_path:key.teleport_disabled", {sound: "warn.ender_addon_pack:break"})

  const inv = player.getComponent("inventory")?.container
  if(!inv) return

  const lastPos = (r => typeof r != "object" ? undefined : r)(item.getDynamicProperty("last"))
  const lastDimension = (r => typeof r != "string" ? undefined : r)(item.getDynamicProperty("lastD"))
  if(!lastPos || !lastDimension) return apiWarn.notify(player, "item.warn.gravestone_death_path:key.corrupted", {sound: "warn.ender_addon_pack:break"})

  const center = {x: lastPos.x +0.5, y: lastPos.y +0.5, z: lastPos.z +0.5}
  player.teleport(center, {dimension: world.getDimension(lastDimension)})
  apiWarn.notify(player, "", {sound: "item.gravestone_death_path:gravestone_key.teleport", delaySound: 5, particle: {id: "gravestone_death_path:teleport_particle", pos: center}, delayParticle: 5})
}