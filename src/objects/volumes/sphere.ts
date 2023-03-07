import { vec3, vec4 } from "gl-matrix";
import RenderObject, { RayIntersection } from "../renderObject";
import Ray from "src/ray/ray";

interface SphereParameters
{
    position?: vec3,
    rotation?: vec3,
    radius?: number,
    color?: vec4
}

export class Sphere extends RenderObject
{
    private _radius: number;

    constructor({position = vec3.create(), rotation = vec3.create(), radius = 1, color = vec4.fromValues(1, 1, 1, 1)}: SphereParameters)
    {
        super(position, rotation, color, 'sphere');
        this._radius = radius;
    }

    public get radius(): number { return this._radius; }
    public set radius(value: number) { this._radius = value; }

    public override getIntersection(ray: Ray, intersection: RayIntersection): void
    {
        let closestDistance: number = Number.MAX_VALUE;
        let origin = vec3.sub(vec3.create(), ray.origin, this.position);

        let a: number = vec3.dot(ray.direction, ray.direction);
        let b: number = 2.0 * vec3.dot(origin, ray.direction);
        let c: number = vec3.dot(origin, origin) - this.radius * this.radius;
        let d: number = b * b - 4.0 * a * c;

        if(d < 0.0)
            return;
    
        closestDistance = (-b - Math.sqrt(d)) / (2.0 * a);
        if(closestDistance < intersection.hitDistance && closestDistance > 0.0)
        {
            intersection.hitDistance = closestDistance;
            intersection.closestObject = this;
        }
    }

    public override getNormalAtPoint(point: vec3): vec3 {
        return point;
    }
}