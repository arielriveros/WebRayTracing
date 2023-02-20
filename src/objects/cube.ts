import { vec3, vec4 } from "gl-matrix";
import { VolumeObject } from "./VolumeObject";

interface CubeParameters
{
    position?: vec3,
    size?: number,
    color?: vec4
}

export class Cube extends VolumeObject
{
    private _size: number;

    constructor({position = vec3.fromValues(0, 0, 0), size = 1, color = vec4.fromValues(1, 1, 1, 1)}: CubeParameters)
    {
        super(position, color, 'cube');
        this._size = size;
    }

    public get size(): number { return this._size; }
    public set size(value: number) { this._size = value; }

    public get min(): vec3 { return vec3.fromValues(this.position[0] - this.size / 2, this.position[1] - this.size / 2, this.position[2] - this.size / 2); }
    public get max(): vec3 { return vec3.fromValues(this.position[0] + this.size / 2, this.position[1] + this.size / 2, this.position[2] + this.size / 2); }

    public get normals(): Array<vec3>
    {
        return [
            vec3.fromValues(1, 0, 0),
            vec3.fromValues(-1, 0, 0),
            vec3.fromValues(0, 1, 0),
            vec3.fromValues(0, -1, 0),
            vec3.fromValues(0, 0, 1),
            vec3.fromValues(0, 0, -1)
        ];
    }
}