import { ActionFormData } from "@minecraft/server-ui"
import { transformIntoTpKey } from "./transformKey"
import { world, Player } from "@minecraft/server"

export function showKeyPanel(player: Player): void {
  new ActionFormData()
  .title("item.gravestone_death_path:gravestone_key")
  .button("ui.gravestone_death_path:key.transform_into_tp")
  .button("ui.gravestone_death_path:key.death_path")
  .show(player).then(({canceled, selection}) => {
    if(canceled || selection == undefined) return
    const exe = buttonFunctions[selection]
    exe && exe(player)
  })
}

const buttonFunctions: { [key: number]: (player: Player) => void } = {
  0: (player) => { transformIntoTpKey(player) }
}