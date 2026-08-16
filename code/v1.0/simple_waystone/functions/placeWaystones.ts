import { world, BlockPermutation } from "@minecraft/server"
import { ActionFormData } from "@minecraft/server-ui"
import { apiVec3 } from "../lib/vector"

world.afterEvents.itemUse.subscribe(({source: player, itemStack: item}) => {
  if(!player.hasTag("waystone_placer") || item.typeId != "minecraft:netherite_sword") return

  new ActionFormData()
  .title("Place Waystone Group")
  .button("Stone")
  .button("Tuff")
  .button("Deepslate")
  .button("Obsidian")
  .button("Blackstone")
  .button("Basalt")
  .button("Nether")
  .button("Nether Bricks")
  .button("Wart")
  .button("Ice")
  .button("Primarine")
  .button("Sand")
  .button("Resin")
  .button("Ore")
  .button("Quartz")
  .button("End")
  .button("Raw Ore")
  .button("Copper")
  .button("Tables")
  .button("Oak")
  .button("Sculk")
  .button("Concrete Powder")
  .button("Concrete")
  .button("Terracotta")
  .button("Wool")
  .button("Glass")
  .show(player).then(({canceled, selection}) => {
    if(canceled || selection == undefined) return
    const group = listIndex[selection]
    if(!group) return

    const rot = player.getRotation().y
    const direction = apiVec3.offsetDirection[rot > -45 && rot < 45 ? "South" : rot < -135 || rot > 135 ? "North" : rot > -135 && rot < -45 ? "East" : "West"]
    for(let i = group[0]; i < group[1] +1; i++){
      const id = waystonesListId[i]
      const pos = apiVec3.offset(player.location, apiVec3.multiply(direction, i - group[0] +1))
      const block = player.dimension.getBlock(pos)
      const above = block?.above(1)
      if(!id || !block || !above || !block.isAir || !above.isAir) continue

      block.setPermutation(BlockPermutation.resolve(id, {"ws:waystone": 1}))
      above.setPermutation(BlockPermutation.resolve(id, {"ws:waystone": 2}))
    }
  })
})

const listIndex: { [key: number]: [number, number] } = {
  0: [0, 15], // Stone
  1: [16, 20], // Tuff
  2: [21, 26], // Deepslate
  3: [27, 28], // Obsidian
  4: [29, 32], // Blackstone
  5: [33, 35], // Basalt
  6: [36, 40], // Nether
  7: [41, 43], // Nether Bricks
  8: [44, 45], // Wart
  9: [46, 49], // Ice
  10: [50, 53], // Prismarine
  11: [54, 59], // Sand
  12: [60, 62], // Resin
  13: [63, 71], // Ore
  14: [72, 77], // Quartz
  15: [78, 81], // End
  16: [82, 84], // Raw Ore
  17: [85, 96], // Ore Block
  18: [97, 121], // Tables
  19: [122, 170], // Oak
  20: [171, 173], // Sculk
  21: [174, 189], // Concrete Powder
  22: [190, 205], // Concrete
  23: [206, 222], // Terracotta
  24: [223, 238], // Wool
  25: [239, 255] // Glass
}

const waystonesListId: string[] = [
  "ws:waystone_polished_andesite",
  "ws:waystone_andesite",
  "ws:waystone_polished_diorite",
  "ws:waystone_diorite",
  "ws:waystone_polished_granite",
  "ws:waystone_granite",
  "ws:waystone_dripstone_block",
  "ws:waystone_packed_mud",
  "ws:waystone_mud_bricks",
  "ws:waystone_stone",
  "ws:waystone_stone_bricks",
  "ws:waystone_mossy_stone_bricks",
  "ws:waystone_chiseled_stone_bricks",
  "ws:waystone_cobblestone",
  "ws:waystone_mossy_cobblestone",
  "ws:waystone_smooth_stone",

  "ws:waystone_tuff",
  "ws:waystone_polished_tuff",
  "ws:waystone_tuff_bricks",
  "ws:waystone_chiseled_tuff",
  "ws:waystone_chiseled_tuff_bricks",

  "ws:waystone_deepslate",
  "ws:waystone_cobbled_deepslate",
  "ws:waystone_deepslate_tiles",
  "ws:waystone_deepslate_bricks",
  "ws:waystone_polished_deepslate",
  "ws:waystone_chiseled_deepslate",

  "ws:waystone_obsidian",
  "ws:waystone_crying_obsidian",

  "ws:waystone_blackstone",
  "ws:waystone_polished_blackstone",
  "ws:waystone_polished_blackstone_bricks",
  "ws:waystone_chiseled_polished_blackstone",

  "ws:waystone_basalt",
  "ws:waystone_polished_basalt",
  "ws:waystone_smooth_basalt",

  "ws:waystone_soul_sand",
  "ws:waystone_soul_soil",
  "ws:waystone_magma",
  "ws:waystone_glowstone",
  "ws:waystone_bone_block_top",

  "ws:waystone_nether_bricks",
  "ws:waystone_chiseled_nether_bricks",
  "ws:waystone_red_nether_bricks",

  "ws:waystone_nether_wart_block",
  "ws:waystone_warped_wart_block",

  "ws:waystone_ice",
  "ws:waystone_packed_ice",
  "ws:waystone_blue_ice",
  "ws:waystone_snow",

  "ws:waystone_prismarine",
  "ws:waystone_prismarine_bricks",
  "ws:waystone_dark_prismarine",
  "ws:waystone_sea_lantern",

  "ws:waystone_sand",
  "ws:waystone_cut_sandstone",
  "ws:waystone_chiseled_sandstone",
  "ws:waystone_red_sand",
  "ws:waystone_cut_red_sandstone",
  "ws:waystone_chiseled_red_sandstone",

  "ws:waystone_resin_block",
  "ws:waystone_resin_bricks",
  "ws:waystone_chiseled_resin_bricks",

  "ws:waystone_amethyst_block",
  "ws:waystone_coal_block",
  "ws:waystone_iron_block",
  "ws:waystone_lapis_block",
  "ws:waystone_gold_block",
  "ws:waystone_redstone_block",
  "ws:waystone_emerald_block",
  "ws:waystone_diamond_block",
  "ws:waystone_netherite_block",

  "ws:waystone_quartz_block_side",
  "ws:waystone_quartz_bricks",
  "ws:waystone_quartz_pillar_side",
  "ws:waystone_quartz_pillar",
  "ws:waystone_chiseled_quartz_block_side",
  "ws:waystone_chiseled_quartz_block_top",

  "ws:waystone_end_stone",
  "ws:waystone_end_stone_bricks",
  "ws:waystone_purpur_block",
  "ws:waystone_purpur_pillar_side",

  "ws:waystone_raw_copper_block",
  "ws:waystone_raw_iron_block",
  "ws:waystone_raw_gold_block",

  "ws:waystone_copper_block",
  "ws:waystone_cut_copper",
  "ws:waystone_chiseled_copper",
  "ws:waystone_exposed_copper",
  "ws:waystone_exposed_cut_copper",
  "ws:waystone_exposed_chiseled_copper",
  "ws:waystone_weathered_copper",
  "ws:waystone_weathered_cut_copper",
  "ws:waystone_weathered_chiseled_copper",
  "ws:waystone_oxidized_copper",
  "ws:waystone_oxidized_cut_copper",
  "ws:waystone_oxidized_chiseled_copper",

  "ws:waystone_barrel_side",
  "ws:waystone_barrel_bottom",
  "ws:waystone_beacon",
  "ws:waystone_bee_nest_side",
  "ws:waystone_beehive_side",
  "ws:waystone_furnace",
  "ws:waystone_smoker",
  "ws:waystone_blast_furnace_front_off",
  "ws:waystone_blast_furnace_top",
  "ws:waystone_bookshelf",
  "ws:waystone_chiseled_bookshelf",
  "ws:waystone_anvil",
  "ws:waystone_cauldron_inner",
  "ws:waystone_chest",
  "ws:waystone_ender_chest",
  "ws:waystone_crafter_north",
  "ws:waystone_crafter_top",
  "ws:waystone_crafting_table",
  "ws:waystone_item_frame",
  "ws:waystone_glow_item_frame",
  "ws:waystone_redstone_lamp_on",
  "ws:waystone_note_block",
  "ws:waystone_lodestone",
  "ws:waystone_respawn_anchor",
  "ws:waystone_target_block",

  "ws:waystone_oak_wood",
  "ws:waystone_oak_log",
  "ws:waystone_stripped_oak_wood",
  "ws:waystone_stripped_oak_log",
  "ws:waystone_spruce_wood",
  "ws:waystone_spruce_log",
  "ws:waystone_stripped_spruce_wood",
  "ws:waystone_stripped_spruce_log",
  "ws:waystone_birch_wood",
  "ws:waystone_birch_log",
  "ws:waystone_stripped_birch_wood",
  "ws:waystone_stripped_birch_log",
  "ws:waystone_jungle_wood",
  "ws:waystone_jungle_log",
  "ws:waystone_stripped_jungle_wood",
  "ws:waystone_stripped_jungle_log",
  "ws:waystone_acacia_wood",
  "ws:waystone_acacia_log",
  "ws:waystone_stripped_acacia_wood",
  "ws:waystone_stripped_acacia_log",
  "ws:waystone_dark_oak_wood",
  "ws:waystone_dark_oak_log",
  "ws:waystone_stripped_dark_oak_wood",
  "ws:waystone_stripped_dark_oak_log",
  "ws:waystone_mangrove_wood",
  "ws:waystone_mangrove_log",
  "ws:waystone_stripped_mangrove_wood",
  "ws:waystone_stripped_mangrove_log",
  "ws:waystone_pale_oak_wood",
  "ws:waystone_pale_oak_log",
  "ws:waystone_stripped_pale_oak_wood",
  "ws:waystone_stripped_pale_oak_log",
  "ws:waystone_cherry_wood",
  "ws:waystone_cherry_log",
  "ws:waystone_stripped_cherry_wood",
  "ws:waystone_stripped_cherry_log",
  "ws:waystone_bamboo_block",
  "ws:waystone_stripped_bamboo_block",
  "ws:waystone_bamboo_mosaic",
  "ws:waystone_bamboo_planks",
  "ws:waystone_crimson_hyphae",
  "ws:waystone_crimson_stem",
  "ws:waystone_stripped_crimson_hyphae",
  "ws:waystone_stripped_crimson_stem",
  "ws:waystone_warped_hyphae",
  "ws:waystone_warped_stem",
  "ws:waystone_stripped_warped_hyphae",
  "ws:waystone_stripped_warped_stem",
  "ws:waystone_creaking_heart_top",

  "ws:waystone_sculk_catalyst_side",
  "ws:waystone_sculk_catalyst_top",
  "ws:waystone_sculk_shrieker",

  "ws:waystone_white_concrete_powder",
  "ws:waystone_light_gray_concrete_powder",
  "ws:waystone_gray_concrete_powder",
  "ws:waystone_black_concrete_powder",
  "ws:waystone_brown_concrete_powder",
  "ws:waystone_red_concrete_powder",
  "ws:waystone_orange_concrete_powder",
  "ws:waystone_yellow_concrete_powder",
  "ws:waystone_lime_concrete_powder",
  "ws:waystone_green_concrete_powder",
  "ws:waystone_cyan_concrete_powder",
  "ws:waystone_light_blue_concrete_powder",
  "ws:waystone_blue_concrete_powder",
  "ws:waystone_purple_concrete_powder",
  "ws:waystone_magenta_concrete_powder",
  "ws:waystone_pink_concrete_powder",

  "ws:waystone_white_concrete",
  "ws:waystone_light_gray_concrete",
  "ws:waystone_gray_concrete",
  "ws:waystone_black_concrete",
  "ws:waystone_brown_concrete",
  "ws:waystone_red_concrete",
  "ws:waystone_orange_concrete",
  "ws:waystone_yellow_concrete",
  "ws:waystone_lime_concrete",
  "ws:waystone_green_concrete",
  "ws:waystone_cyan_concrete",
  "ws:waystone_light_blue_concrete",
  "ws:waystone_blue_concrete",
  "ws:waystone_purple_concrete",
  "ws:waystone_magenta_concrete",
  "ws:waystone_pink_concrete",

  "ws:waystone_terracotta",
  "ws:waystone_white_terracotta",
  "ws:waystone_light_gray_terracotta",
  "ws:waystone_gray_terracotta",
  "ws:waystone_black_terracotta",
  "ws:waystone_brown_terracotta",
  "ws:waystone_red_terracotta",
  "ws:waystone_orange_terracotta",
  "ws:waystone_yellow_terracotta",
  "ws:waystone_lime_terracotta",
  "ws:waystone_green_terracotta",
  "ws:waystone_cyan_terracotta",
  "ws:waystone_light_blue_terracotta",
  "ws:waystone_blue_terracotta",
  "ws:waystone_purple_terracotta",
  "ws:waystone_magenta_terracotta",
  "ws:waystone_pink_terracotta",

  "ws:waystone_white_wool",
  "ws:waystone_light_gray_wool",
  "ws:waystone_gray_wool",
  "ws:waystone_black_wool",
  "ws:waystone_brown_wool",
  "ws:waystone_red_wool",
  "ws:waystone_orange_wool",
  "ws:waystone_yellow_wool",
  "ws:waystone_lime_wool",
  "ws:waystone_green_wool",
  "ws:waystone_cyan_wool",
  "ws:waystone_light_blue_wool",
  "ws:waystone_blue_wool",
  "ws:waystone_purple_wool",
  "ws:waystone_magenta_wool",
  "ws:waystone_pink_wool",

  "ws:waystone_glass",
  "ws:waystone_white_glass",
  "ws:waystone_light_gray_glass",
  "ws:waystone_gray_glass",
  "ws:waystone_black_glass",
  "ws:waystone_brown_glass",
  "ws:waystone_red_glass",
  "ws:waystone_orange_glass",
  "ws:waystone_yellow_glass",
  "ws:waystone_lime_glass",
  "ws:waystone_green_glass",
  "ws:waystone_cyan_glass",
  "ws:waystone_light_blue_glass",
  "ws:waystone_blue_glass",
  "ws:waystone_purple_glass",
  "ws:waystone_magenta_glass",
  "ws:waystone_pink_glass"
]