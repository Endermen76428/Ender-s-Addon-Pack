import { world, Block, Player, Vector3 } from "@minecraft/server"
import { digitalMinerMaxRadius } from "../../../lib/variables"
import { apiScoreboard } from "../../../lib/math/scoreboard"
import { apiNumbers } from "../../../lib/math/numbers"
import { ModalFormData } from "@minecraft/server-ui"
import { apiVec3 } from "../../../lib/math/vector3"
import { apiWarn } from "../../../../0-lib/player/warn"
import { interactDigitalMiner } from "../interact"
import { apiString } from "../../../lib/string"

export const minerUISettings = new class MinerUISettings {
  settingsScreen(player: Player, block: Block, center: Vector3): void {
    const scoreInfo = apiScoreboard.getObj(`digital_miner/miner/${apiString.getDimension(block)}/${apiVec3.toString(center)}`)
    const currentRadius = apiScoreboard.getScore(scoreInfo, "info/radius")
    const currentMax = apiScoreboard.getScore(scoreInfo, "info/max_y")
    const currentMin = apiScoreboard.getScore(scoreInfo, "info/min_y")

    const heightMin = block.dimension.heightRange.min
    const heightMax = block.dimension.heightRange.max
    const heightRange = [`${heightMin}`, `${heightMax}`]

    new ModalFormData()
    .title("ui.digital_miner:miner.settings")
    .textField("ui.digital_miner:settings.radius", "ui.digital_miner:settings.radius.hold", {defaultValue: `${currentRadius}`, tooltip: "ui.digital_miner:settings.radius.hold"})
    .textField("ui.digital_miner:settings.max_height", {translate: "ui.digital_miner:settings.height_range", with: heightRange}, {defaultValue: `${currentMax}`, tooltip: {translate: "ui.digital_miner:settings.height_range", with: heightRange}})
    .textField("ui.digital_miner:settings.min_height", {translate: "ui.digital_miner:settings.height_range", with: heightRange}, {defaultValue: `${currentMin}`, tooltip: {translate: "ui.digital_miner:settings.height_range", with: heightRange}})
    .show(player).then(({canceled, formValues}) => {
      if(canceled || !formValues) return interactDigitalMiner.openPainel(player, block)

      const [ radiusStr, maxStr, minStr ] = formValues
      if(typeof radiusStr != "string" || typeof maxStr != "string" || typeof minStr != "string") return

      const radiusNum = parseInt(radiusStr), maxNum = parseInt(maxStr), minNum = parseInt(minStr)
      if(isNaN(radiusNum) || isNaN(maxNum) || isNaN(minNum)) return apiWarn.notify(player, "warn.digital_miner:settings.invalid_number", {sound: "warn.ender_addon_pack:break"})

      const radius = apiNumbers.clamp(radiusNum, 0, digitalMinerMaxRadius)
      const min = apiNumbers.clamp(minNum, heightMin, heightMax)
      const max = apiNumbers.clamp(apiNumbers.clamp(maxNum, heightMin, heightMax), min, heightMax)

      const score = apiScoreboard.getObj(`digital_miner/miner/${apiString.getDimension(block)}/${apiVec3.toString(center)}`)
      apiScoreboard.setScore(score, "info/radius", radius)
      apiScoreboard.setScore(score, "info/max_y", max)
      apiScoreboard.setScore(score, "info/min_y", min)

      apiWarn.notify(player, "warn.digital_miner:settings.changed", {sound: "warn.ender_addon_pack:levelup"})
    })
  }
}