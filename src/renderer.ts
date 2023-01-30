import Stats from "stats.js";
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

export class Render
{
    private _renderTarget: HTMLCanvasElement;
    private _renderContext: CanvasRenderingContext2D;
    private _height: number;
    private _width: number;
    private _rgbBuffer: Uint8ClampedArray;
    private _image!: ImageData;
    private _stats: Stats;
    private _update: boolean = false;
    private _counter: number = 0;
    
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
        document.body.appendChild( this._stats.dom );
    }

    public start(update: boolean = false): void
    {
        this._update = update;
        this.render();
    }

    private sample(backgroundColor: vec4, ambientLight: number, lightDir: vec3): void
    {
        for(let y = 0; y < this._height; y++)
            for(let x = 0; x < this._width; x++)
            {
                let coord: vec2 = [x/this._width, y/this._height];
                coord[0] = coord[0] * 2.0 - 1.0;
                coord[1] = coord[1] * 2.0 - 1.0;
                
                let color: vec4 = this.perPixel(coord, backgroundColor, ambientLight, lightDir);
                let index = (x + y * this._width) * 4;
                this._rgbBuffer[index]     = color[0] * 255;
                this._rgbBuffer[index + 1] = color[1] * 255;
                this._rgbBuffer[index + 2] = color[2] * 255;
                this._rgbBuffer[index + 3] = color[3] * 255;
            }
    }

    private render(): void {
        this._stats.begin();
        this._counter++;
        let backgroundColor: vec4 = COLORS.BLACK;
        let ambientLight: number = 0.05;

        let lx: number = Math.cos(this._counter);
        let lyz: number = -Math.sin(this._counter);
        let lightDir: vec3 = vec3.normalize(vec3.create(), [lx, lyz, lyz]);
        this.sample(backgroundColor, ambientLight, lightDir);
        this.uploadBuffer();

        this._stats.end();
        if(this._update)
            requestAnimationFrame(this.render.bind( this ));
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
    private perPixel(coord: vec2, backgroundColor: vec4, ambientLight: number, lightDir: vec3): vec4
    {
        let rayOrigin: vec3 = [0, 0, 1.0];
        let rayDirection: vec3 = [coord[0], coord[1], -1.0];

        let radius: number = 0.5;

        let a: number = vec3.dot(rayDirection, rayDirection);
        let b: number = 2.0 * vec3.dot(rayOrigin, rayDirection);
        let c: number = vec3.dot(rayOrigin, rayOrigin) - radius * radius;
        let d: number = b * b - 4.0 * a * c;

        if(d < 0.0)
            return backgroundColor;
       
        let t: number = (-b - Math.sqrt(d)) / (2.0 * a);
        let hit: vec3 = vec3.scaleAndAdd(vec3.create(), rayOrigin, rayDirection, t);

        let normal: vec3 = vec3.normalize(vec3.create(), hit);

        let diffuse: number = Math.max(ambientLight, vec3.dot(normal, vec3.negate(vec3.create(), lightDir)));

        let sphereColor = vec4.create(); 
        vec4.copy(sphereColor, COLORS.PURPLE);
        sphereColor[0] *= diffuse;
        sphereColor[1] *= diffuse;
        sphereColor[2] *= diffuse;
        
        return sphereColor;        
    }

}