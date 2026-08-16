import { world } from "@minecraft/server"

export const customTags: CustomTags = {
  "bedrock_awakening:all_log": {
    types: [],
    tags: [],
    directory: ["bedrock_awakening:log", "bedrock_awakening:stripped_log"]
  },
  "bedrock_awakening:all_ore": {
    types: [],
    tags: [],
    directory: ["bedrock_awakening:amethyst", "bedrock_awakening:ore", "bedrock_awakening:deepslate_ore", "bedrock_awakening:nether_ore"]
  },

  "bedrock_awakening:amethyst": {
    types: [
      "minecraft:amethyst_block",
      "minecraft:amethyst_cluster"
    ],
    tags: []
  },

  "bedrock_awakening:deepslate": {
    types: [
      "minecraft:deepslate",
      "minecraft:cobbled_deepslate"
    ],
    tags: ["bedrock_awakening:deepslate"]
  },

  "bedrock_awakening:deepslate_ore": {
    types: [
      "minecraft:deepslate_coal_ore",
      "minecraft:deepslate_copper_ore",
      "minecraft:deepslate_diamond_ore",
      "minecraft:deepslate_emerald_ore",
      "minecraft:deepslate_gold_ore",
      "minecraft:deepslate_iron_ore",
      "minecraft:deepslate_lapis_ore",
      "minecraft:deepslate_redstone_ore",
      "minecraft:lit_deepslate_redstone_ore",
      "minecraft:raw_copper_block",
      "minecraft:raw_gold_block",
      "minecraft:raw_iron_block"
    ],
    tags: ["bedrock_awakening:deepslate_ore"]
  },

  "bedrock_awakening:dirt": {
    types: [
      // "minecraft:coase_dirt",
      "minecraft:dirt",
      "minecraft:dirt_with_roots",
      "minecraft:grass_block",
      "minecraft:grass_path"
    ],
    tags: [ "grass" ]
  },

  "bedrock_awakening:geode": {
    types: [
      "minecraft:amethyst_block",
      "minecraft:amethyst_cluster",
      "minecraft:calcite",
      "minecraft:large_amethyst_bud",
      "minecraft:medium_amethyst_bud",
      "minecraft:small_amethyst_bud",
      "minecraft:smooth_basalt"
    ],
    tags: []
  },

  "bedrock_awakening:gravity_blocks": {
    types: [
      "minecraft:gravel",
      "minecraft:sand",
      "minecraft:red_sand"
    ],
    tags: ["bedrock_awakening:gravity_blocks"]
  },

  "bedrock_awakening:leaves": {
    types: [
      "minecraft:acacia_leaves",
      "minecraft:azalea_leaves",
      "minecraft:azalea_leaves_flowered",
      "minecraft:birch_leaves",
      "minecraft:cherry_leaves",
      "minecraft:dark_oak_leaves",
      "minecraft:jungle_leaves",
      "minecraft:mangrove_leaves",
      "minecraft:oak_leaves",
      "minecraft:pale_oak_leaves",
      "minecraft:spruce_leaves"
    ],
    tags: []
  },

  "bedrock_awakening:log": {
    types: [
      "minecraft:acacia_log",
      "minecraft:acacia_wood",
      "minecraft:birch_log",
      "minecraft:birch_wood",
      "minecraft:cherry_log",
      "minecraft:cherry_wood",
      "minecraft:crimson_stem",
      "minecraft:crimson_hyphae",
      "minecraft:dark_oak_log",
      "minecraft:dark_oak_wood",
      "minecraft:jungle_log",
      "minecraft:jungle_wood",
      "minecraft:mangrove_log",
      "minecraft:mangrove_wood",
      "minecraft:oak_log",
      "minecraft:oak_wood",
      "minecraft:pale_oak_log",
      "minecraft:pale_oak_wood",
      "minecraft:spruce_log",
      "minecraft:spruce_wood",
      "minecraft:warped_stem",
      "minecraft:warped_hyphae"
    ],
    tags: ["log"]
  },

  "bedrock_awakening:ore": {
    types: [
      "minecraft:coal_ore",
      "minecraft:copper_ore",
      "minecraft:diamond_ore",
      "minecraft:emerald_ore",
      "minecraft:gold_ore",
      "minecraft:iron_ore",
      "minecraft:lapis_ore",
      "minecraft:lit_redstone_ore",
      "minecraft:raw_copper_block",
      "minecraft:raw_gold_block",
      "minecraft:raw_iron_block",
      "minecraft:redstone_ore"
    ],
    tags: ["bedrock_awakening:ore"]
  },

  "bedrock_awakening:ore_block": {
    types: [
      "minecraft:coal_block",
      "minecraft:copper_block",
      "minecraft:diamond_block",
      "minecraft:emerald_block",
      "minecraft:gold_block",
      "minecraft:iron_block",
      "minecraft:lapis_block",
      "minecraft:redstone_block"
    ],
    tags: ["bedrock_awakening:ore_block"]
  },

  "bedrock_awakening:nether_ore": {
    types: [
      "minecraft:ancient_debris",
      "minecraft:nether_gold_ore",
      "minecraft:quartz_ore"
    ],
    tags: ["bedrock_awakening:nether_ore"]
  },

  "bedrock_awakening:stone": {
    types: [
      "minecraft:andesite",
      "minecraft:crying_obsidian",
      "minecraft:diorite",
      "minecraft:deepslate",
      "minecraft:granite",
      "minecraft:obsidian",
      "minecraft:stone",
      "minecraft:tuff"
    ],
    tags: ["bedrock_awakening:stone"],
    directory: []
  },

  "bedrock_awakening:stripped_log": {
    types: [
      "minecraft:stripped_acacia_log",
      "minecraft:stripped_acacia_wood",
      "minecraft:stripped_birch_log",
      "minecraft:stripped_birch_wood",
      "minecraft:stripped_cherry_log",
      "minecraft:stripped_cherry_wood",
      "minecraft:stripped_crimson_stem",
      "minecraft:stripped_crimson_hyphae",
      "minecraft:stripped_dark_oak_log",
      "minecraft:stripped_dark_oak_wood",
      "minecraft:stripped_jungle_log",
      "minecraft:stripped_jungle_wood",
      "minecraft:stripped_mangrove_log",
      "minecraft:stripped_mangrove_wood",
      "minecraft:stripped_oak_log",
      "minecraft:stripped_oak_wood",
      "minecraft:stripped_pale_oak_log",
      "minecraft:stripped_pale_oak_wood",
      "minecraft:stripped_spruce_log",
      "minecraft:stripped_spruce_wood",
      "minecraft:stripped_warped_stem",
      "minecraft:stripped_warped_hyphae"
    ],
    tags: ["log"]
  }
}

interface CustomTags {
  [key: string]: {
    types: string[]
    tags: string[]
    directory?: string[]
  }
}