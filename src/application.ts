import { vec2, vec3 } from "gl-matrix";
import { Camera } from "./camera";
import { Render } from "./renderer";
import { Scene } from "./scene";
import { COLORS } from "./utils";
import Stats from "stats.js";
import { Sphere } from "./objects/volumes/sphere";
import { UserInterface } from "./ui";
import { Cube } from "./objects/volumes/cube";
import { Plane } from "./objects/planes/plane";

export class Application
{
    private _renderer: Render;
    private _camera: Camera;
    private _scene: Scene;
    private _ui: UserInterface;
    private _stats: Stats;

    constructor()
    {
        this._renderer = new Render("raytracer-canvas");
        this._stats = new Stats();
        this._stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this._stats.dom );

        this._camera = new Camera({position: vec3.fromValues(0, 1, 3)});
        this._scene = new Scene({});
        this._ui = new UserInterface(this._scene);
        document.body.appendChild(this._ui.dom);

        this._scene.lightDir = vec3.normalize(vec3.create(), vec3.fromValues(0, 0, 1));
        
        // Add a sphere
        const sphere = new Sphere({position: vec3.fromValues(1, 1, 0), radius: 0.5, color: COLORS.RED});
        this._scene.addObject(sphere);

        // Add a cube
        const cube = new Cube({position: vec3.fromValues(-0.5, 0.15, 0), size: 0.5, color: COLORS.YELLOW});
        this._scene.addObject(cube);

        // Add a plane
        const plane = new Plane({position: vec3.fromValues(0, -2, 0), color: COLORS.BLUE});
        this._scene.addObject(plane);


        // Move position on mouse move and clicking
        this._renderer.renderTarget.addEventListener("mousemove", (e) => {
            if(!this._camera) return;

            
            if(e.buttons === 1)
            {
                this._camera.moveForward(-e.movementY / 100);
                this._camera.moveRight(e.movementX / 100);
            }

            if(e.buttons === 2)
            {
                this._camera.rotateY(-e.movementX / 500);
            }

            if(e.buttons === 3)
            {
                this._camera.moveUp(e.movementY / 100);
                this._camera.moveRight(e.movementX / 100);
            }
        });     
        
        // Zoom on mouse wheel
        this._renderer.renderTarget.addEventListener("wheel", (e) => {
            if(!this._camera) return;
            this._camera.moveForward(-e.deltaY / 500);
        });
    }

    public start(): void
    {
        this._ui.start();
        this._renderer.start(this._camera, this._scene);
        this.update();
    }

    public update() : void
    {
        this._stats.begin();
        this._renderer.render(this._camera, this._scene);
        this._stats.end();
        requestAnimationFrame(this.update.bind(this));
    }
}