import { vec3, vec4 } from "gl-matrix";

type Geometry = 'sphere' | 'cube' | 'plane';

export abstract class RenderObject
{
    private _position: vec3;
    private _rotation: vec3;
    private _color: vec4;
    private _type: Geometry;

    constructor (position: vec3, rotation: vec3, color: vec4, type: Geometry)
    {
        this._position = position;
        this._rotation = rotation;
        this._color = color;
        this._type = type;
    }

    public get position(): vec3 { return this._position; }
    public set position(value: vec3) { this._position = value; }

    public get rotation(): vec3 { return this._rotation; }
    public set rotation(value: vec3) { this._rotation = value; }

    public get color(): vec4 { return this._color; }
    public set color(value: vec4) { this._color = value; }

    public get type(): Geometry { return this._type; }

    public getNormalAtPoint(point: vec3): vec3 { return vec3.create(); }
}