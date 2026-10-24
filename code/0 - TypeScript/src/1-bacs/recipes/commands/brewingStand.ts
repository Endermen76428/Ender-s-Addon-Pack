import { furnaceRecipeDenyList, furnaceRecipeList } from "../furnace/recipes"
import { BACSFurnaceRecipeDenyScore, BACSFurnaceRecipeScore } from "../variables"
import { ActionFormData } from "@minecraft/server-ui"
import { apiNumbers } from "../../../0-lib/math/numbers"
import { Player } from "@minecraft/server"

export function BACSCommandBrewingStandRecipe(player: Player, section = 0): void {
  const tempSet = new Set<string>()

  const items: TRecipesItemsList = Object.entries(furnaceRecipeList)
  const denyItems = Object.keys(furnaceRecipeDenyList)

  for(let i = 0, len = denyItems.length; i < len; i++){
    const item = denyItems[i]
    if(item){
      const id = item.slice(2)
      if(furnaceRecipeList[id] || tempSet.has(id)) continue
      tempSet.add(id)
      items.push([id, undefined])
    }
  }

  allowedRecipes(player, items.sort((a, b) => {
    const aVanilla = a[0].startsWith("minecraft:")
    const bVanilla = b[0].startsWith("minecraft:")

    if (aVanilla !== bVanilla) return aVanilla ? 1 : -1

    return a[0].localeCompare(b[0])
  }), Math.floor(items.length * 0.02), section)
  return
}

function allowedRecipes(player: Player, items: TRecipesItemsList, length: number, section = 0): void {
  const form = new ActionFormData()
  .title("ui.bacs:recipes.furnace.title")
  .body({rawtext:[{translate:"ui.bacs:recipes.furnace.delete.body"},{text:`${section +1}/${length +1}`}]})
  .button("ui.bacs:pages.next", "textures/BACS/general/next_page")
  .button("ui.bacs:pages.previous", "textures/BACS/general/previous_page")

  for(let i = 0; i < 50; i++){
    const item = items[section *50 + i]
    if(item == undefined) break

    form.button(item[0])
  }

  form.button("ui.bacs:pages.next", "textures/BACS/general/next_page")
  .show(player).then(({canceled, selection}) => {
    if(canceled || selection == undefined) return

    if(selection < 2 || selection == 52) return allowedRecipes(player, items, length, apiNumbers.wrapRange(section + (selection == 0 || selection == 52 ? 1 : -1), 0, length))

    const item = items[section *50 + selection -2]
    if(item == undefined) return
    delete furnaceRecipeList[item[0]]
    delete furnaceRecipeDenyList[`0/${item[0]}`]
    delete furnaceRecipeDenyList[`1/${item[0]}`]
    delete furnaceRecipeDenyList[`2/${item[0]}`]
    item[1] && BACSFurnaceRecipeScore.removeParticipant(`${item[0]}/${item[1]}`)
    BACSFurnaceRecipeDenyScore.removeParticipant(`0/${item[0]}`)
    BACSFurnaceRecipeDenyScore.removeParticipant(`1/${item[0]}`)
    BACSFurnaceRecipeDenyScore.removeParticipant(`2/${item[0]}`)

    BACSCommandBrewingStandRecipe(player, section)
  })
}

type TRecipesItemsList = ([string, string] | [string, undefined])[]