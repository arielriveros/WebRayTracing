import { mat4, vec2, vec3, vec4 } from "gl-matrix";

interface CameraParameters
{
    height: number,
    width: number,
    position?: vec3,
    fov?: number,
    near?: number,
    far?: number
}

export class Camera
{
    private _height: number;
    private _width: number;
    private _position: vec3;
    private _fov: number;
    private _near: number;
    private _far: number;
    private _forward: vec3;

    private _projection: mat4 = mat4.create();
    private _inverseProjection: mat4 = mat4.create();
    private _view: mat4 = mat4.create();
    private _inverseView: mat4 = mat4.create();

    private _rayDirections!: vec3[];

    constructor({height, width, position = vec3.fromValues(0, 0, -2), fov = 45, near = 0.1, far = 100}: CameraParameters)
    {
        this._height = height;
        this._width = width;
        this._position = position;
        this._fov = fov;
        this._near = near;
        this._far = far;
        this._forward = vec3.fromValues(0, 0, 1)
        this._rayDirections = [];

        this.update();
    }

    public update(): void
    {
        this.calculateProjection();
        this.calculateView();
        this.calculateRayDirections();
    }

    public calculateProjection()
    {
        mat4.perspective(this._projection, this._fov, this._width / this._height, this._near, this._far);
        mat4.invert(this._inverseProjection, this._projection);
    }

    public calculateView()
    {
        mat4.lookAt(this._view, this._position, vec3.add(vec3.create(), this._position, this._forward), vec3.fromValues(0, 1, 0) );
        mat4.invert(this._inverseView, this._view);
    }

    public calculateRayDirections(): void
    {
        this._rayDirections = [];
        for(let y = 0; y < this._height; y++)
        {
            for(let x = 0; x < this._width; x++)
            {
                const coord: vec2 = [ x / this._width, y / this._height ] as vec2;
			    coord[0] = coord[0] * 2.0 - 1.0;
                coord[1] = coord[1] * 2.0 - 1.0;

                const target: vec4 = vec4.transformMat4(vec4.create(), [coord[0], coord[1], 1, 1] as vec4, this._inverseProjection);
                const normalized: vec3 = vec3.normalize(vec3.create(), vec3.scale(vec3.create(), vec3.fromValues(target[0], target[1], target[2]), 1/target[3]));
                const fixed: vec4 = vec4.fromValues(normalized[0], normalized[1], normalized[2], 0)
                const inverted: vec4 = vec4.transformMat4(vec4.create(), fixed, this._inverseView);
                const rayDirection: vec3 = vec3.fromValues(inverted[0], inverted[1], inverted[2]);
                // Cache ray directions
                this._rayDirections[x + y * this._width] = rayDirection;
            }
        }
    }

    public get rayDirections(): vec3[] { return this._rayDirections; }
    public get position(): vec3 { return this._position; }
}