import { vec3 } from "gl-matrix";

export default class Ray
{
    public origin: vec3;
    public direction: vec3;

    constructor(origin?: vec3, direction?: vec3)
    {
        this.origin = origin ? origin : vec3.create();
        this.direction = direction ? direction : vec3.create();
    }
}