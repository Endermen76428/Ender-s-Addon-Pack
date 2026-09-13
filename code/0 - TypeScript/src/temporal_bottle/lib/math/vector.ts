import { world, Vector3 } from "@minecraft/server"

export const apiVec3 = new class apiVec3 {
  public directions4: ["North", "East", "South", "West"] = ["North", "East", "South", "West"]
  public offsetDirection = {
    "East": {x: 1, y: 0, z: 0},
    "West": {x: -1, y: 0, z: 0},
    "Down": {x: 0, y: -1, z: 0},
    "Up": {x: 0, y: 1, z: 0},
    "North": {x: 0, y: 0, z: -1},
    "South": {x: 0, y: 0, z: 1}
  }

  create(x = 0, y = 0, z = 0): Vector3 { return { x: x, y: y, z: z} }

  divide(vector: Vector3, divider: number): Vector3 {
    return {
      x: vector["x"] / divider,
      y: vector["y"] / divider,
      z: vector["z"] / divider
    }
  }

  multiply(vector: Vector3, amount: number): Vector3 {
    return {
      x: vector["x"] * amount,
      y: vector["y"] * amount,
      z: vector["z"] * amount
    }
  }

  offset(vector: Vector3, offset: Vector3): Vector3 {
    return {
      x: vector["x"] + offset["x"],
      y: vector["y"] + offset["y"],
      z: vector["z"] + offset["z"]
    }
  }

  floor(vector: Vector3): Vector3 {
    return {
      x: Math.floor(vector["x"]),
      y: Math.floor(vector["y"]),
      z: Math.floor(vector["z"])
    }
  }

  reduce(vector: Vector3, value: number, on: "x" | "y" | "z"): Vector3 {
    const newVec = { x: vector["x"], y: vector["y"], z: vector["z"] }
    newVec[on] += value
    return newVec
  }

  compare(vector1: Vector3, vector2: Vector3, floor = true): boolean {
    const vec1 = floor ? this.floor(vector1) : vector1, vec2 = floor ? this.floor(vector2) : vector2

    if(vec1.x != vec2.x || vec1.y != vec2.y || vec1.z != vec2.z) return false
    return true
  }

  distance(vec1: Vector3, vec2: Vector3, negative = false): number {
    if(negative) return (vec1.x - vec2.x) + (vec1.y - vec2.y) + (vec1.z - vec2.z)
    return Math.sqrt((vec1.x - vec2.x) ** 2 + (vec1.y - vec2.y) ** 2 + (vec1.z - vec2.z) ** 2)
  }

  distanceObj(vec1: Vector3, vec2: Vector3): Vector3 { return {x: (vec2.x - vec1.x), y: (vec2.y - vec1.y), z: (vec2.z - vec1.z)} }

  isValid(obj: any): obj is { x: number, y: number, z: number } {
    if(obj == undefined) return false
    const keys = Object.keys(obj)
    return (keys.length === 3 && order.every(k => keys.includes(k))) && (order.every(k => typeof obj[k] === 'number'))
  }

  organize(vector: Vector3): Vector3 {
    const { x, y, z } = vector
    return { x: x, y: y, z: z }
  }

  decompose(vector: Vector3): number[] { return Object.values(vector) }

  centerBlock(vector: Vector3): Vector3 { return this.offset(this.floor(vector), this.create(0.5, 0.5, 0.5)) }

  toString(vector: Vector3): string { return `${vector.x},${vector.y},${vector.z}` }

  tobyte(x: number, y: number, z: number): number { return (x << 20) ^ (y << 10) ^ z }
}

const order = ['x', 'y', 'z'] as const