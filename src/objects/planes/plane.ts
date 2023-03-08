import { vec3, vec4 } from "gl-matrix";
import RenderObject, { RayIntersection } from "../renderObject";
import Ray from "src/ray/ray";

interface PlaneParameters
{
    position?: vec3;
    rotation?: vec3;
    color?: vec4;
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

    constructor({position = vec3.create(), rotation = vec3.create(), color = vec4.fromValues(1, 1, 1, 1), size = 1}: PlaneParameters)
    {
        super(position, rotation, color, 'plane');
        this._size = size;
        this._uMin = -size;
        this._uMax = size;
        this._vMin = -size;
        this._vMax = size;
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

    public get uMin(): number { return this._uMin; }
    public get uMax(): number { return this._uMax; }
    public get vMin(): number { return this._vMin; }
    public get vMax(): number { return this._vMax; }
    public get normal(): vec3 { return this._normal; }
    public get tangent(): vec3 { return this._tangent; }
    public get bitangent(): vec3 { return this._bitangent; }

    public override getIntersection(ray: Ray, intersection: RayIntersection): void
    {
        let closestDistance: number = Number.MAX_VALUE;
        let origin = vec3.sub(vec3.create(), ray.origin, this.position);

        let denom: number = vec3.dot(this.normal, ray.direction);
        if(denom > 0.0001)
        {
            let p0l0: vec3 = vec3.create();
            vec3.sub(p0l0, this.position, origin);
            closestDistance = vec3.dot(p0l0, this.normal) / denom;
            if(closestDistance < intersection.hitDistance)
            {
                let hitPoint: vec3 = vec3.create();
                vec3.scaleAndAdd(hitPoint, origin, ray.direction, closestDistance);
                let u: number = vec3.dot(hitPoint, this.tangent);
                let v: number = vec3.dot(hitPoint, this.bitangent);
                if(u >= this.uMin && u <= this.uMax && v >= this.vMin && v <= this.vMax)
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