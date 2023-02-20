import { vec3, vec4 } from "gl-matrix";
import { Sphere } from "./sphere";
import { COLORS } from "./utils";

interface SceneParameters
{
    lightDir?: vec3;
    ambientLight?: number;
    backgroundColor?: vec4;
}

export class Scene
{
    private _spheres: Array<Sphere>;
    private _lightDir: vec3;
    private _ambientLight: number;
    private _backgroundColor: vec4;

    constructor({lightDir = vec3.fromValues(0, 1, 0), ambientLight = 0.1, backgroundColor = COLORS.BLACK}: SceneParameters)
    {
        this._spheres = [];
        this._lightDir = lightDir;
        this._ambientLight = ambientLight;
        this._backgroundColor = backgroundColor;
    }

    public get spheres(): Array<Sphere> { return this._spheres; }

    public get lightDir(): vec3 { return this._lightDir; }
    public set lightDir(value: vec3) { this._lightDir = value; }

    public get ambientLight(): number { return this._ambientLight; }
    public set ambientLight(value: number) { this._ambientLight = value; }

    public get backgroundColor(): vec4 { return this._backgroundColor; }
    public set backgroundColor(value: vec4) { this._backgroundColor = value; }

    public addSphere(sphere: Sphere): void
    {
        this._spheres.push(sphere);
    }

    public removeSphere(index: number): void
    {
        if(index !== -1)
            this._spheres.splice(index, 1);
    }
}