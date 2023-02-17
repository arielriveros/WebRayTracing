import { vec4 } from "gl-matrix";

export function hexToVec4(hex: string, alpha: number = 1): vec4 {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    return vec4.fromValues(r, g, b, alpha);
}

export namespace COLORS
{
    export const RED: vec4 = [1, 0, 0, 1] as vec4;
    export const GREEN: vec4 = [0, 1, 0, 1] as vec4;
    export const BLUE: vec4 = [0, 0, 1, 1] as vec4;
    export const WHITE: vec4 = [1, 1, 1, 1] as vec4;
    export const BLACK: vec4 = [0, 0, 0, 1] as vec4;
    export const YELLOW: vec4 = [1, 1, 0, 1] as vec4;
    export const CYAN: vec4 = [0, 1, 1, 1] as vec4;
    export const MAGENTA: vec4 = [1, 0, 1, 1] as vec4;
    export const GRAY: vec4 = [0.5, 0.5, 0.5, 1] as vec4;
    export const LIGHT_GRAY: vec4 = [0.75, 0.75, 0.75, 1] as vec4;
    export const DARK_GRAY: vec4 = [0.25, 0.25, 0.25, 1] as vec4;
    export const ORANGE: vec4 = [1, 0.5, 0, 1] as vec4;
    export const PURPLE: vec4 = [0.5, 0, 1, 1] as vec4;
    export const BROWN: vec4 = [0.5, 0.25, 0, 1] as vec4;
    export const PINK: vec4 = [1, 0.75, 0.8, 1] as vec4;    
}