import { vec3 } from "gl-matrix";

export default class Ray
{
    private _origin: vec3;
    private _direction: vec3;

    constructor(origin?: vec3, direction?: vec3)
    {
        this._origin = origin ? origin : vec3.create();
        this._direction = direction ? direction : vec3.create();
    }

    public get origin(): vec3 { return this._origin; }
    public set origin(value: vec3) { this._origin = value; }

    public get direction(): vec3 { return this._direction; }
    public set direction(value: vec3) { this._direction = value; }
}