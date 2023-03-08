import { vec3, vec4 } from "gl-matrix";
import RenderObject, { RayIntersection, RenderObjectParameters } from "../renderObject";
import Ray from "src/ray/ray";

interface PlaneParameters extends RenderObjectParameters
{
    size?: number;
}

export class Plane extends RenderObject
{
    private _size: number;
    private _uMin: number;
    private _uMax: number;
    private _vMin: number;
    private _vMax: number;
    private _normal: vec3;
    private _tangent: vec3;
    private _bitangent: vec3;

    constructor(parameters: PlaneParameters = {})
    {
        super(parameters, 'plane');
        this._size = parameters.size ?? 0.5;
        this._uMin = -this._size;
        this._uMax = this._size;
        this._vMin = -this._size;
        this._vMax = this._size;
        this._normal = vec3.fromValues(0, 1, 0);
        this._tangent = vec3.fromValues(1, 0, 0);
        this._bitangent = vec3.fromValues(0, 0, 1);
    }

    public get size(): number { return this._size; }
    public set size(value: number) { 
        this._size = value;
        this._uMin = -value;
        this._uMax = value;
        this._vMin = -value;
        this._vMax = value;
    }

    public override getIntersection(ray: Ray, intersection: RayIntersection): void
    {
        let closestDistance: number = Number.MAX_VALUE;
        let origin = vec3.sub(vec3.create(), ray.origin, this.position);

        let denom: number = vec3.dot(this._normal, ray.direction);
        if(denom > 0.0001)
        {
            let p0l0: vec3 = vec3.create();
            vec3.sub(p0l0, this.position, origin);
            closestDistance = vec3.dot(p0l0, this._normal) / denom;
            if(closestDistance < intersection.hitDistance)
            {
                let hitPoint: vec3 = vec3.create();
                vec3.scaleAndAdd(hitPoint, origin, ray.direction, closestDistance);
                let u: number = vec3.dot(hitPoint, this._tangent);
                let v: number = vec3.dot(hitPoint, this._bitangent);
                if(u >= this._uMin && u <= this._uMax && v >= this._vMin && v <= this._vMax)
                {
                    intersection.hitDistance = closestDistance;
                    intersection.closestObject = this;
                }
            }
        }
    }

    public override getNormalAtPoint(point: vec3): vec3
    {
        return vec3.negate(vec3.create(), this._normal);
    }
}