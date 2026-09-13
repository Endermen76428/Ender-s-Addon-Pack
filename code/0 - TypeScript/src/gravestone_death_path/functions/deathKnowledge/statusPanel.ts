import { apiDeathKnowledge, apiDeathKnowledgeXp, maxDeathKnowledgeXp } from "../../lib/player/deathKnowledge"
import { ActionFormData } from "@minecraft/server-ui"
import { world, Player } from "@minecraft/server"
import { apiWarn } from "../../../0-lib/player/warn"

export function showDeathKnowledgePanel(player: Player): void {
  const status = apiDeathKnowledge.getAll(player)

  const xpNextLv = (r => status.xp == maxDeathKnowledgeXp ? maxDeathKnowledgeXp : r)(apiDeathKnowledgeXp.getXpToNextLv(status.lv))
  const UpXpStr = `${status.upXp}/${maxLevelStats.upXp}`
  const UpTpKeyStr = `${status.upTpKey}/${maxLevelStats.upTpKey}`

  const progressBar = generateProgressBar(status.xp, apiDeathKnowledgeXp.getXpToNextLv(status.lv -1), xpNextLv)

  new ActionFormData()
  .title("ui.gravestone_death_path:death_knowledge.title")
  .body({
    "rawtext":[
      {"text": `${player.nameTag} - Lv.${status.lv}\n`},
      {"text": `Xp: ${status.xp} ${progressBar}§r ${xpNextLv}`},
      {"text": "\n\n"},
      {"translate": "ui.gravestone_death_path:death_knowledge.remaining_points", "with": [status.points.toString()]},
      {"text": "\n\n"},
      {"translate": "ui.gravestone_death_path:death_knowledge.status.experience", "with": [UpXpStr, `${status.upXp *10}%`]},
      {"text": "\n"},
      {"translate": "ui.gravestone_death_path:death_knowledge.status.teleport_key", "with": [UpTpKeyStr, `${status.upTpKey *10}%`]},
      {"text": "\n\n"}
    ]
  })
  .button({translate: "ui.gravestone_death_path:death_knowledge.experience", with: [UpXpStr]})
  .button({translate: "ui.gravestone_death_path:death_knowledge.teleport_key", with: [UpTpKeyStr]})
  .show(player).then(({canceled, selection}) => {
    if(canceled || selection == undefined) return

    const selectedStats = statusList[selection]
    if(selectedStats == undefined) return

    const currentLv = status[selectedStats]
    if(maxLevelStats[selectedStats] == currentLv) return showDeathKnowledgePanel(player)

    if(status.points == 0) return apiWarn.notify(player, "ui.warn.grssavestone_death_path:no_point_remaining", {type: "actionbar", sound: "warn.ender_addon_pack:bass"})

    apiDeathKnowledge.upgradeStatus(player, selectedStats)
    if(status.points > 0) return showDeathKnowledgePanel(player)
  })
}

const barSize = 50

function generateProgressBar(current: number, startValue: number, endValue: number): string {
  const currentProgress = current - startValue
  const goal = endValue - startValue
  const completed = currentProgress == goal ? barSize : Math.floor(barSize * (currentProgress / goal))
  return ("§a|".repeat(completed) + "§r") + ("|".repeat(barSize - completed))
}

const statusList: StatsList = ["upXp", "upTpKey"]
type StatsList = ["upXp", "upTpKey"]

const maxLevelStats = {
  upXp: 10,
  upTpKey: 10
}