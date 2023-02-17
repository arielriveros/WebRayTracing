import Stats from "stats.js";
import { ConfigurationComponent } from "./ui";
import {vec2, vec3, vec4} from "gl-matrix";
import { Camera } from "./camera";
import { COLORS } from "./utils";
import { Scene } from "./scene";
import { Sphere } from "./sphere";
import { Ray } from "./ray";


export class Render
{
    private _renderTarget: HTMLCanvasElement;
    private _renderContext: CanvasRenderingContext2D;
    private _height: number;
    private _width: number;
    private _rgbBuffer: Uint8ClampedArray;
    private _image!: ImageData;
    private _scene!: Scene;
    private _camera!: Camera;
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
        this._camera = new Camera({height: this._height, width: this._width});
        this._scene = new Scene({sphere: new Sphere(0.5, COLORS.RED)});
        this.update();
    }

    private update(): void
    {
        this._scene.lightDir = vec3.normalize(vec3.create(), this._settings.lightDir);
        this._scene.sphere.radius = this._settings.sphereRadius;
        this._scene.sphere.color =  this._settings.sphereColor;

        this.render(this._camera, this._scene);
        requestAnimationFrame(this.update.bind( this ));
    }

    private render(camera: Camera, scene: Scene): void {
        this._stats.begin();
        if(this._settings.update)
        {
            this.sample(camera, scene);
            this.uploadBuffer();
        }
        this._stats.end();
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

    private sample(camera: Camera, scene: Scene): void
    {
        const rayOrigin: vec3 = camera.position;
        let ray: Ray = new Ray();
        ray.origin = rayOrigin;
        for(let y = 0; y < this._height; y++)
        {
            for(let x = 0; x < this._width; x++)
            {
                ray.direction = camera.rayDirections[x+y*this._width];
                let color: vec4 = this.traceRay(ray, scene);
                let index = (x + y * this._width) * 4;
                this._rgbBuffer[index]     = color[0] * 255;
                this._rgbBuffer[index + 1] = color[1] * 255;
                this._rgbBuffer[index + 2] = color[2] * 255;
                this._rgbBuffer[index + 3] = color[3] * 255;
            }
        }
    }

    private traceRay(ray: Ray, scene: Scene): vec4
    {

        let radius: number = scene.sphere.radius;
        let a: number = vec3.dot(ray.direction, ray.direction);
        let b: number = 2.0 * vec3.dot(ray.origin, ray.direction);
        let c: number = vec3.dot(ray.origin, ray.origin) - radius * radius;
        let d: number = b * b - 4.0 * a * c;

        if(d < 0.0)
            return scene.backgroundColor;
       
        let t: number = (-b - Math.sqrt(d)) / (2.0 * a);
        let hit: vec3 = vec3.scaleAndAdd(vec3.create(), ray.origin, ray.direction, t);

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