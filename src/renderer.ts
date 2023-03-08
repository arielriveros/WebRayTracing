import { vec3, vec4} from "gl-matrix";
import Camera from "./scene/camera";
import Scene from "./scene/scene";
import Ray from "./ray/ray";
import RenderObject, { RayIntersection } from "./objects/renderObject";
import HitData from "./ray/hitData";
import * as OBJECTS from "./objects/objects";

export default class Renderer
{
    private _renderTarget: HTMLCanvasElement;
    private _renderContext: CanvasRenderingContext2D;
    private _rgbBuffer: Uint8ClampedArray;
    private _width: number = 640;
    private _height: number = 480;
    private _image!: ImageData;
    private _scene!: Scene;
    private _camera!: Camera;
    private _bias: number = 0.00001;
    private _clearColor: vec4 = vec4.fromValues(0, 0, 0, 1);
    private _bounceLimit: number = 1;
    private _previousBoundceLimit: number = 1;
    private _shadowBias: number = 0.02;
    private _lastUpdate: number = 0;
    private _updateInterval: number = 10;

    private _diffuseLighting: boolean = true;
    private _directionalShadows: boolean = true;
    private _reflections: boolean = true;
    private _ambientOcclusion: boolean = false;
    
    constructor(appContainer: HTMLDivElement)
    {
        
        this._renderTarget = document.createElement("canvas") as HTMLCanvasElement;
        this._renderContext = this._renderTarget.getContext("2d") as CanvasRenderingContext2D;
        this._renderTarget.width = this._width;
        this._renderTarget.height = this._height;

        // Set the canvas to be behind the UI
        this._renderTarget.style.position = "absolute";
        this._renderTarget.style.zIndex = "-1";

        appContainer.appendChild(this._renderTarget);
        appContainer.style.width = `${this._width}px`;
        
        // Array containing color data for each pixel [r_0, g_0, b_0, a_0, r_1, g_1, ... , a_width*height*4-1]
        this._rgbBuffer = new Uint8ClampedArray(this._renderTarget.width * this._renderTarget.height * 4);
        
        // Prevents the context menu from appearing when right clicking on the canvas
        this._renderTarget.addEventListener( "contextmenu", (e) => {
            e.preventDefault();
        });        
    }

    public start(scene: Scene, camera: Camera): void
    {
        camera.setHeightAndWidth(this._renderTarget.height, this._renderTarget.width);
        this._scene = scene;
        this._scene.renderer = this;
        this._camera = camera;
    }

    public render(): void {

        this._lastUpdate++;
        if(this._lastUpdate % this._updateInterval !== 0 && this._updateInterval !== 0)
            return;

        if(this._camera.isMoving)
            this._bounceLimit = 1;
        else
            this._bounceLimit = this._previousBoundceLimit;

        for(let y = 0; y < this._renderTarget.height; y++)
        {
            for(let x = 0; x < this._renderTarget.width; x++)
            {
                // skip some pixels to speed up rendering when camera is moving
                if(this._camera.isMoving && (x % 2 == 0 || y % 2 == 0))
                {
                    this._rgbBuffer[(x + y * this._renderTarget.width) * 4] = this._clearColor[0] * 255;
                    this._rgbBuffer[(x + y * this._renderTarget.width) * 4 + 1] = this._clearColor[1] * 255;
                    this._rgbBuffer[(x + y * this._renderTarget.width) * 4 + 2] = this._clearColor[2] * 255;
                    continue;
                }
                
                let color: vec4 = this.rayGen(x, y);
                
                let index = (x + y * this._renderTarget.width) * 4;
                this._rgbBuffer[index]     = color[0] * 255;
                this._rgbBuffer[index + 1] = color[1] * 255;
                this._rgbBuffer[index + 2] = color[2] * 255;
                this._rgbBuffer[index + 3] = color[3] * 255;
            }
        }
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

    private rayGen(x: number, y: number): vec4
    {
        let ray: Ray = new Ray();
        ray.origin = this._camera.position;
        ray.direction = this._camera.rayDirections[x+y*this._renderTarget.width];

        let finalColor: vec4 = vec4.create();
        let reflectiveFactor: number = 1;

        for(let i = 0; i < this._bounceLimit; i++)
        {
            let hitData = this.traceRay(ray);
            if(hitData.distance < 0)
            {
                vec4.scaleAndAdd(finalColor, finalColor, this._scene.backgroundColor, reflectiveFactor);
                break;
            }    
            
            let color = vec4.create();

            if(!this._diffuseLighting)
            {
                finalColor = vec4.fromValues(1, 1, 1, 1);
                vec4.scaleAndAdd(finalColor, finalColor, color, reflectiveFactor);
            }

            else
            {   
                let diffuse: number = Math.max(this._scene.ambientLight, vec3.dot(hitData.worldNormal, vec3.negate(vec3.create(), this._scene.directionalLight.direction)));
                let object: RenderObject = this._scene.objects[hitData.objectIndex];

                vec4.copy(color, object.material.baseColor);
                color[0] *= diffuse;
                color[1] *= diffuse;
                color[2] *= diffuse;

                vec4.scaleAndAdd(finalColor, finalColor, color, reflectiveFactor);

            }


            if(this._ambientOcclusion && !this._camera.isMoving)
            {
                // ambient occlusion
                let occlusion: number = 0;
                const numSamples: number = 16;
                const sampleRadius: number = 0.2;
                const sampleOffset: vec3 = vec3.create();
                const occlusionRay: Ray = new Ray();
    
                for (let j = 0; j < numSamples; j++) {
                    vec3.random(sampleOffset, sampleRadius);
                    vec3.add(sampleOffset, sampleOffset, hitData.worldPosition);
                    vec3.sub(occlusionRay.direction, sampleOffset, hitData.worldPosition);
                    vec3.normalize(occlusionRay.direction, occlusionRay.direction);
                    vec3.scaleAndAdd(
                        occlusionRay.origin,
                        hitData.worldPosition,
                        hitData.worldNormal,
                        this._bias
                    );
    
                    const occlusionHitData = this.traceRay(occlusionRay);
                    if (occlusionHitData.distance > 0.001 && occlusionHitData.distance < vec3.distance(sampleOffset, hitData.worldPosition)) 
                    {
                        occlusion += 1.0;
                    }
                }
    
                occlusion /= numSamples;
                const occlusionFactor: number = 0.4;
                finalColor[0] -= occlusion * occlusionFactor;
                finalColor[1] -= occlusion * occlusionFactor;
                finalColor[2] -= occlusion * occlusionFactor;
            }
            
            if(this._directionalShadows && !this._camera.isMoving)
            {
                // calculate shadow
                let shadowRay = new Ray();
                shadowRay.origin = vec3.scaleAndAdd(vec3.create(), hitData.worldPosition, hitData.worldNormal, this._bias);
                // shador ray direction with random offset to artificially soften shadows
                let randomOffset = vec3.create();
                vec3.random(randomOffset, this._shadowBias);
                shadowRay.direction = vec3.sub(vec3.create(), this._scene.directionalLight.direction, randomOffset);
                shadowRay.direction = vec3.negate(shadowRay.direction, shadowRay.direction);
                let shadowHitData = this.traceRay(shadowRay);
                
                if(shadowHitData.distance > 0.007)
                {
                    let shadowFactor: number = 0.5 * reflectiveFactor;
                    finalColor[0] -= shadowFactor;
                    finalColor[1] -= shadowFactor;
                    finalColor[2] -= shadowFactor;
                }
            }


            if(this._reflections && this._bounceLimit > 1)
            {
                reflectiveFactor *= 0.4;
    
                ray.origin = vec3.scaleAndAdd(vec3.create(), hitData.worldPosition, hitData.worldNormal, this._bias);
                let reflectionDir = vec3.sub(vec3.create(), ray.direction, vec3.scale(vec3.create(), hitData.worldNormal, 2 * vec3.dot(hitData.worldNormal, ray.direction)));
                ray.direction = reflectionDir;
            }        
        }

        return finalColor;
    }

    private closestHit(ray: Ray, objectIndex: number, hitDistance: number): HitData
    {
        const hitData: HitData = new HitData();
        hitData.distance = hitDistance;
        hitData.objectIndex = objectIndex;
        
        const closestObject: RenderObject = this._scene.objects[objectIndex];

        let origin = vec3.sub(vec3.create(), ray.origin, closestObject.position);
        vec3.scaleAndAdd(hitData.worldPosition, origin, ray.direction, hitDistance);
        vec3.normalize(hitData.worldNormal, closestObject.getNormalAtPoint(hitData.worldPosition));
        vec3.add(hitData.worldPosition, hitData.worldPosition, closestObject.position);
        
        return hitData;
    }

    private miss(ray: Ray): HitData
    {
        return new HitData();
    }

    private traceRay(ray: Ray): HitData
    {
        let previousIntersection: RayIntersection = {
            closestObject: null,
            hitDistance: Number.MAX_VALUE
        }

        for(let object of this._scene.objects)
            object.getIntersection(ray, previousIntersection);

        if(previousIntersection.closestObject == null)
            return this.miss(ray);

        return this.closestHit(ray, this._scene.objects.indexOf(previousIntersection.closestObject), previousIntersection.hitDistance);     
    }

    public castScreenRay(x: number, y: number): RenderObject | null
    {
        let ray: Ray = new Ray();
        ray.origin = this._camera.position;
        ray.direction = this._camera.getRayDirection(x, y);

        let hitData: HitData = this.traceRay(ray);
        if(hitData.objectIndex == -1)
            return null;

        return this._scene.objects[hitData.objectIndex];
    }

    public get renderTarget(): HTMLCanvasElement { return this._renderTarget; }
    public get scene(): Scene { return this._scene; }

    public set bounceLimit(value: number) { 
        this._previousBoundceLimit = value;
        this._bounceLimit = value; 
    }

    public get shadowBias(): number { return this._shadowBias; }
    public set shadowBias(value: number) { this._shadowBias = value; }

    public get updateInterval(): number { return this._updateInterval; }
    public set updateInterval(value: number) { this._updateInterval = value; }

    public get diffuseLighting(): boolean { return this._diffuseLighting; }
    public set diffuseLighting(value: boolean) { this._diffuseLighting = value; }

    public get directionalShadows(): boolean { return this._directionalShadows; }
    public set directionalShadows(value: boolean) { this._directionalShadows = value; }

    public get reflections(): boolean { return this._reflections; }
    public set reflections(value: boolean) { this._reflections = value; }

    public get ambientOcclusion(): boolean { return this._ambientOcclusion; }
    public set ambientOcclusion(value: boolean) { this._ambientOcclusion = value; }
}