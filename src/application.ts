import { vec3 } from "gl-matrix";
import Camera from "./scene/camera";
import Renderer from "./renderer";
import Scene from "./scene/scene";
import { COLORS } from "./utils";
import Stats from "stats.js";
import { UserInterface } from "./ui";
import * as OBJECTS from "./objects/objects";

export class Application
{
    private _appContainer: HTMLDivElement;
    private _renderer: Renderer;
    private _camera: Camera;
    private _scene: Scene;
    private _ui: UserInterface;
    private _stats: Stats;

    constructor()
    {
        let container = document.getElementById("raytracer") as HTMLDivElement;
        if(container == null)
            throw new Error(`HTML element with id 'raytracer' not found`);

        this._appContainer = container;
        this._appContainer.style.display = "flex";

        this._renderer = new Renderer(this._appContainer);
        this._stats = new Stats();
        this._stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

        this._camera = new Camera({position: vec3.fromValues(-0.5, 1, 3)});
        this._camera.rotateY(-0.33);
        this._scene = new Scene({});
        this._ui = new UserInterface(this._appContainer);
        this._stats.dom.style.position = "relative";
        this._stats.dom.style.zIndex = "100";

        document.getElementById("raytracer")?.appendChild(this._stats.dom);
        
        // Add a sphere
        const sphere = new OBJECTS.Sphere({position: vec3.fromValues(0, -1, 0), radius: 0.5, color: COLORS.RED});
        this._scene.addObject(sphere);

        // Add a cube
        const cube = new OBJECTS.Cube({position: vec3.fromValues(-0.55, -0.25, 0), size: 0.5, color: COLORS.YELLOW});
        this._scene.addObject(cube);

        // Add a plane
        const plane = new OBJECTS.Plane({color: COLORS.CYAN, size: 4});
        this._scene.addObject(plane);

        this._renderer.renderTarget.addEventListener("mousedown", (e) => {
            let object = this._renderer.castScreenRay(e.offsetX, e.offsetY);
            if(object)
                this._ui.setSelectedObject(object);
        });

        // Move position on mouse move and clicking
        this._renderer.renderTarget.addEventListener("mousemove", (e) => {
            if(!this._camera) return;

            switch(e.buttons)
            {   
                case 1:
                    this._camera.moveForward(-e.movementY / 100);
                    this._camera.moveRight(e.movementX / 100);
                    this._camera.isMoving = true;
                    break;
                case 2:
                    this._camera.rotateY(-e.movementX / 500);
                    this._camera.isMoving = true;
                    break;
                case 3:
                    this._camera.moveUp(e.movementY / 100);
                    this._camera.moveRight(e.movementX / 100);
                    this._camera.isMoving = true;
                    break;
                default:
                    this._camera.isMoving = false;
                    break;

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
        this._renderer.start(this._scene, this._camera);
        this._ui.start(this._renderer);
        this.update();
    }

    public update() : void
    {
        this._stats.begin();
        this._renderer.render();
        this._stats.end();
        requestAnimationFrame(this.update.bind(this));
    }
}