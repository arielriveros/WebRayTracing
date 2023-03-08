import { mat4, vec3, vec4 } from "gl-matrix";
import Ray from "src/ray/ray";

type Geometry = 'sphere' | 'cube' | 'plane';
export interface RayIntersection
{
    closestObject: RenderObject | null;
    hitDistance: number;
}

export default abstract class RenderObject
{
    private _position: vec3;
    private _rotation: vec3;
    private _transform: mat4;
    private _color: vec4;
    private _type: Geometry;

    constructor (position: vec3, rotation: vec3, color: vec4, type: Geometry)
    {
        this._position = position;
        this._rotation = rotation;
        this._color = color;
        this._type = type;
        this._transform = mat4.create();
        this.updateTransform();
    }

    public get position(): vec3 { return this._position; }
    public set position(value: vec3) { this._position = value; this.updateTransform(); }

    public get rotation(): vec3 { return this._rotation; }
    public set rotation(value: vec3) { this._rotation = value; this.updateTransform(); }

    public get transform(): mat4 { return this._transform; }

    private updateTransform(): void
    {
        const translate = mat4.fromTranslation(mat4.create(), this._position);
        const rotateX = mat4.fromXRotation(mat4.create(), this._rotation[0]);
        const rotateY = mat4.fromYRotation(mat4.create(), this._rotation[1]);
        const rotateZ = mat4.fromZRotation(mat4.create(), this._rotation[2]);
        const rotate = mat4.mul(mat4.create(), mat4.mul(mat4.create(), rotateX, rotateY), rotateZ);
        this._transform = mat4.mul(mat4.create(), mat4.mul(mat4.create(), translate, rotate), this._transform);
    }

    public get color(): vec4 { return this._color; }
    public set color(value: vec4) { this._color = value; }

    public get type(): Geometry { return this._type; }

    public getIntersection(ray: Ray, intersection: RayIntersection): void { }
    public getNormalAtPoint(point: vec3): vec3 { return vec3.create(); }
}