import { vec3, vec4} from "gl-matrix";
import { Camera } from "./camera";
import { Scene } from "./scene";
import { Sphere } from "./objects/sphere";
import { Ray } from "./ray";
import { VolumeObject } from "./objects/VolumeObject";
import { Cube } from "./objects/cube";


export class Render
{
    private _renderTarget: HTMLCanvasElement;
    private _renderContext: CanvasRenderingContext2D;
    private _rgbBuffer: Uint8ClampedArray;
    private _image!: ImageData;
    
    constructor(canvasId: string)
    {
        if(document.getElementById(canvasId) as HTMLCanvasElement == null)
            throw new Error("Canvas element 'raytracer-canvas' not found");

        this._renderTarget = document.getElementById(canvasId) as HTMLCanvasElement;
        this._renderContext = this._renderTarget.getContext("2d") as CanvasRenderingContext2D;
        if(this._renderTarget.height == 0 || this._renderTarget.width == 0 || this._renderTarget.height == null || this._renderTarget.width == null)
            throw new Error("Canvas element 'raytracer-canvas' has no size");
        
        // Array containing color data for each pixel [r_0, g_0, b_0, a_0, r_1, g_1, ... , a_width*height*4-1]
        this._rgbBuffer = new Uint8ClampedArray(this._renderTarget.width * this._renderTarget.height * 4);
        
        // Prevents the context menu from appearing when right clicking on the canvas
        this._renderTarget.addEventListener( "contextmenu", (e) => {
            e.preventDefault();
        });        
    }

    public start(camera: Camera, scene: Scene): void
    {
        camera.setHeightAndWidth(this._renderTarget.height, this._renderTarget.width);
    }

    public render(camera: Camera, scene: Scene): void {
        this.sample(camera, scene);
        this.uploadBuffer();
    }

    private uploadBuffer(): void
    {
        // Creates empty image data of the size of the canvas
        this._image = this._renderContext.createImageData(this._renderTarget.width, this._renderTarget.height);
        // Copies the data from the rgb buffer to the image buffer
        this._image.data.set(this._rgbBuffer);
        // Puts the image data on the canvas
        this._renderContext.putImageData(this._image, 0, 0);
    }

    private sample(camera: Camera, scene: Scene): void
    {
        vec3.normalize(scene.lightDir, scene.lightDir);

        const rayOrigin: vec3 = camera.position;
        let ray: Ray = new Ray();
        ray.origin = rayOrigin;
        
        for(let y = 0; y < this._renderTarget.height; y++)
        {
            for(let x = 0; x < this._renderTarget.width; x++)
            {
                ray.direction = camera.rayDirections[x+y*this._renderTarget.width];
                let color: vec4 = this.traceRay(ray, scene);
                let index = (x + y * this._renderTarget.width) * 4;
                this._rgbBuffer[index]     = color[0] * 255;
                this._rgbBuffer[index + 1] = color[1] * 255;
                this._rgbBuffer[index + 2] = color[2] * 255;
                this._rgbBuffer[index + 3] = color[3] * 255;
            }
        }
    }

    private traceRay(ray: Ray, scene: Scene): vec4
    {
        if(scene.volumes.length == 0)
            return scene.backgroundColor;
        
        let closestVolume: VolumeObject | null = null;
        let hitDistance: number = Number.MAX_VALUE;
        let origin: vec3 = vec3.create();

        for(let volume of scene.volumes)
        {
            
            vec3.add(origin, ray.origin, volume.position);

            switch(volume.type)
            {
                case 'sphere':
                    let sphere = volume as Sphere;

                    let a: number = vec3.dot(ray.direction, ray.direction);
                    let b: number = 2.0 * vec3.dot(origin, ray.direction);
                    let c: number = vec3.dot(origin, origin) - sphere.radius * sphere.radius;
                    let d: number = b * b - 4.0 * a * c;
            
                    if(d < 0.0)
                        continue;
                
                    let t: number = (-b - Math.sqrt(d)) / (2.0 * a);
                    if(t < hitDistance)
                    {
                        hitDistance = t;
                        closestVolume = sphere as Sphere;
                    }
                    break;

                case 'cube':
                    let cube = volume as Cube;

                    let tmin: number = (cube.min[0] - origin[0]) / ray.direction[0];
                    let tmax: number = (cube.max[0] - origin[0]) / ray.direction[0];

                    if(tmin > tmax)
                    {
                        let temp: number = tmin;
                        tmin = tmax;
                        tmax = temp;
                    }

                    let tymin: number = (cube.min[1] - origin[1]) / ray.direction[1];
                    let tymax: number = (cube.max[1] - origin[1]) / ray.direction[1];

                    if(tymin > tymax)
                    {
                        let temp: number = tymin;
                        tymin = tymax;
                        tymax = temp;
                    }

                    if((tmin > tymax) || (tymin > tmax))
                        continue;

                    if(tymin > tmin)
                        tmin = tymin;

                    if(tymax < tmax)
                        tmax = tymax;
                    
                    let tzmin: number = (cube.min[2] - origin[2]) / ray.direction[2];
                    let tzmax: number = (cube.max[2] - origin[2]) / ray.direction[2];

                    if(tzmin > tzmax)
                    {
                        let temp: number = tzmin;
                        tzmin = tzmax;
                        tzmax = temp;
                    }

                    if((tmin > tzmax) || (tzmin > tmax))
                        continue;

                    if(tzmin > tmin)
                        tmin = tzmin;

                    if(tzmax < tmax)
                        tmax = tzmax;

                    if(tmin < hitDistance)
                    {
                        hitDistance = tmin;
                        closestVolume = cube as Cube;
                    }
                    break;

                default:
                    break;
            }
        }

        if(closestVolume == null)
            return scene.backgroundColor;

        origin = vec3.create();
        vec3.add(origin, ray.origin, closestVolume.position);
        let hit: vec3 = vec3.scaleAndAdd(vec3.create(), origin, ray.direction, hitDistance);

        let normal: vec3 = vec3.normalize(vec3.create(), hit);

        let diffuse: number = Math.max(scene.ambientLight, vec3.dot(normal, vec3.negate(vec3.create(), scene.lightDir)));

        let volumeColor = vec4.create(); 
        vec4.copy(volumeColor, closestVolume.color);
        volumeColor[0] *= diffuse;
        volumeColor[1] *= diffuse;
        volumeColor[2] *= diffuse;
        
        return volumeColor;        
    }

    public get renderTarget(): HTMLCanvasElement { return this._renderTarget; }
}