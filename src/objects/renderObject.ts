import { mat4, vec3, vec4 } from "gl-matrix";
import Ray from "src/ray/ray";

type Geometry = 'sphere' | 'cube' | 'plane' | 'circle';
export interface RayIntersection
{
    closestObject: RenderObject | null;
    hitDistance: number;
}

export default abstract class RenderObject
{
    private _position: vec3;
    private _color: vec4;
    private _type: Geometry;

    constructor (position: vec3, color: vec4, type: Geometry)
    {
        this._position = position;
        this._color = color;
        this._type = type;
    }

    public get position(): vec3 { return this._position; }
    public set position(value: vec3) { this._position = value; }

    public get color(): vec4 { return this._color; }
    public set color(value: vec4) { this._color = value; }

    public get type(): Geometry { return this._type; }

    public getIntersection(ray: Ray, intersection: RayIntersection): void { }
    public getNormalAtPoint(point: vec3): vec3 { return vec3.create(); }
}