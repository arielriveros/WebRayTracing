import { vec3, vec4 } from "gl-matrix";
import RenderObject, { RayIntersection } from "../renderObject";
import Ray from "src/ray/ray";

interface CubeParameters
{
    position?: vec3,
    size?: number,
    color?: vec4
}

export class Cube extends RenderObject
{
    private _size: number;
    private _min: vec3 = vec3.create();
    private _max: vec3 = vec3.create();

    constructor({position = vec3.create(), size = 1, color = vec4.fromValues(1, 1, 1, 1)}: CubeParameters)
    {
        super(position, color, 'cube');
        this._size = size;
        
        this._min = this.calcMin();
        this._max = this.calcMax();
    }

    public get size(): number { return this._size; }
    public set size(value: number)
    {
        this._size = value; 
        this._min = this.calcMin();
        this._max = this.calcMax();
    }

    public get min(): vec3 { return this._min; }
    public get max(): vec3 { return this._max; }

    private calcMin(): vec3
    { 
        return vec3.add(this._min, this.position, vec3.fromValues(-this._size, -this._size, -this._size)); 
    }
    
    private calcMax(): vec3 
    { 
        return vec3.add(this._max, this.position, vec3.fromValues(this._size, this._size, this._size));
    }

    public override getIntersection(ray: Ray, intersection: RayIntersection): void
    {
        let origin = vec3.sub(vec3.create(), ray.origin, this.position);

        let tmin: number = (this.min[0] - origin[0]) / ray.direction[0];
        let tmax: number = (this.max[0] - origin[0]) / ray.direction[0];

        if(tmin > tmax)
        {
            let temp: number = tmin;
            tmin = tmax;
            tmax = temp;                        
        }

        let tymin: number = (this.min[1] - origin[1]) / ray.direction[1];
        let tymax: number = (this.max[1] - origin[1]) / ray.direction[1];

        if(tymin > tymax)
        {
            let temp: number = tymin;
            tymin = tymax;
            tymax = temp;
        }

        if((tmin > tymax) || (tymin > tmax))
            return;

        if(tymin > tmin)
            tmin = tymin;
        
        if(tymax < tmax)
            tmax = tymax;

        let tzmin: number = (this.min[2] - origin[2]) / ray.direction[2];
        let tzmax: number = (this.max[2] - origin[2]) / ray.direction[2];

        if(tzmin > tzmax)
        {
            let temp: number = tzmin;
            tzmin = tzmax;
            tzmax = temp;
        }

        if((tmin > tzmax) || (tzmin > tmax))
            return;

        if(tzmin > tmin)
            tmin = tzmin;

        if(tzmax < tmax)
            tmax = tzmax;

        if(tmin < intersection.hitDistance && tmin > 0.0)
        {   
            intersection.hitDistance = tmin;
            intersection.closestObject = this;
        }
    }

    public override getNormalAtPoint(point: vec3): vec3
    {
        let normal = vec3.create();
        let min = this.min;
        let max = this.max;

        if(point[0] === min[0])
            normal[0] = -1;
        else if(point[0] === max[0])
            normal[0] = 1;
        
        if(point[1] === min[1])
            normal[1] = -1;
        else if(point[1] === max[1])
            normal[1] = 1;

        if(point[2] === min[2])
            normal[2] = -1;
        else if(point[2] === max[2])
            normal[2] = 1;
        
        return normal;
    }
}