import { vec3, vec4 } from "gl-matrix";
import Material from "./material";
import Ray from "src/ray/ray";

type Geometry = 'sphere' | 'cube' | 'plane' | 'circle';

export interface RayIntersection
{
    closestObject: RenderObject | null;
    hitDistance: number;
}

export interface RenderObjectParameters
{
    position?: vec3;
    material?: Material;
}

export default abstract class RenderObject
{
    private _position: vec3;
    private _material: Material;
    private _type: Geometry;

    constructor (parameters: RenderObjectParameters = {}, type: Geometry)
    {
        this._position = parameters.position ?? vec3.create();
        this._material = parameters.material ?? new Material( {});
        this._type = type;
    }

    public get position(): vec3 { return this._position; }
    public set position(value: vec3) { this._position = value; }

    public get material(): Material { return this._material; }
    public set material(value: Material) { this._material = value; }

    public get type(): Geometry { return this._type; }

    public getIntersection(ray: Ray, intersection: RayIntersection): void { }
    public getNormalAtPoint(point: vec3): vec3 { return vec3.create(); }
}