import { vec4 } from "gl-matrix";

export class Sphere
{
    private _radius: number;
    private _color: vec4;

    constructor(radius: number, color: vec4)
    {
        this._radius = radius;
        this._color = color;
    }

    public get radius(): number { return this._radius; }
    public set radius(value: number) { this._radius = value; }

    public get color(): vec4 { return this._color; }
    public set color(value: vec4) { this._color = value; }
}