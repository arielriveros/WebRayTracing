import { vec3, vec4} from "gl-matrix";
import Camera from "./scene/camera";
import Scene from "./scene/scene";
import Ray from "./ray/ray";
import RenderObject, { RayIntersection } from "./objects/renderObject";
import HitData from "./ray/hitData";
import Material from "./objects/material";

export default class Renderer
{
    private _renderTarget: HTMLCanvasElement;
    private _renderContext: CanvasRenderingContext2D;
    private _rgbBuffer: Uint8ClampedArray;
    private _image!: ImageData;
    private _frameIndex: number = 1;
    private _accumulationBuffer: Array<vec4> = [];
    
    private _scene!: Scene;
    private _camera!: Camera;
    
    private _width: number = 640;
    private _height: number = 480;
    
    private _bias: number = 1e-8;
    private _clearColor: vec4 = vec4.fromValues(0, 0, 0, 1);

    private _bounceLimit: number = 2;
    private _previousBounceLimit: number = this._bounceLimit;
    private _lastUpdate: number = 0;
    
    public shadowBias: number = 0.02;
    public updateInterval: number = 10;

    public accumulate: boolean = true;
    public diffuseLighting: boolean = true;
    public directionalShadows: boolean = true;
    public reflections: boolean = true;
    public ambientOcclusion: boolean = false;
    
    constructor(appContainer: HTMLDivElement)
    {
        
        this._renderTarget = document.createElement("canvas") as HTMLCanvasElement;
        this._renderContext = this._renderTarget.getContext("2d") as CanvasRenderingContext2D;
        this._renderTarget.width = this._width;
        this._renderTarget.height = this._height;

        // Creates empty image data of the size of the canvas
        this._image = this._renderContext.createImageData(this._renderTarget.width, this._renderTarget.height);
        
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
        if(this._lastUpdate % this.updateInterval !== 0 && this.updateInterval !== 0)
            return;

        else
            this._bounceLimit = this._previousBounceLimit;

        if(this._frameIndex === 1)
        {
            this._accumulationBuffer = new Array<vec4>(this._renderTarget.width * this._renderTarget.height);
        
            for(let i = 0; i < this._accumulationBuffer.length; i++)
                this._accumulationBuffer[i] = vec4.fromValues(0, 0, 0, 1);
        }

        for(let y = 0; y < this._renderTarget.height; y++)
        {
            for(let x = 0; x < this._renderTarget.width; x++)
            {
                // skip some pixels to speed up rendering when camera is moving
                if(this._camera.isMoving && (x % 2 == 0 || y % 2 == 0 || x % 3 == 0 || y % 3 == 0))
                {
                    this._rgbBuffer[(x + y * this._renderTarget.width) * 4] = this._clearColor[0] * 255;
                    this._rgbBuffer[(x + y * this._renderTarget.width) * 4 + 1] = this._clearColor[1] * 255;
                    this._rgbBuffer[(x + y * this._renderTarget.width) * 4 + 2] = this._clearColor[2] * 255;
                    this._rgbBuffer[(x + y * this._renderTarget.width) * 4 + 3] = this._clearColor[3] * 255;

                    continue;
                }
                let color: vec4 = this.rayGen(x, y);
                vec4.add(this._accumulationBuffer[x + y * this._renderTarget.width], this._accumulationBuffer[x + y * this._renderTarget.width], color)
                
                if(this.accumulate && 1/this._frameIndex > 0.1)
                {
                    let accumulatedColor: vec4 = vec4.clone(this._accumulationBuffer[x + y * this._renderTarget.width]) ;
                    vec4.scale(accumulatedColor, accumulatedColor, 1 / this._frameIndex);

                    //clamp accumulatedColor
                    vec4.min(accumulatedColor, accumulatedColor, vec4.fromValues(1, 1, 1, 1));
                    vec4.max(accumulatedColor, accumulatedColor, vec4.create());

                    let index = (x + y * this._renderTarget.width) * 4;
                    this._rgbBuffer[index]     = accumulatedColor[0] * 255;
                    this._rgbBuffer[index + 1] = accumulatedColor[1] * 255;
                    this._rgbBuffer[index + 2] = accumulatedColor[2] * 255;
                    this._rgbBuffer[index + 3] = accumulatedColor[3] * 255;
                }
                else
                {
                    let index = (x + y * this._renderTarget.width) * 4;
                    this._rgbBuffer[index]     = color[0] * 255;
                    this._rgbBuffer[index + 1] = color[1] * 255;
                    this._rgbBuffer[index + 2] = color[2] * 255;
                    this._rgbBuffer[index + 3] = color[3] * 255;
                }
            }
        }
        this.uploadBuffer();

        if(this._camera.isMoving)
        {
            this._bounceLimit = 1;
            this.resetFrameIndex();
        }
    }

    private uploadBuffer(): void
    {
        
        // Copies the data from the rgb buffer to the image buffer
        this._image.data.set(this._rgbBuffer);
        // Puts the image data on the canvas
        this._renderContext.putImageData(this._image, 0, 0);

        if(this.accumulate)
            this._frameIndex++;
        else
            this.resetFrameIndex();
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

            if(!this.diffuseLighting)
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


            if(this.ambientOcclusion && !this._camera.isMoving)
            {
                // ambient occlusion
                let occlusion: number = 0;
                const numSamples: number = 8;
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
            
            if(this.directionalShadows && !this._camera.isMoving)
            {
                // calculate shadow
                let shadowRay = new Ray();
                shadowRay.origin = vec3.scaleAndAdd(vec3.create(), hitData.worldPosition, hitData.worldNormal, this._bias);
                // shador ray direction with random offset to artificially soften shadows
                let randomOffset = vec3.create();
                vec3.random(randomOffset, this.shadowBias);
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


            if(this.reflections && this._bounceLimit > 1)
            {
                let objectMaterial: Material = this._scene.objects[hitData.objectIndex].material;
                reflectiveFactor *= objectMaterial.metallic;
    
                ray.origin = vec3.scaleAndAdd(vec3.create(), hitData.worldPosition, hitData.worldNormal, this._bias);

                let reflectionOffset = vec3.fromValues(
                    (Math.random()*(-0.25) + Math.random()*0.25) * objectMaterial.roughness, 
                    (Math.random()*(-0.25) + Math.random()*0.25) * objectMaterial.roughness, 
                    (Math.random()*(-0.25) + Math.random()*0.25) * objectMaterial.roughness
                );
                let offsetWorldNormal = vec3.add(vec3.create(), hitData.worldNormal, reflectionOffset);
                let reflectionDir = vec3.sub(
                    vec3.create(), 
                    ray.direction, 
                    vec3.scale(
                        vec3.create(), 
                        offsetWorldNormal, 
                        2 * vec3.dot(offsetWorldNormal, ray.direction)
                    )
                );
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

    public resetFrameIndex(): void { this._frameIndex = 1; }

    public get renderTarget(): HTMLCanvasElement { return this._renderTarget; }
    public get scene(): Scene { return this._scene; }

    public get bounceLimit(): number { return this._bounceLimit; }
    public set bounceLimit(value: number) { 
        this._previousBounceLimit = value;
        this._bounceLimit = value; 
    }

}