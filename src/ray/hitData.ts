import { vec3 } from "gl-matrix";

export default class HitData
{
    public distance: number;
    public worldPosition: vec3;
    public worldNormal: vec3;
    public objectIndex: number;

    constructor()
    {
        this.distance = -1;
        this.worldPosition = vec3.create();
        this.worldNormal = vec3.create();
        this.objectIndex = Number.MAX_VALUE;
    }
}