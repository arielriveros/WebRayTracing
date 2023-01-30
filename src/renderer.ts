export class Render
{
    private _renderTarget: HTMLCanvasElement;
    private _renderContext: CanvasRenderingContext2D;
    private _height: number;
    private _width: number;
    private _rgbBuffer: Uint8ClampedArray;
    private _imageBuffer!: ImageData;

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

        this._rgbBuffer = new Uint8ClampedArray(this._width * this._height * 4);
    }

    public start(): void
    {
        this.loop();
    }

    public render(): void
    {
        for(let i = 0; i < this._rgbBuffer.length; i += 4)
        {
            this._rgbBuffer[i] = Math.random() * 255;   // RED
            this._rgbBuffer[i+1] = Math.random() * 255; // GREEN
            this._rgbBuffer[i+2] = Math.random() * 255; // BLUE
            this._rgbBuffer[i+3] = 255;                 // ALPHA
        }

        this.uploadBuffer();
    }

    private loop(): void {
        this.render();
        requestAnimationFrame(this.loop.bind( this ));
    }

    private uploadBuffer(): void
    {
        // Creates empty image data of the size of the canvas
        this._imageBuffer = this._renderContext.createImageData(this._width, this._height);
        // Copies the data from the rgb buffer to the image buffer
        this._imageBuffer.data.set(this._rgbBuffer);
        // Puts the image data on the canvas
        this._renderContext.putImageData(this._imageBuffer, 0, 0);
    }

}