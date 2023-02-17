import Stats from "stats.js";
import { ConfigurationComponent } from "./ui";
import {vec2, vec3, vec4} from "gl-matrix";

namespace COLORS
{
    export const RED: vec4 = [1, 0, 0, 1] as vec4;
    export const GREEN: vec4 = [0, 1, 0, 1] as vec4;
    export const BLUE: vec4 = [0, 0, 1, 1] as vec4;
    export const WHITE: vec4 = [1, 1, 1, 1] as vec4;
    export const BLACK: vec4 = [0, 0, 0, 1] as vec4;
    export const YELLOW: vec4 = [1, 1, 0, 1] as vec4;
    export const CYAN: vec4 = [0, 1, 1, 1] as vec4;
    export const MAGENTA: vec4 = [1, 0, 1, 1] as vec4;
    export const GRAY: vec4 = [0.5, 0.5, 0.5, 1] as vec4;
    export const LIGHT_GRAY: vec4 = [0.75, 0.75, 0.75, 1] as vec4;
    export const DARK_GRAY: vec4 = [0.25, 0.25, 0.25, 1] as vec4;
    export const ORANGE: vec4 = [1, 0.5, 0, 1] as vec4;
    export const PURPLE: vec4 = [0.5, 0, 1, 1] as vec4;
    export const BROWN: vec4 = [0.5, 0.25, 0, 1] as vec4;
    export const PINK: vec4 = [1, 0.75, 0.8, 1] as vec4;    
}

class Sphere
{
    private _radius: number;
    private _color: vec4;

    constructor(radius: number, color: vec4)
    {
        this._radius = radius;
        this._color = color;
    }

    public get radius(): number { return this._radius; }
    public set radius(value: number) { this._radius = value; }

    public get color(): vec4 { return this._color; }
    public set color(value: vec4) { this._color = value; }
}

interface SceneParameters
{
    sphere: Sphere;
    lightDir?: vec3;
    ambientLight?: number;
    backgroundColor?: vec4;
}

class Scene
{
    private _sphere: Sphere;
    private _lightDir: vec3;
    private _ambientLight: number;
    private _backgroundColor: vec4;

    constructor({sphere, lightDir = vec3.fromValues(0, 1, 0), ambientLight = 0.1, backgroundColor = COLORS.BLACK}: SceneParameters)
    {
        this._sphere = sphere;
        this._lightDir = lightDir;
        this._ambientLight = ambientLight;
        this._backgroundColor = backgroundColor;
    }

    public get sphere(): Sphere { return this._sphere; }

    public get lightDir(): vec3 { return this._lightDir; }
    public set lightDir(value: vec3) { this._lightDir = value; }

    public get ambientLight(): number { return this._ambientLight; }
    public set ambientLight(value: number) { this._ambientLight = value; }

    public get backgroundColor(): vec4 { return this._backgroundColor; }
    public set backgroundColor(value: vec4) { this._backgroundColor = value; }
}

export class Render
{
    private _renderTarget: HTMLCanvasElement;
    private _renderContext: CanvasRenderingContext2D;
    private _height: number;
    private _width: number;
    private _rgbBuffer: Uint8ClampedArray;
    private _image!: ImageData;
    private _scene!: Scene;
    private _stats: Stats;
    private _settings: ConfigurationComponent;
    
    constructor(canvasId: string)
    {
        if(document.getElementById(canvasId) as HTMLCanvasElement == null)
            throw new Error("Canvas element 'raytracer-canvas' not found");

        this._renderTarget = document.getElementById(canvasId) as HTMLCanvasElement;
        this._renderContext = this._renderTarget.getContext("2d") as CanvasRenderingContext2D;
        if(this._renderTarget.height == 0 || this._renderTarget.width == 0 || this._renderTarget.height == null || this._renderTarget.width == null)
            throw new Error("Canvas element 'raytracer-canvas' has no size");
        
        this._height = this._renderTarget.height;
        this._width = this._renderTarget.width;

        // Array containing color data for each pixel [r_0, g_0, b_0, a_0, r_1, g_1, ... , a_width*height*4-1]
        this._rgbBuffer = new Uint8ClampedArray(this._width * this._height * 4);

        this._stats = new Stats();
        this._stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

        this._settings = new ConfigurationComponent();

        document.body.appendChild( this._stats.dom );
        document.body.appendChild( this._settings.dom );
    }

    public start(): void
    {
        this._scene = new Scene({sphere: new Sphere(0.5, COLORS.RED)});
        this.update();
    }

    private update(): void
    {
        this._scene.lightDir = vec3.normalize(vec3.create(), this._settings.lightDir);
        this._scene.sphere.radius = this._settings.sphereRadius;
        this._scene.sphere.color =  this._settings.sphereColor;
        this.render(this._scene);
        requestAnimationFrame(this.update.bind( this ));
    }

    private render(scene: Scene): void {
        this._stats.begin();
        if(this._settings.update)
        {
            this.sample(scene);
            this.uploadBuffer();
        }
        this._stats.end();
    }

    private sample(scene: Scene): void
    {
        for(let y = 0; y < this._height; y++)
            for(let x = 0; x < this._width; x++)
            {
                let coord: vec2 = [x/this._width, y/this._height];
                coord[0] = coord[0] * 2.0 - 1.0;
                coord[1] = coord[1] * 2.0 - 1.0;
                
                let color: vec4 = this.perPixel(coord, scene);
                let index = (x + y * this._width) * 4;
                this._rgbBuffer[index]     = color[0] * 255;
                this._rgbBuffer[index + 1] = color[1] * 255;
                this._rgbBuffer[index + 2] = color[2] * 255;
                this._rgbBuffer[index + 3] = color[3] * 255;
            }
    }

    private uploadBuffer(): void
    {
        // Creates empty image data of the size of the canvas
        this._image = this._renderContext.createImageData(this._width, this._height);
        // Copies the data from the rgb buffer to the image buffer
        this._image.data.set(this._rgbBuffer);
        // Puts the image data on the canvas
        this._renderContext.putImageData(this._image, 0, 0);
    }

    /**
     * Emulates a pixel shader. 
     * @param coord Coordinate of the pixel in the screen.
     * @returns Returns a color for each pixel.
     */
    private perPixel(coord: vec2, scene: Scene): vec4
    {
        let rayOrigin: vec3 = [0, 0, 1.0];
        let rayDirection: vec3 = [coord[0], coord[1], -1.0];

        let radius: number = scene.sphere.radius;

        let a: number = vec3.dot(rayDirection, rayDirection);
        let b: number = 2.0 * vec3.dot(rayOrigin, rayDirection);
        let c: number = vec3.dot(rayOrigin, rayOrigin) - radius * radius;
        let d: number = b * b - 4.0 * a * c;

        if(d < 0.0)
            return scene.backgroundColor;
       
        let t: number = (-b - Math.sqrt(d)) / (2.0 * a);
        let hit: vec3 = vec3.scaleAndAdd(vec3.create(), rayOrigin, rayDirection, t);

        let normal: vec3 = vec3.normalize(vec3.create(), hit);

        let diffuse: number = Math.max(scene.ambientLight, vec3.dot(normal, vec3.negate(vec3.create(), scene.lightDir)));

        let sphereColor = vec4.create(); 
        vec4.copy(sphereColor, scene.sphere.color);
        sphereColor[0] *= diffuse;
        sphereColor[1] *= diffuse;
        sphereColor[2] *= diffuse;
        
        return sphereColor;        
    }

}