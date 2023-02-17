import { vec3, vec4 } from "gl-matrix";

interface SphereParameters
{
    position?: vec3,
    radius?: number,
    color?: vec4
}

export class Sphere
{
    private _position: vec3;
    private _radius: number;
    private _color: vec4;

    constructor({position = vec3.fromValues(0, 0, 0), radius = 1, color = vec4.fromValues(1, 1, 1, 1)}: SphereParameters)
    {
        this._position = position;
        this._radius = radius;
        this._color = color;
    }

    public get position(): vec3 { return this._position; }
    public set position(value: vec3) { this._position = value; }

    public get radius(): number { return this._radius; }
    public set radius(value: number) { this._radius = value; }

    public get color(): vec4 { return this._color; }
    public set color(value: vec4) { this._color = value; }
}