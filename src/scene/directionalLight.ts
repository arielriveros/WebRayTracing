import { vec3 } from "gl-matrix";

export default class DirectionalLight
{
    private _direction: vec3;
    private _phi: number = 0;
    private _theta: number = 0;

    constructor(direction?: vec3)
    {
        this._direction = direction || vec3.fromValues(0, 1, 0);
    }

    public get direction(): vec3 { return this._direction; }
    public set direction(value: vec3) { this._direction = value; }

    public get phi(): number { return this._phi; }
    public set phi(value: number)
    {
        this._phi = value;
        this.updateDirection();
    }

    public get theta(): number { return this._theta; }
    public set theta(value: number)
    {
        this._theta = value;
        this.updateDirection();
    }

    public updateDirection(): void
    {
        this._direction[0] = Math.cos(this._phi) * Math.sin(this._theta);
        this._direction[1] = Math.cos(this._theta);
        this._direction[2] = Math.sin(this._phi) * Math.sin(this._theta);
    }
}