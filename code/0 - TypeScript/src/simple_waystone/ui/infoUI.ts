import { Block, Player, ItemStack } from "@minecraft/server"
import { apiScoreboard } from "../../0-lib/math/scoreboard"
import { ActionFormData } from "@minecraft/server-ui"
import { apiNumbers } from "../../0-lib/math/numbers"
import { waystoneCache } from "../lib/cache/waystone"
import { apiWarn } from "../../0-lib/player/warn"
import { upgradeXpDiscount } from "../variables"

export const exitDirection: ["auto", "north", "east", "south", "west"] = ["auto", "north", "east", "south", "west"]

export function waystoneUIInfo(player: Player, block: Block): void {
  const id = `${block.dimension.id.replace("minecraft:", "")}/${block.x},${block.y},${block.z}`
  const waystone = waystoneCache.getWaystone(id)
  if(!waystone) return

  const dirIndex = exitDirection.findIndex(value => value == waystone.offset)
  if(dirIndex == -1) return

  const discount = waystone.xpDiscount *100

  new ActionFormData()
  .title("ui.simple_waystone:waystone.info.title")
  .button({translate: "ui.simple_waystone:waystone.info.xp_discount", with: [`${100 - (discount)}§r%`]}, upgradeXpTexture[discount] ?? "textures/blocks/barrier")
  .button({"rawtext":[{"translate": "ui.simple_waystone:waystone.info.exit_direction"}, {"translate": `ui.simple_waystone:waystone.info.exit_direction.${waystone.offset}`}]}, `textures/simple_waystone/ui/icons/offset/${waystone.offset}`)
  .show(player).then(({canceled, selection}) => {
    if(canceled || selection == undefined) return

    if(selection == 0) return removeXpDiscount(player, id, discount)
    if(selection == 1) return changeExitDir(player, id, dirIndex, block)
  })
}

function removeXpDiscount(player: Player, id: string, discount: number): void {
  const item = upgradeXpDiscount[discount]
  if(!item) return

  apiWarn.notify(player, "warning.simple_waystone:upgrades.xp_cost.removed", {sound: "warn.ender_addon_pack:pop"})
  player.dimension.spawnItem(new ItemStack(item), player.location)
  apiScoreboard.setScore(`simple_waystone/w/${id}`, "xp_discount", 100)
  waystoneCache.updateDiscount(100, id)
}

function changeExitDir(player: Player, id: string, dir: number, block: Block): void {
  const index = apiNumbers.wrapRange(dir +1, 0, 4)
  apiScoreboard.setScore(`simple_waystone/w/${id}`, "offset", index)
  waystoneCache.updateExitOffset(index, id)
  waystoneUIInfo(player, block)
}

const upgradeXpTexture: { [key: number]: string } = {
  70: "textures/blocks/iron_block",
  50: "textures/blocks/diamond_block",
  0: "textures/blocks/netherite_block"
}