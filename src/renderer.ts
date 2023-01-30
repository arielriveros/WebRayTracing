import Stats from "stats.js";

interface Color
{
    r: number;
    g: number;
    b: number;
    a: number;
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

    public start(): void
    {
        this.loop();
    }

    private render(): void
    {
        for(let y = 0; y < this._height; y++)
            for(let x = 0; x < this._width; x++)
            {
                let coord = {x: x/this._width, y: y/this._height};
                let color: Color = this.perPixel(coord);
                let index = (x + y * this._width) * 4;
                this._rgbBuffer[index]     = color.r;
                this._rgbBuffer[index + 1] = color.g;
                this._rgbBuffer[index + 2] = color.b;
                this._rgbBuffer[index + 3] = color.a;
            }
    }

    private loop(): void {
        this._stats.begin();

        this.render();
        this.uploadBuffer();

        this._stats.end();
        requestAnimationFrame(this.loop.bind( this ));
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
     * Emulates a per pixel shader. 
     * @param coord Coordinate of the pixel in the screen.
     * @returns Returns a random color for each pixel.
     */
    private perPixel(coord: {x: number, y: number}): Color
    {
        let color: Color = {
            r: coord.x * 255, 
            g: coord.y * 255, 
            b: 0, 
            a: 255
        };
        return color;        
    }

}