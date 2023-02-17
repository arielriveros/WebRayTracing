import { vec4 } from "gl-matrix";

export function hexToVec4(hex: string, alpha: number = 1): vec4 {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    return vec4.fromValues(r, g, b, alpha);
}