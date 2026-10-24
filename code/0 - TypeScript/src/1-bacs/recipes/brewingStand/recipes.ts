import { ScoreboardObjective } from "@minecraft/server"

export function BACSLoadBrewingStandRecipe(recipe: ScoreboardObjective, deny: ScoreboardObjective): void {
  const denied = deny.getParticipants()
  const denyGetted = new Set<string>()
  for(let i = 0, len = denied.length; i < len; i++){
    const id = denied[i]?.displayName
    if(id == undefined) continue

    brewingStandRecipeDenyList[id] = true
  }

  denyGetted.clear()

  const recipes = recipe.getParticipants()
  for(let i = 0, len = recipes.length; i < len; i++){
    const id = recipes[i]?.displayName
    if(id == undefined) continue

    const [ base, reagent, output ] = id.split("/", 3)

    if(base == undefined || reagent == undefined || output == undefined) continue

    brewingStandRecipeList[base + "/" + reagent] = output
  }
}



export const brewingStandRecipeList: { [key: string]: string } = {
  "minecraft:awkward/minecraft:blaze_powder": "minecraft:strength",
  "minecraft:awkward/minecraft:breeze_rod": "minecraft:wind_charged",
  "minecraft:awkward/minecraft:fermented_spider_eye": "minecraft:weakness",
  "minecraft:awkward/minecraft:ghast_tear": "minecraft:regeneration",
  "minecraft:awkward/minecraft:golden_carrot": "minecraft:nightvision",
  "minecraft:awkward/minecraft:magma_cream": "minecraft:fire_resistance",
  "minecraft:awkward/minecraft:phantom_membrane": "minecraft:slow_falling",
  "minecraft:awkward/minecraft:pufferfish": "minecraft:water_breathing",
  "minecraft:awkward/minecraft:rabbit_foot": "minecraft:leaping",
  "minecraft:awkward/minecraft:slime": "minecraft:oozing",
  "minecraft:awkward/minecraft:speckled_melon": "minecraft:healing",
  "minecraft:awkward/minecraft:spider_eye": "minecraft:poison",
  "minecraft:awkward/minecraft:stone": "minecraft:infested",
  "minecraft:awkward/minecraft:sugar": "minecraft:swiftness",
  "minecraft:awkward/minecraft:turtle_helmet": "minecraft:turtle_master",
  "minecraft:awkward/minecraft:web": "minecraft:weaving",
  "minecraft:fire_resistance/minecraft:redstone": "minecraft:long_fire_resistance",
  "minecraft:harming/minecraft:glowstone_dust": "minecraft:strong_harming",
  "minecraft:healing/minecraft:fermented_spider_eye": "minecraft:harming",
  "minecraft:healing/minecraft:glowstone_dust": "minecraft:strong_healing",
  "minecraft:invisibility/minecraft:redstone": "minecraft:long_invisibility",
  "minecraft:leaping/minecraft:fermented_spider_eye": "minecraft:slowness",
  "minecraft:leaping/minecraft:glowstone_dust": "minecraft:strong_leaping",
  "minecraft:leaping/minecraft:redstone": "minecraft:long_leaping",
  "minecraft:long_nightvision/minecraft:fermented_spider_eye": "minecraft:long_invisibility",
  "minecraft:long_swiftness/minecraft:fermented_spider_eye": "minecraft:long_slowness",
  "minecraft:long_leaping/minecraft:fermented_spider_eye": "minecraft:long_slowness",
  "minecraft:long_mundane/minecraft:fermented_spider_eye": "minecraft:long_weakness",
  "minecraft:long_poison/minecraft:fermented_spider_eye": "minecraft:harming",
  "minecraft:long_strength/minecraft:fermented_spider_eye": "minecraft:long_weakness",
  "minecraft:mundane/minecraft:fermented_spider_eye": "minecraft:weakness",
  "minecraft:nightvision/minecraft:fermented_spider_eye": "minecraft:invisibility",
  "minecraft:nightvision/minecraft:redstone": "minecraft:long_nightvision",
  "minecraft:poison/minecraft:fermented_spider_eye": "minecraft:harming",
  "minecraft:poison/minecraft:glowstone_dust": "minecraft:strong_poison",
  "minecraft:poison/minecraft:redstone": "minecraft:long_poison",
  "minecraft:regeneration/minecraft:glowstone_dust": "minecraft:strong_regeneration",
  "minecraft:regeneration/minecraft:redstone": "minecraft:long_regeneration",
  "minecraft:slowness/minecraft:glowstone_dust": "minecraft:strong_slowness",
  "minecraft:slowness/minecraft:redstone": "minecraft:long_slowness",
  "minecraft:slow_falling/minecraft:redstone": "minecraft:long_slow_falling",
  "minecraft:strength/minecraft:fermented_spider_eye": "minecraft:weakness",
  "minecraft:strength/minecraft:glowstone_dust": "minecraft:strong_strength",
  "minecraft:strength/minecraft:redstone": "minecraft:long_strength",
  "minecraft:strong_healing/minecraft:fermented_spider_eye": "minecraft:strong_harming",
  "minecraft:strong_poison/minecraft:fermented_spider_eye": "minecraft:strong_harming",
  "minecraft:strong_strength/minecraft:fermented_spider_eye": "minecraft:weakness",
  "minecraft:swiftness/minecraft:fermented_spider_eye": "minecraft:slowness",
  "minecraft:swiftness/minecraft:glowstone_dust": "minecraft:strong_swiftness",
  "minecraft:swiftness/minecraft:redstone": "minecraft:long_swiftness",
  "minecraft:thick/minecraft:fermented_spider_eye": "minecraft:weakness",
  "minecraft:turtle_master/minecraft:glowstone_dust": "minecraft:strong_turtle_master",
  "minecraft:turtle_master/minecraft:redstone": "minecraft:long_turtle_master",
  "minecraft:water/minecraft:blaze_powder": "minecraft:mundane",
  "minecraft:water_breathing/minecraft:redstone": "minecraft:long_water_breathing",
  "minecraft:water/minecraft:breeze_rod": "minecraft:mundane",
  "minecraft:water/minecraft:fermented_spider_eye": "minecraft:weakness",
  "minecraft:water/minecraft:ghast_tear": "minecraft:mundane",
  "minecraft:water/minecraft:glowstone_dust": "minecraft:thick",
  "minecraft:water/minecraft:magma_cream": "minecraft:mundane",
  "minecraft:water/minecraft:nether_wart": "minecraft:awkward",
  "minecraft:water/minecraft:rabbit_foot": "minecraft:mundane",
  "minecraft:water/minecraft:redstone": "minecraft:mundane",
  "minecraft:water/minecraft:slime": "minecraft:mundane",
  "minecraft:water/minecraft:speckled_melon": "minecraft:mundane",
  "minecraft:water/minecraft:spider_eye": "minecraft:mundane",
  "minecraft:water/minecraft:stone": "minecraft:mundane",
  "minecraft:water/minecraft:sugar": "minecraft:mundane",
  "minecraft:water/minecraft:web": "minecraft:mundane",
  "minecraft:weakness/minecraft:redstone": "minecraft:long_weakness"

  // Addons
  // "minecraft:potion/minecraft:obsidian": "mutant:chemical_x",
  // "minecraft:splash_potion/minecraft:obsidian": "mutant:chemical_x",
  // "minecraft:potion/minecraft:amethyst_shard": "bv:recall_potion",
  // "mbl_ts:fizzy_water/mbl_ts:dried_nether_wart": "mbl_ts:vial_of_netherwart_solution",
  // "mbl_ts:bottle_of_water_dirty_4/mbl_ts:sweet_yeast_mix": "mbl_ts:fizzy_water",
  // "minecraft:potion/mbl_ts:zombie_heart": "mbl_ts:bottle_of_zombie_goo",
  // "mbl_ts:bottle_of_zombie_goo/mbl_ts:vial_of_netherwart_solution": "mbl_ts:zombie_vaccine"
}

export const brewingStandRecipeDenyList: { [key: string]: boolean } = {
  "minecraft:strength/minecraft:blaze_powder": true,
  "minecraft:wind_charged/minecraft:breeze_rod": true,
  "minecraft:weakness/minecraft:fermented_spider_eye": true,
  "minecraft:regeneration/minecraft:ghast_tear": true,
  "minecraft:nightvision/minecraft:golden_carrot": true,
  "minecraft:fire_resistance/minecraft:magma_cream": true,
  "minecraft:slow_falling/minecraft:phantom_membrane": true,
  "minecraft:water_breathing/minecraft:pufferfish": true,
  "minecraft:leaping/minecraft:rabbit_foot": true,
  "minecraft:oozing/minecraft:slime": true,
  "minecraft:healing/minecraft:speckled_melon": true,
  "minecraft:poison/minecraft:spider_eye": true,
  "minecraft:infested/minecraft:stone": true,
  "minecraft:swiftness/minecraft:sugar": true,
  "minecraft:turtle_master/minecraft:turtle_helmet": true,
  "minecraft:weaving/minecraft:web": true,
  "minecraft:long_fire_resistance/minecraft:redstone": true,
  "minecraft:strong_harming/minecraft:glowstone_dust": true,
  "minecraft:harming/minecraft:fermented_spider_eye": true,
  "minecraft:strong_healing/minecraft:glowstone_dust": true,
  "minecraft:long_invisibility/minecraft:redstone": true,
  "minecraft:slowness/minecraft:fermented_spider_eye": true,
  "minecraft:strong_leaping/minecraft:glowstone_dust": true,
  "minecraft:long_leaping/minecraft:redstone": true,
  "minecraft:long_invisibility/minecraft:fermented_spider_eye": true,
  "minecraft:long_slowness/minecraft:fermented_spider_eye": true,
  "minecraft:long_weakness/minecraft:fermented_spider_eye": true,
  "minecraft:invisibility/minecraft:fermented_spider_eye": true,
  "minecraft:long_nightvision/minecraft:redstone": true,
  "minecraft:strong_poison/minecraft:glowstone_dust": true,
  "minecraft:long_poison/minecraft:redstone": true,
  "minecraft:strong_regeneration/minecraft:glowstone_dust": true,
  "minecraft:long_regeneration/minecraft:redstone": true,
  "minecraft:strong_slowness/minecraft:glowstone_dust": true,
  "minecraft:long_slowness/minecraft:redstone": true,
  "minecraft:long_slow_falling/minecraft:redstone": true,
  "minecraft:strong_strength/minecraft:glowstone_dust": true,
  "minecraft:long_strength/minecraft:redstone": true,
  "minecraft:strong_harming/minecraft:fermented_spider_eye": true,
  "minecraft:strong_swiftness/minecraft:glowstone_dust": true,
  "minecraft:long_swiftness/minecraft:redstone": true,
  "minecraft:strong_turtle_master/minecraft:glowstone_dust": true,
  "minecraft:long_turtle_master/minecraft:redstone": true,
  "minecraft:mundane/minecraft:blaze_powder": true,
  "minecraft:long_water_breathing/minecraft:redstone": true,
  "minecraft:mundane/minecraft:breeze_rod": true,
  "minecraft:mundane/minecraft:ghast_tear": true,
  "minecraft:thick/minecraft:glowstone_dust": true,
  "minecraft:mundane/minecraft:magma_cream": true,
  "minecraft:awkward/minecraft:nether_wart": true,
  "minecraft:mundane/minecraft:rabbit_foot": true,
  "minecraft:mundane/minecraft:redstone": true,
  "minecraft:mundane/minecraft:slime": true,
  "minecraft:mundane/minecraft:speckled_melon": true,
  "minecraft:mundane/minecraft:spider_eye": true,
  "minecraft:mundane/minecraft:stone": true,
  "minecraft:mundane/minecraft:sugar": true,
  "minecraft:mundane/minecraft:web": true,
  "minecraft:long_weakness/minecraft:redstone": true
}