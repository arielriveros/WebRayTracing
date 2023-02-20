import { vec3, vec4 } from "gl-matrix";
import { VolumeObject } from "./VolumeObject";

interface SphereParameters
{
    position?: vec3,
    radius?: number,
    color?: vec4
}

export class Sphere extends VolumeObject
{
    private _radius: number;

    constructor({position = vec3.fromValues(0, 0, 0), radius = 1, color = vec4.fromValues(1, 1, 1, 1)}: SphereParameters)
    {
        super(position, color);
        this._radius = radius;
    }

    public get radius(): number { return this._radius; }
    public set radius(value: number) { this._radius = value; }
}