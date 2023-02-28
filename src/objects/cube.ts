import { vec3, vec4 } from "gl-matrix";
import { VolumeObject } from "./volumeObject";

interface CubeParameters
{
    position?: vec3,
    rotation?: vec3,
    size?: number,
    color?: vec4
}

export class Cube extends VolumeObject
{
    private _size: number;
    private _min: vec3;
    private _max: vec3;

    constructor({position = vec3.create(), rotation = vec3.create(), size = 1, color = vec4.fromValues(1, 1, 1, 1)}: CubeParameters)
    {
        super(position, rotation, color, 'cube');
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

    public calcMin(): vec3 { return vec3.add(vec3.create(), this.position, vec3.fromValues(-this._size, -this._size, -this._size)); }
    public calcMax(): vec3 { return vec3.add(vec3.create(), this.position, vec3.fromValues(this._size, this._size, this._size)); }


    public override getNormalAtPoint(point: vec3): vec3
    {
        let normal = vec3.create();
        let min = this._min;
        let max = this._min;

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