import { world, Vector3 } from "@minecraft/server"

export const apiVec3 = new class apiVec3 {
  public offsetDirection = {
    "East": {x: 1, y: 0, z: 0},
    "West": {x: -1, y: 0, z: 0},
    "Down": {x: 0, y: -1, z: 0},
    "Up": {x: 0, y: 1, z: 0},
    "North": {x: 0, y: 0, z: -1},
    "South": {x: 0, y: 0, z: 1}
  }

  isValid(obj: any): obj is Vector3 {
    return obj &&
    typeof obj == "object" &&
    typeof obj.x == "number" &&
    typeof obj.y == "number" &&
    typeof obj.z == "number"
  }

  create(x = 0, y = 0, z = 0): Vector3 { return { x: x, y: y, z: z} }

  offset(vector: Vector3, offset: Vector3): Vector3 {
    return {
      x: vector["x"] + offset["x"],
      y: vector["y"] + offset["y"],
      z: vector["z"] + offset["z"]
    }
  }

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

  floor(vector: Vector3): Vector3 {
    return {
      x: Math.floor(vector["x"]),
      y: Math.floor(vector["y"]),
      z: Math.floor(vector["z"])
    }
  }

  center(vector: Vector3): Vector3 {
    const vec = this.floor(vector)
    return {
      x: vec.x + 0.5,
      y: vec.y + 0.5,
      z: vec.z + 0.5
    }
  }

  bottomCenter(vector: Vector3): Vector3 {
    const vec = this.floor(vector)
    return {
      x: vec.x + 0.5,
      y: vec.y,
      z: vec.z + 0.5
    }
  }

  reduce(vector: Vector3, value: number, on: "x" | "y" | "z"): Vector3 {
    const newVec = { x: vector["x"], y: vector["y"], z: vector["z"] }
    newVec[on] += value
    return newVec
  }

  compare(vector1: Vector3, vector2: Vector3, floor = false): boolean {
    const vec1 = floor ? this.floor(vector1) : vector1, vec2 = floor ? this.floor(vector2) : vector2
    if(vec1.x != vec2.x) return false
    if(vec1.y != vec2.y) return false
    if(vec1.z != vec2.z) return false
    return true
  }

  distance3(vector1: Vector3, vector2: Vector3): number { return Math.sqrt((vector1.x - vector2.x) ** 2 + (vector1.y - vector2.y) ** 2 + (vector1.z - vector2.z) ** 2) }

  distanceXYZ(vector1: Vector3, vector2: Vector3): Vector3 { return {x: (vector2.x - vector1.x),  y: (vector2.y - vector1.y), z: (vector2.z - vector1.z)} }

  convertToString(vector: Vector3, type?: "normal" | "floor"): string {
    const vec = this.floor(vector)
    switch(type){
      default: {
        return `${vector.x}, ${vector.y}, ${vector.z}`
      }
      case "floor": {
        return `${vec.x}, ${vec.y}, ${vec.z}`
      }
    }
  }

  formatWithLetter(vector: Vector3): string {
    return `x: ${Math.floor(vector.x)}, y: ${Math.floor(vector.y)}, z: ${Math.floor(vector.z)}`
  }

  formatColored(vector: Vector3): string {
    return `§cx: ${Math.floor(vector.x)}, §2y: ${Math.floor(vector.y)}, §sz: ${Math.floor(vector.z)}`
  }
}