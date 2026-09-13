import { world, RGB, Vector3, system } from "@minecraft/server"

export const globalWaypointsCache = new Map<string, Map<string, WaypointsInfo>>() // Player Id + Waypoint Dimension > Waypoint Name > Waypoint Info

const render = 25 // Blocks
const turnOff = 10 // Blocks
export const Variables = {
  updateRate: 20,
  maxName: 13,
  maxDistance: 9999999,
  minRenderDistance: render * render,
  turnOffDistance: turnOff * turnOff,

  teleportEnabled: true,
  costXp: true,
  xpByDistance: 0.002 // 500 blocks
}

system.run(() => {
    Variables.teleportEnabled = (r => typeof r == "boolean" ? r : Variables.teleportEnabled)(world.getDynamicProperty("c:tp"))
    Variables.costXp = (r => typeof r == "boolean" ? r : Variables.costXp)(world.getDynamicProperty("c:tpcost"))
    Variables.xpByDistance = (r => typeof r == "number" ? r : Variables.xpByDistance)(world.getDynamicProperty("c:tpdis"))
})



export const colorRBG: RGB[] = [
  {red: 200, green: 200, blue: 200}, //white
  {red: 128, green: 128, blue: 128}, //light gray
  {red: 90, green: 90, blue: 90}, //gray
  {red: 0, green: 0, blue: 0}, //black
  {red: 70, green: 25, blue: 0}, //brown
  {red: 255, green: 0, blue: 0}, //red
  {red: 255, green: 165, blue: 0}, //orange
  {red: 255, green: 255, blue: 0}, //yellow
  {red: 0, green: 255, blue: 0}, //lime
  {red: 0, green: 128, blue: 0}, //green
  {red: 25, green: 90, blue: 180}, //cyan
  {red: 0, green: 255, blue: 255}, //light blue
  {red: 0, green: 0, blue: 240}, //blue
  {red: 160, green: 0, blue: 200}, //purple
  {red: 90, green: 0, blue: 140}, //magenta
  {red: 240, green: 50, blue: 150} //pink
] as const

export const iconPathId: string[] = [
  "a_icon",
  "b_icon",
  "c_icon",
  "d_icon",
  "e_icon",
  "f_icon",
  "g_icon",
  "h_icon",
  "i_icon",
  "j_icon",
  "k_icon",
  "l_icon",
  "m_icon",
  "n_icon",
  "o_icon",
  "p_icon",
  "q_icon",
  "r_icon",
  "s_icon",
  "t_icon",
  "u_icon",
  "v_icon",
  "w_icon",
  "x_icon",
  "y_icon",
  "z_icon",
  "waypoint_icon",
  "death_icon",
  "house_icon",
  "sword_icon",
  "pickaxe_icon",
  "axe_icon"
]

// Interfaces

export interface WaypointsInfo {
  name: string
  pos: Vector3
  dimension: string
  icon: number
  color: number
  rgb: RGB
  visible: boolean
  turnOffClose: boolean
}