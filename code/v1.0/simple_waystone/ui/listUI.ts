import { world, system, ItemStack, Block, GameMode, Player, Vector3 } from "@minecraft/server"
import { waystoneInfo, WaystoneInfo } from "../lib/waystone/info"
import { apiWaystoneSpace } from "../lib/waystone/space"
import { apiTeleportItem } from "../lib/item/teleportItem"
import { waystonesList } from "../lib/waystone/list"
import { ActionFormData } from "@minecraft/server-ui"
import { apiCooldown } from "../lib/apiCooldown"
import { AddonConfig } from "../variables"
import { apiVec3 } from "../lib/vector"
import { apiWarn } from "../../0-lib/player/warn"

const xpSprite = ["", " - \ue701", " - \ue702", " - \ue703", "\ue700"]
export const colorDimension: { [key: string]: string } = {"minecraft:overworld": "§2", "minecraft:nether": "§4", "minecraft:the_end": "§5"}

export function waystoneUIList(player: Player, block?: Block, waystone?: WaystoneInfo, item?: ItemStack, publicList = false){
  const access = publicList ? 1 : 0
  const waystones = publicList ? waystonesList.getPublicWaystones(player) : waystonesList.getPrivateWaystones(player)
  if(waystones.length < 1){
    if(publicList) return apiWarn.notify(player, "warning.simple_waystone:waystone.fail_find_waystones", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})
    return waystoneUIList(player, block, waystone, item, !publicList)
  }

  const buttons = waystones.map(value => {
    const calc = player.dimension.id != value.dimension ? {cost: AddonConfig.xpByDimension, distance: -1} : apiWaystoneSpace.calculateCost(waystone?.pos ?? (block?.location ?? player.location), value)
    const cost = AddonConfig.disableDiscount ? calc.cost : Math.floor(calc.cost * ((waystone?.xpDiscount ?? 1) >= value.xpDiscount ? value.xpDiscount : (waystone?.xpDiscount ?? 1)))
    const name = value.name.length > 20 ? value.name.slice(0, 19) + "..." : value.name
    return {
      cost,
      distance: calc.distance,
      id: `${colorDimension[value.dimension]}${name}§r` + `${cost > 3 ? (" - §l§2" + xpSprite[4] + cost + "§r") : xpSprite[cost]}`,
      icon: value.icon,
      isFavorite: value.favorite.has(player.id)
    }
  })

  const form = new ActionFormData()
  .title(item ? {"rawtext":[{"translate": `item.${item.typeId}`}, {"text": " - "}, {"translate": "ui.simple_waystone:waystone.list." + access}]} : {translate: "ui.simple_waystone:waystone.list.title." + access, with: [waystone ? ` - ${colorDimension[waystone.dimension]}${waystone.name}§r` : ""]} )
  .body("ui.simple_waystone:waystone.list.body")
  .button({translate: "ui.simple_waystone:waystone.list.title." + (publicList ? 0 : 1), with: [""]}, !publicList ? "textures/ui/world_glyph_color" : "textures/ui/icon_lock")
  buttons.forEach((button) => form.button({"rawtext":[{"translate": button.id}, {"text": "\n"}, {"translate": button.distance == -1 ? "ui.simple_waystone:waystone.list.other_dimension" : button.distance + "m"}]}, `textures/simple_waystone/ui/icons/${waystoneListIconPath[button.icon]}${button.isFavorite ? "_fav" : ""}`) )
  form.show(player).then(({canceled, selection}) => {
    if(canceled || selection == undefined) return
    if(selection == 0) return waystoneUIList(player, block, waystone, item, !publicList)

    const button = buttons[selection -1]
    const selected = waystones[selection -1]
    if(!selected || !button || (selected.name == waystone?.name && apiVec3.compare(selected.pos, waystone.pos))) return apiWarn.notify(player, "warning.simple_waystone:waystone.tp_current_waystone", {type: "actionbar"})

    if(player.level < button.cost && player.getGameMode() != GameMode.Creative) return apiWarn.notify(player, "warning.simple_waystone:waystone.insufficient_xp", {sound: "warn.ender_addon_pack:bass"})

    if(!waystone && item){
      const execute = apiTeleportItem[item.typeId]
      if(execute) if(execute(player)) return apiWarn.notify(player, "warning.simple_waystone:teleport_item.invalid_teleport_item", {type: "actionbar", sound: "warn.ender_addon_pack:break"})
    }
    if(!item) apiWarn.playSound(player, "simple_waystone.block.waystone.teleport", {delaySound: 1})
    if(waystone) apiCooldown.set(player, "waystoneCooldown", AddonConfig.tpCooldown)

    teleport(player, selected, button.cost)
    system.runTimeout(() => hasWaystone(player, selected.pos), 40)
  })
}

function teleport(player: Player, info: WaystoneInfo, cost: number): void {
  if(player.getGameMode() != GameMode.Creative) player.addLevels(-cost)

  const rot = player.getRotation()
  if(info.offset == "auto"){
    const direction = (rot.y < 45 || rot.y > 325) ? "north" : (rot.y > 45 && rot.y < 135) ? "east" : (rot.y > 135 && rot.y < 225) ? "south" : "west"
    const offset = waystonOffset[direction] ?? ["y", 0]
    const pos = {x: info.pos.x +0.5, y: info.pos.y, z: info.pos.z +0.5}
    pos[offset[0]] += offset[1]
    player.teleport(pos, {dimension: world.getDimension(info.dimension), rotation: {x: rot.x, y: waystoneRotate[direction] ?? rot.y}})
  } else {
    const offset = waystonOffset[info.offset] ?? ["y", 0]
    const pos = {x: info.pos.x +0.5, y: info.pos.y, z: info.pos.z +0.5}
    pos[offset[0]] += offset[1] *2
    player.teleport(pos, {dimension: world.getDimension(info.dimension), rotation: {x: rot.x, y: waystoneRotate[info.offset] ?? rot.y}})
  }
}

function hasWaystone(player: Player, pos: Vector3): void {
  try{
    const block = player.dimension.getBlock(pos)

    if(!block){
      system.runTimeout(() => { hasWaystone(player, pos) }, 5)
      return
    }

    if(!block.hasTag("simple_waystone:waystone")){
      waystoneInfo.removeWaystone(pos, player.dimension.id)
      apiWarn.notify(player, "warning.simple_waystone:waystone.corrupted", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})
    }
  } catch (e) { console.warn(e) }
}

const waystonOffset: { [key: string]: ["x" | "z", -0.5 | 0.5] } = {
  "north": ["z", -0.5],
  "south": ["z", 0.5],
  "east": ["x", 0.5],
  "west": ["x", -0.5]
}

const waystoneRotate: { [key: string]: number } = {
  "south": 0,
  "west": 90,
  "north": 180,
  "east": -90
}

export const waystoneListIconPath: string[] = [
  "waystone"
]