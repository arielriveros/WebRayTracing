import { vec3, vec4 } from "gl-matrix";
import { RenderObject } from "../renderObject";

interface SphereParameters
{
    position?: vec3,
    rotation?: vec3,
    radius?: number,
    color?: vec4
}

export class Sphere extends RenderObject
{
    private _radius: number;

    constructor({position = vec3.create(), rotation = vec3.create(), radius = 1, color = vec4.fromValues(1, 1, 1, 1)}: SphereParameters)
    {
        super(position, rotation, color, 'sphere');
        this._radius = radius;
    }

    public get radius(): number { return this._radius; }
    public set radius(value: number) { this._radius = value; }

    public override getNormalAtPoint(point: vec3): vec3 {
        return vec3.normalize(vec3.create(), point);
    }
}