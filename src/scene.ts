import { vec3, vec4 } from "gl-matrix";
import { COLORS } from "./utils";
import { RenderObject } from "./objects/renderObject";

interface SceneParameters
{
    lightDir?: vec3;
    ambientLight?: number;
    backgroundColor?: vec4;
    bounceLimit?: number;
}

export class Scene
{
    private _objects: Array<RenderObject>;
    private _lightDir: vec3;
    private _ambientLight: number;
    private _backgroundColor: vec4;
    private _bounceLimit: number;

    constructor({lightDir = vec3.fromValues(0, 1, 0), ambientLight = 0.1, backgroundColor = COLORS.BLACK, bounceLimit = 1}: SceneParameters)
    {
        this._objects = [];
        this._lightDir = lightDir;
        this._ambientLight = ambientLight;
        this._backgroundColor = backgroundColor;
        this._bounceLimit = bounceLimit;
    }

    public get objects(): Array<RenderObject> { return this._objects; }

    public get lightDir(): vec3 { return this._lightDir; }
    public set lightDir(value: vec3) { this._lightDir = value; }

    public get ambientLight(): number { return this._ambientLight; }
    public set ambientLight(value: number) { this._ambientLight = value; }

    public get backgroundColor(): vec4 { return this._backgroundColor; }
    public set backgroundColor(value: vec4) { this._backgroundColor = value; }

    public get bounceLimit(): number { return this._bounceLimit; }
    public set bounceLimit(value: number) { this._bounceLimit = value; }

    public addObject(object: RenderObject): void
    {
        this._objects.push(object);
    }

    public removeObject(index: number): void
    {
        if(index !== -1)
            this._objects.splice(index, 1);
    }
}