import { mat4, vec2, vec3, vec4 } from "gl-matrix";

interface CameraParameters
{
    position?: vec3,
    rotation?: vec3,
    fov?: number,
    near?: number,
    far?: number
}

export class Camera
{
    private _height!: number;
    private _width!: number;
    private _position: vec3;
    private _rotation: vec3;
    private _fov: number;
    private _near: number;
    private _far: number;
    private _forward: vec3;

    private _projection: mat4 = mat4.create();
    private _inverseProjection: mat4 = mat4.create();
    private _view: mat4 = mat4.create();
    private _inverseView: mat4 = mat4.create();

    private _rayDirections!: vec3[];

    // Caches
    private _forward_pos: vec3 = vec3.create();
    private _target: vec4 = vec4.create();
    private _normalized: vec3 = vec3.create(); 
    private _fixed: vec4 = vec4.create();
    private _inverted: vec4 = vec4.create();
    private _rayDirection: vec3 = vec3.create();

    constructor({position = vec3.fromValues(0, 0, 2), rotation = vec3.fromValues(0, 0, 0), fov = 45, near = 0.1, far = 100}: CameraParameters)
    {
        this._position = vec3.negate(vec3.create(), position);
        this._rotation = rotation;
        this._fov = fov;
        this._near = near;
        this._far = far;
        this._forward = vec3.fromValues(0, 0, 1)
        this._rayDirections = [];
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
        mat4.lookAt(this._view, this._position, vec3.add(this._forward_pos, this._position, this._forward), vec3.fromValues(0, 1, 0) );
        mat4.invert(this._inverseView, this._view);
    }

    public moveForward(distance: number): void
    {
        this._position = vec3.add(this._position, this._position, vec3.scale(vec3.create(), this._forward, distance));
    }

    public moveRight(distance: number): void
    {
        const right: vec3 = vec3.cross(vec3.create(), this._forward, vec3.fromValues(0, 1, 0));
        this._position = vec3.add(this._position, this._position, vec3.scale(vec3.create(), right, distance));
    }

    public moveUp(distance: number): void
    {
        this._position = vec3.add(this._position, this._position, vec3.scale(vec3.create(), vec3.fromValues(0, 1, 0), distance));
    }

    public rotateY(rate: number): void
    {
        this._rotation[1] += rate;
        this._forward = vec3.fromValues(Math.sin(this._rotation[1]), 0, Math.cos(this._rotation[1]));
        this.update();
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

                vec4.transformMat4(this._target, [coord[0], coord[1], 1, 1] as vec4, this._inverseProjection);
                vec3.normalize(this._normalized, vec3.scale(vec3.create(), vec3.fromValues(this._target[0], this._target[1], this._target[2]), 1/this._target[3]));
                this._fixed = vec4.fromValues(this._normalized[0], this._normalized[1], this._normalized[2], 0)
                vec4.transformMat4(this._inverted, this._fixed, this._inverseView);
                this._rayDirection = vec3.fromValues(this._inverted[0], this._inverted[1], this._inverted[2]);
                // Cache ray directions
                this._rayDirections[x + y * this._width] = this._rayDirection;
            }
        }
    }

    public get rayDirections(): vec3[] { return this._rayDirections; }
    public get position(): vec3 { return this._position; }
    public get rotation(): vec3 { return this._rotation; }
    public get height(): number { return this._height; }
    public get width(): number { return this._width; }

    public setHeightAndWidth(height: number, width: number): void
    {
        this._height = height;
        this._width = width;
        this.update();
    }
}