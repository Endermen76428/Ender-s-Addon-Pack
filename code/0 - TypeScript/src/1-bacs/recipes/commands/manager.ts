import { BACSCommandBrewingStandRecipe } from "./brewingStand"
import { ActionFormData } from "@minecraft/server-ui"
import { BACSCommandFurnaceRecipe } from "./furnace"
import { Player } from "@minecraft/server"

export function BACSCommandRecipes(player: Player): void {
  new ActionFormData()
  .title("ui.bacs:recipes.general.title")
  .button("ui.bacs:recipes.furnace.title")
  // .button("ui.bacs:recipes.brewing_stand.title")
  .show(player).then(({canceled, selection}) => {
    if(canceled || selection == undefined) return

    if(selection == 0) return BACSCommandFurnaceRecipe(player)
    if(selection == 1) return BACSCommandBrewingStandRecipe(player)
  })
}