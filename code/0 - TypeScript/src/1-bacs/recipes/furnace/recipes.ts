import { ScoreboardObjective } from "@minecraft/server"

export function BACSLoadFurnaceRecipe(recipe: ScoreboardObjective, deny: ScoreboardObjective): void {
  const denied = deny.getParticipants()
  const denyGetted = new Set<string>()
  for(let i = 0, len = denied.length; i < len; i++){
    const id = denied[i]?.displayName
    if(id == undefined) continue
    if(id[1] != "/") continue // Temporario - Evitar bugs com o Travel Backpacks que não tem o sistema de index

    const itemId = id.slice(2)
    if(denyGetted.has(itemId)) continue
    denyGetted.add(itemId)

    for(let i2 = 0; i2 < 3; i2++){
      const newId = `${i2}/${itemId}`
      if(deny.hasParticipant(newId)){
        furnaceRecipeDenyList[newId] = true
      } else {
        const typeId = furnacesByIndex[i2]
        if(typeId == undefined) continue

        furnaceHasRecipe[typeId]?.add(itemId)
      }
    }
  }

  denyGetted.clear()

  const recipes = recipe.getParticipants()
  for(let i = 0, len = recipes.length; i < len; i++){
    const id = recipes[i]?.displayName
    if(id == undefined) continue

    const [ input, output ] = id.split("/", 2)

    if(input == undefined || output == undefined) continue
    furnaceRecipeList[input] = output
  }
}

const furnacesByIndex: string[] = [
  "minecraft:furnace",
  "minecraft:blast_furnace",
  "minecraft:smoker"
]



const blastFurnaceRecipes = ["minecraft:ancient_debris","minecraft:chainmail_boots","minecraft:chainmail_chestplate","minecraft:chainmail_helmet","minecraft:chainmail_leggings","minecraft:coal_ore","minecraft:copper_axe","minecraft:copper_boots","minecraft:copper_chestplate","minecraft:copper_helmet","minecraft:copper_hoe","minecraft:copper_horse_armor","minecraft:copper_leggings","minecraft:copper_nautilus_armor","minecraft:copper_ore","minecraft:copper_pickaxe","minecraft:copper_shovel","minecraft:copper_spear","minecraft:copper_sword","minecraft:deepslate_coal_ore","minecraft:deepslate_copper_ore","minecraft:deepslate_diamond_ore","minecraft:deepslate_emerald_ore","minecraft:deepslate_gold_ore","minecraft:deepslate_iron_ore","minecraft:deepslate_lapis_ore","minecraft:deepslate_redstone_ore","minecraft:diamond_ore","minecraft:emerald_ore","minecraft:gold_ore","minecraft:golden_axe","minecraft:golden_boots","minecraft:golden_chestplate","minecraft:golden_helmet","minecraft:golden_hoe","minecraft:golden_leggings","minecraft:golden_nautilus_armor","minecraft:golden_pickaxe","minecraft:golden_shovel","minecraft:golden_spear","minecraft:golden_sword","minecraft:horsearmorgold","minecraft:horsearmoriron","minecraft:iron_axe","minecraft:iron_boots","minecraft:iron_chestplate","minecraft:iron_helmet","minecraft:iron_hoe","minecraft:iron_leggings","minecraft:iron_nautilus_armor","minecraft:iron_ore","minecraft:iron_pickaxe","minecraft:iron_shovel","minecraft:iron_spear","minecraft:iron_sword","minecraft:lapis_ore","minecraft:nether_gold_ore","minecraft:quartz_ore","minecraft:raw_copper","minecraft:raw_gold","minecraft:raw_iron","minecraft:redstone_ore"]
const smokerRecipes = ["minecraft:beef","minecraft:chicken","minecraft:fish","minecraft:kelp","minecraft:muttonRaw","minecraft:porkchop","minecraft:potato","minecraft:rabbit","minecraft:salmon"]

export const furnaceHasRecipe: { [key: string]: Set<string> } = {
  "minecraft:furnace": new Set([
    "minecraft:acacia_leaves","minecraft:acacia_log","minecraft:acacia_wood","minecraft:azalea_leaves","minecraft:azalea_leaves_flowered","minecraft:basalt","minecraft:birch_leaves","minecraft:birch_log","minecraft:birch_wood","minecraft:black_terracotta","minecraft:blue_terracotta","minecraft:brown_terracotta","minecraft:cactus","minecraft:cherry_leaves","minecraft:cherry_log","minecraft:cherry_wood","minecraft:chorus_fruit","minecraft:clay","minecraft:clay_ball","minecraft:cobbled_deepslate","minecraft:cobblestone","minecraft:cyan_terracotta","minecraft:dark_oak_leaves","minecraft:dark_oak_log","minecraft:dark_oak_wood","minecraft:deepslate_bricks","minecraft:deepslate_tiles","minecraft:gray_terracotta","minecraft:green_terracotta","minecraft:jungle_leaves","minecraft:jungle_log","minecraft:jungle_wood","minecraft:light_blue_terracotta","minecraft:light_gray_terracotta","minecraft:lime_terracotta","minecraft:magenta_terracotta","minecraft:mangrove_leaves","minecraft:mangrove_log","minecraft:mangrove_wood","minecraft:nether_brick","minecraft:netherrack","minecraft:oak_leaves","minecraft:oak_log","minecraft:oak_wood","minecraft:orange_poplar_leaves","minecraft:orange_terracotta","minecraft:pale_oak_leaves","minecraft:pale_oak_log","minecraft:pale_oak_wood","minecraft:pink_terracotta","minecraft:polished_blackstone_bricks","minecraft:poplar_log","minecraft:poplar_wood","minecraft:purple_terracotta","minecraft:quartz_block","minecraft:red_poplar_leaves","minecraft:red_sand","minecraft:red_sandstone","minecraft:red_terracotta","minecraft:resin_clump","minecraft:sand","minecraft:sandstone","minecraft:sea_pickle","minecraft:spruce_leaves","minecraft:spruce_log","minecraft:spruce_wood","minecraft:stone","minecraft:stone_bricks","minecraft:stripped_acacia_log","minecraft:stripped_acacia_wood","minecraft:stripped_birch_log","minecraft:stripped_birch_wood","minecraft:stripped_cherry_log","minecraft:stripped_cherry_wood","minecraft:stripped_dark_oak_log","minecraft:stripped_dark_oak_wood","minecraft:stripped_jungle_log","minecraft:stripped_jungle_wood","minecraft:stripped_mangrove_log","minecraft:stripped_mangrove_wood","minecraft:stripped_oak_log","minecraft:stripped_oak_wood","minecraft:stripped_pale_oak_log","minecraft:stripped_pale_oak_wood","minecraft:stripped_poplar_log","minecraft:stripped_poplar_wood","minecraft:stripped_spruce_log","minecraft:stripped_spruce_wood","minecraft:wet_sponge","minecraft:white_terracotta","minecraft:yellow_poplar_leaves","minecraft:yellow_terracotta",
    ...blastFurnaceRecipes,
    ...smokerRecipes
  ]),
  "minecraft:blast_furnace": new Set(blastFurnaceRecipes),
  "minecraft:smoker": new Set(smokerRecipes)
}

export const furnaceRecipeList: { [key: string]: string } = {
  "minecraft:acacia_leaves": "minecraft:leaf_litter",
  "minecraft:acacia_log": "minecraft:charcoal",
  "minecraft:acacia_wood": "minecraft:charcoal",
  "minecraft:ancient_debris": "minecraft:netherite_scrap",
  "minecraft:azalea_leaves": "minecraft:leaf_litter",
  "minecraft:azalea_leaves_flowered": "minecraft:leaf_litter",
  "minecraft:basalt": "minecraft:smooth_basalt",
  "minecraft:beef": "minecraft:cooked_beef",
  "minecraft:birch_leaves": "minecraft:leaf_litter",
  "minecraft:birch_log": "minecraft:charcoal",
  "minecraft:birch_wood": "minecraft:charcoal",
  "minecraft:black_terracotta": "minecraft:black_glazed_terracotta",
  "minecraft:blue_terracotta": "minecraft:blue_glazed_terracotta",
  "minecraft:brown_terracotta": "minecraft:brown_glazed_terracotta",
  "minecraft:cactus": "minecraft:green_dye",
  "minecraft:chainmail_boots": "minecraft:iron_nugget",
  "minecraft:chainmail_chestplate": "minecraft:iron_nugget",
  "minecraft:chainmail_helmet": "minecraft:iron_nugget",
  "minecraft:chainmail_leggings": "minecraft:iron_nugget",
  "minecraft:cherry_leaves": "minecraft:leaf_litter",
  "minecraft:cherry_log": "minecraft:charcoal",
  "minecraft:cherry_wood": "minecraft:charcoal",
  "minecraft:chicken": "minecraft:cooked_chicken",
  "minecraft:chorus_fruit": "minecraft:chorus_fruit_popped",
  "minecraft:clay": "minecraft:hardened_clay",
  "minecraft:clay_ball": "minecraft:brick",
  "minecraft:coal_ore": "minecraft:coal",
  "minecraft:cobbled_deepslate": "minecraft:deepslate",
  "minecraft:cobblestone": "minecraft:stone",
  "minecraft:copper_axe": "minecraft:copper_nugget",
  "minecraft:copper_boots": "minecraft:copper_nugget",
  "minecraft:copper_chestplate": "minecraft:copper_nugget",
  "minecraft:copper_helmet": "minecraft:copper_nugget",
  "minecraft:copper_hoe": "minecraft:copper_nugget",
  "minecraft:copper_horse_armor": "minecraft:copper_nugget",
  "minecraft:copper_leggings": "minecraft:copper_nugget",
  "minecraft:copper_nautilus_armor": "minecraft:copper_nugget",
  "minecraft:copper_ore": "minecraft:copper_ingot",
  "minecraft:copper_pickaxe": "minecraft:copper_nugget",
  "minecraft:copper_shovel": "minecraft:copper_nugget",
  "minecraft:copper_spear": "minecraft:copper_nugget",
  "minecraft:copper_sword": "minecraft:copper_nugget",
  "minecraft:cyan_terracotta": "minecraft:cyan_glazed_terracotta",
  "minecraft:dark_oak_leaves": "minecraft:leaf_litter",
  "minecraft:dark_oak_log": "minecraft:charcoal",
  "minecraft:dark_oak_wood": "minecraft:charcoal",
  "minecraft:deepslate_bricks": "minecraft:cracked_deepslate_bricks",
  "minecraft:deepslate_coal_ore": "minecraft:coal",
  "minecraft:deepslate_copper_ore": "minecraft:copper_ingot",
  "minecraft:deepslate_diamond_ore": "minecraft:diamond",
  "minecraft:deepslate_emerald_ore": "minecraft:emerald",
  "minecraft:deepslate_gold_ore": "minecraft:gold_ingot",
  "minecraft:deepslate_iron_ore": "minecraft:iron_ingot",
  "minecraft:deepslate_lapis_ore": "minecraft:lapis_lazuli",
  "minecraft:deepslate_redstone_ore": "minecraft:redstone",
  "minecraft:deepslate_tiles": "minecraft:cracked_deepslate_tiles",
  "minecraft:diamond_ore": "minecraft:diamond",
  "minecraft:emerald_ore": "minecraft:emerald",
  "minecraft:fish": "minecraft:cooked_fish",
  "minecraft:gold_ore": "minecraft:gold_ingot",
  "minecraft:golden_axe": "minecraft:gold_nugget",
  "minecraft:golden_boots": "minecraft:gold_nugget",
  "minecraft:golden_chestplate": "minecraft:gold_nugget",
  "minecraft:golden_helmet": "minecraft:gold_nugget",
  "minecraft:golden_hoe": "minecraft:gold_nugget",
  "minecraft:golden_leggings": "minecraft:gold_nugget",
  "minecraft:golden_nautilus_armor": "minecraft:gold_nugget",
  "minecraft:golden_pickaxe": "minecraft:gold_nugget",
  "minecraft:golden_shovel": "minecraft:gold_nugget",
  "minecraft:golden_spear": "minecraft:gold_nugget",
  "minecraft:golden_sword": "minecraft:gold_nugget",
  "minecraft:gray_terracotta": "minecraft:gray_glazed_terracotta",
  "minecraft:green_terracotta": "minecraft:green_glazed_terracotta",
  "minecraft:horsearmorgold": "minecraft:gold_nugget",
  "minecraft:horsearmoriron": "minecraft:iron_nugget",
  "minecraft:iron_axe": "minecraft:iron_nugget",
  "minecraft:iron_boots": "minecraft:iron_nugget",
  "minecraft:iron_chestplate": "minecraft:iron_nugget",
  "minecraft:iron_helmet": "minecraft:iron_nugget",
  "minecraft:iron_hoe": "minecraft:iron_nugget",
  "minecraft:iron_leggings": "minecraft:iron_nugget",
  "minecraft:iron_nautilus_armor": "minecraft:iron_nugget",
  "minecraft:iron_ore": "minecraft:iron_ingot",
  "minecraft:iron_pickaxe": "minecraft:iron_nugget",
  "minecraft:iron_shovel": "minecraft:iron_nugget",
  "minecraft:iron_spear": "minecraft:iron_nugget",
  "minecraft:iron_sword": "minecraft:iron_nugget",
  "minecraft:jungle_leaves": "minecraft:leaf_litter",
  "minecraft:jungle_log": "minecraft:charcoal",
  "minecraft:jungle_wood": "minecraft:charcoal",
  "minecraft:kelp": "minecraft:dried_kelp",
  "minecraft:lapis_ore": "minecraft:lapis_lazuli",
  "minecraft:light_blue_terracotta": "minecraft:light_blue_glazed_terracotta",
  "minecraft:light_gray_terracotta": "minecraft:silver_glazed_terracotta",
  "minecraft:lime_terracotta": "minecraft:lime_glazed_terracotta",
  "minecraft:magenta_terracotta": "minecraft:magenta_glazed_terracotta",
  "minecraft:mangrove_leaves": "minecraft:leaf_litter",
  "minecraft:mangrove_log": "minecraft:charcoal",
  "minecraft:mangrove_wood": "minecraft:charcoal",
  "minecraft:mutton": "minecraft:mutton_cooked",
  "minecraft:nether_brick": "minecraft:cracked_nether_bricks",
  "minecraft:nether_gold_ore": "minecraft:gold_ingot",
  "minecraft:netherrack": "minecraft:netherbrick",
  "minecraft:oak_leaves": "minecraft:leaf_litter",
  "minecraft:oak_log": "minecraft:charcoal",
  "minecraft:oak_wood": "minecraft:charcoal",
  "minecraft:orange_poplar_leaves": "minecraft:leaf_litter",
  "minecraft:orange_terracotta": "minecraft:orange_glazed_terracotta",
  "minecraft:pale_oak_leaves": "minecraft:leaf_litter",
  "minecraft:pale_oak_log": "minecraft:charcoal",
  "minecraft:pale_oak_wood": "minecraft:charcoal",
  "minecraft:pink_terracotta": "minecraft:pink_glazed_terracotta",
  "minecraft:polished_blackstone_bricks": "minecraft:cracked_polished_blackstone_bricks",
  "minecraft:poplar_log": "minecraft:charcoal",
  "minecraft:poplar_wood": "minecraft:charcoal",
  "minecraft:porkchop": "minecraft:cooked_porkchop",
  "minecraft:potato": "minecraft:baked_potato",
  "minecraft:purple_terracotta": "minecraft:purple_glazed_terracotta",
  "minecraft:quartz_block": "minecraft:smooth_quartz",
  "minecraft:quartz_ore": "minecraft:quartz",
  "minecraft:rabbit": "minecraft:cooked_rabbit",
  "minecraft:raw_copper": "minecraft:copper_ingot",
  "minecraft:raw_gold": "minecraft:gold_ingot",
  "minecraft:raw_iron": "minecraft:iron_ingot",
  "minecraft:red_poplar_leaves": "minecraft:leaf_litter",
  "minecraft:red_sand": "minecraft:glass",
  "minecraft:red_sandstone": "minecraft:smooth_red_sandstone",
  "minecraft:red_terracotta": "minecraft:red_glazed_terracotta",
  "minecraft:redstone_ore": "minecraft:redstone",
  "minecraft:resin_clump": "minecraft:resin_brick",
  "minecraft:salmon": "minecraft:cooked_salmon",
  "minecraft:sand": "minecraft:glass",
  "minecraft:sandstone": "minecraft:smooth_sandstone",
  "minecraft:sea_pickle": "minecraft:lime_dye",
  "minecraft:spruce_leaves": "minecraft:leaf_litter",
  "minecraft:spruce_log": "minecraft:charcoal",
  "minecraft:spruce_wood": "minecraft:charcoal",
  "minecraft:stone": "minecraft:smooth_stone",
  "minecraft:stone_bricks": "minecraft:cracked_stone_bricks",
  "minecraft:stripped_acacia_log": "minecraft:charcoal",
  "minecraft:stripped_acacia_wood": "minecraft:charcoal",
  "minecraft:stripped_birch_log": "minecraft:charcoal",
  "minecraft:stripped_birch_wood": "minecraft:charcoal",
  "minecraft:stripped_cherry_log": "minecraft:charcoal",
  "minecraft:stripped_cherry_wood": "minecraft:charcoal",
  "minecraft:stripped_dark_oak_log": "minecraft:charcoal",
  "minecraft:stripped_dark_oak_wood": "minecraft:charcoal",
  "minecraft:stripped_jungle_log": "minecraft:charcoal",
  "minecraft:stripped_jungle_wood": "minecraft:charcoal",
  "minecraft:stripped_mangrove_log": "minecraft:charcoal",
  "minecraft:stripped_mangrove_wood": "minecraft:charcoal",
  "minecraft:stripped_oak_log": "minecraft:charcoal",
  "minecraft:stripped_oak_wood": "minecraft:charcoal",
  "minecraft:stripped_pale_oak_log": "minecraft:charcoal",
  "minecraft:stripped_pale_oak_wood": "minecraft:charcoal",
  "minecraft:stripped_poplar_log": "minecraft:charcoal",
  "minecraft:stripped_poplar_wood": "minecraft:charcoal",
  "minecraft:stripped_spruce_log": "minecraft:charcoal",
  "minecraft:stripped_spruce_wood": "minecraft:charcoal",
  "minecraft:wet_sponge": "minecraft:sponge",
  "minecraft:white_terracotta": "minecraft:white_glazed_terracotta",
  "minecraft:yellow_poplar_leaves": "minecraft:leaf_litter",
  "minecraft:yellow_terracotta": "minecraft:yellow_glazed_terracotta",

  "digital_miner:gold_dust": "minecraft:gold_ingot",
  "digital_miner:iron_dust": "minecraft:iron_ingot",
  "digital_miner:steel_dust": "digital_miner:steel_nugget"
}

export const furnaceRecipeDenyList: { [key: string]: boolean } = {
  "2/digital_miner:gold_dust": true,
  "2/digital_miner:iron_dust": true,
  "2/digital_miner:steel_dust": true
}