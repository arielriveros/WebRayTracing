import { vec2, vec3, vec4 } from "gl-matrix";
import RenderObject, { RayIntersection } from "../renderObject";
import Ray from "src/ray/ray";

interface CircleParameters
{
    position?: vec3;
    rotation?: vec3;
    color?: vec4;
    radius?: number;
}

export class Circle extends RenderObject
{
    private _radius: number;
    private _normal: vec3;

    constructor({position = vec3.create(), rotation = vec3.create(), color = vec4.fromValues(1, 1, 1, 1), radius = 1}: CircleParameters)
    {
        super(position, rotation, color, 'plane');
        this._radius = radius;
        this._normal = vec3.fromValues(0, 0, 1);
    }

    public get radius(): number { return this._radius; }
    public set radius(value: number) { this._radius = value; }

    public override getIntersection(ray: Ray, intersection: RayIntersection): void
    {
        const n = vec3.transformMat4(this._normal, vec3.fromValues(0, 0, 1), this.transform);
        const p0 = vec3.transformMat4(vec3.create(), this.position, this.transform);
    
        const nd = vec3.dot(n, ray.direction);
        if (Math.abs(nd) < 1e-6)
            return;
    
        const t = vec3.dot(vec3.sub(vec3.create(), p0, ray.origin), n) / nd;
    
        if (t < 0)
            return;
    
        const p = vec3.scaleAndAdd(vec3.create(), ray.origin, ray.direction, t);
        const dist = vec2.length(vec2.sub(vec2.create(), vec2.fromValues(p[0], p[1]), vec2.fromValues(p0[0], p0[1])));
    
        if (dist <= this.radius && (intersection.closestObject === null || t < intersection.hitDistance))
        {
            intersection.closestObject = this;
            intersection.hitDistance = t;
        }
    }

    public override getNormalAtPoint(point: vec3): vec3
    {
        return vec3.negate(vec3.create(), this._normal);
    }
}