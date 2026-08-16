import { world, system, ItemStack, Block, Player } from "@minecraft/server"
import { ConfigInfo, FunctionType } from "../player/config"
import { veinShapeGetStairs } from "./minerShape/getStairs"
import { veinShapeGetTunnel } from "./minerShape/getTunnel"
import { veinShapeGetAll } from "./minerShape/getAll"

export function getBlocks(info: GetBLocksInfo, customType?: FunctionType): void {
  const { config } = info

  const execute = minerFunctionManager[customType ?? config.functionType]
  if(execute) return execute(info)
}

const minerFunctionManager = new class MinerFunctionManager {
  [key: string]: (info: GetBLocksInfo) => void

  "all"(info: GetBLocksInfo): void {
    system.run(() => { veinShapeGetAll.getBlocks(info) })
  }



  "1x1_tunnel"(info: GetBLocksInfo): void {
    system.run(() => { veinShapeGetTunnel.getBlocks(info, 1, 1) })
  }

  "1x2_tunnel"(info: GetBLocksInfo): void {
    system.run(() => { veinShapeGetTunnel.getBlocks(info, 1, 2) })
  }

  "1x3_tunnel"(info: GetBLocksInfo): void {
    system.run(() => { veinShapeGetTunnel.getBlocks(info, 1, 3) })
  }

  "3x2_tunnel"(info: GetBLocksInfo): void {
    system.run(() => { veinShapeGetTunnel.getBlocks(info, 3, 2) })
  }

  "3x2_tunnel_small"(info: GetBLocksInfo): void {
    system.run(() => { veinShapeGetTunnel.getBlocks(info, 3, 2, 1) })
  }

  "3x3_tunnel"(info: GetBLocksInfo): void {
    system.run(() => { veinShapeGetTunnel.getBlocks(info, 3, 3) })
  }

  "3x3_tunnel_small"(info: GetBLocksInfo): void {
    system.run(() => { veinShapeGetTunnel.getBlocks(info, 3, 3, 1) })
  }



  "escape_tunnel"(info: GetBLocksInfo): void {
    system.run(() => { veinShapeGetStairs.getBlocks(info) })
  }

  "mining_tunnel"(info: GetBLocksInfo): void {
    system.run(() => { veinShapeGetStairs.getBlocks(info, false) })
  }
}

// Offsets

export function getOffsetType(info: GetBLocksInfo): [number, number, number][] {
  if(info.config.connectedDiagonals) return preOffsets26
  return preOffsets6
}

const preOffsets6: [number, number, number][] = [
  [ 1,  0,  0], [-1,  0,  0],
  [ 0,  1,  0], [ 0, -1,  0],
  [ 0,  0,  1], [ 0,  0, -1]
]

const preOffsets26: [number, number, number][] = [
  [ 1,  0,  0], [-1,  0,  0],
  [ 0,  1,  0], [ 0, -1,  0],
  [ 0,  0,  1], [ 0,  0, -1],

  [ 1,  1,  0], [ 1, -1,  0], [-1,  1,  0], [-1, -1, 0],
  [ 1,  0,  1], [ 1,  0, -1], [-1,  0,  1], [-1,  0, -1],
  [ 0,  1,  1], [ 0,  1, -1], [ 0, -1,  1], [ 0, -1, -1],

  [ 1,  1,  1], [ 1,  1, -1], [ 1, -1,  1], [ 1, -1, -1],
  [-1,  1,  1], [-1,  1, -1], [-1, -1,  1], [-1, -1, -1]
]

// Interfaces
export interface GetBLocksInfo {
  type: "preview" | "break"
  player: Player
  config: ConfigInfo
  block: Block
  blockIds: string[]
  blockFace: string
  origin: Block
  item?: ItemStack
}