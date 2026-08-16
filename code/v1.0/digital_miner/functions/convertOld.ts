import { apiScoreboard } from "../lib/math/scoreboard"
import { world, system } from "@minecraft/server"

system.run(() => {
  if(!world.getDynamicProperty("dm:0.3")) return convert_v0_3()
})

function convert_v0_3(): void {
  const miners = world.scoreboard.getObjectives().filter(value => value.displayName.startsWith("digital_miner/miner"))

  for(const score of miners){
    const dimension = score.displayName.split("/")[2]
    const height = dimensionHeight[dimension ?? ""]

    if(!height){
      apiScoreboard.removeObj(score)
      continue
    }

    apiScoreboard.setScore(score, "info/radius", 32)
    apiScoreboard.setScore(score, "info/min_y", height.min)
    apiScoreboard.setScore(score, "info/max_y", height.max)
  }

  world.setDynamicProperty("dm:0.3", true)
}

const dimensionHeight: { [key: string]: {min: number, max: number} } = {
  "overworld": {min: -64, max: 320},
  "nether": {min: 0, max: 128},
  "the_end": {min: 0, max: 128}
}