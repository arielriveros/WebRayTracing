import { vec3, vec4 } from "gl-matrix";
import { COLORS } from "./utils";
import { VolumeObject } from "./objects/volumeObject";

interface SceneParameters
{
    lightDir?: vec3;
    ambientLight?: number;
    backgroundColor?: vec4;
}

export class Scene
{
    private _volumes: Array<VolumeObject>;
    private _lightDir: vec3;
    private _ambientLight: number;
    private _backgroundColor: vec4;

    constructor({lightDir = vec3.fromValues(0, 1, 0), ambientLight = 0.1, backgroundColor = COLORS.BLACK}: SceneParameters)
    {
        this._volumes = [];
        this._lightDir = lightDir;
        this._ambientLight = ambientLight;
        this._backgroundColor = backgroundColor;
    }

    public get volumes(): Array<VolumeObject> { return this._volumes; }

    public get lightDir(): vec3 { return this._lightDir; }
    public set lightDir(value: vec3) { this._lightDir = value; }

    public get ambientLight(): number { return this._ambientLight; }
    public set ambientLight(value: number) { this._ambientLight = value; }

    public get backgroundColor(): vec4 { return this._backgroundColor; }
    public set backgroundColor(value: vec4) { this._backgroundColor = value; }

    public addVolume(volume: VolumeObject): void
    {
        this._volumes.push(volume);
    }

    public removeVolume(index: number): void
    {
        if(index !== -1)
            this._volumes.splice(index, 1);
    }
}