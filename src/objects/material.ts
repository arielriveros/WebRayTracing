import { vec4 } from "gl-matrix";

interface MaterialParameters
{
    baseColor?: vec4,
    roughness?: number,
    metallic?: number
}

export default class Material
{
    public baseColor: vec4;
    public roughness: number;
    public metallic: number;

    constructor({baseColor = vec4.fromValues(1, 1, 1, 1), roughness = 0.5, metallic = 0.5}: MaterialParameters)
    {
        this.baseColor = baseColor;
        this.roughness = roughness;
        this.metallic = metallic;
    }
}
