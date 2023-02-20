import { vec3, vec4 } from "gl-matrix";

export abstract class VolumeObject
{
    private _position: vec3;
    private _color: vec4;

    constructor (position: vec3, color: vec4)
    {
        this._position = position;
        this._color = color;
    }

    public get position(): vec3 { return this._position; }
    public set position(value: vec3) { this._position = value; }

    public get color(): vec4 { return this._color; }
    public set color(value: vec4) { this._color = value; }
}