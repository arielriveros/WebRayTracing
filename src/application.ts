import { vec3 } from "gl-matrix";
import Camera from "./scene/camera";
import Renderer from "./renderer";
import Scene from "./scene/scene";
import { COLORS } from "./utils";
import Stats from "stats.js";
import { UserInterface } from "./ui/ui";
import * as OBJECTS from "./objects/objects";
import Input from "./ui/input";
import Material from "./objects/material";

export class Application
{
    private _appContainer: HTMLDivElement;
    private _renderer: Renderer;
    private _camera: Camera;
    private _scene: Scene;
    private _ui: UserInterface;
    private _input: Input;
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
        this._scene = new Scene({
            lightDir: vec3.fromValues(0.35, 0.76, 0.5),
            backgroundColor: COLORS.BLUE,
        });

        this._ui = new UserInterface(this._appContainer);
        this._input = new Input(this);

        this._stats.dom.style.position = "relative";
        this._stats.dom.style.zIndex = "100";
        document.getElementById("raytracer")?.appendChild(this._stats.dom);
        
        // Add a sphere
        this._scene.addObject(
            new OBJECTS.Sphere({
                position: vec3.fromValues(0.5, -1, -1),
                radius: 0.5,
                material: new Material({
                    baseColor: COLORS.RED,
                    roughness: Math.random(),
                    metallic: Math.random()
                })
            })
        );

        // Add a sphere
        this._scene.addObject(
            new OBJECTS.Sphere({
                position: vec3.fromValues(0, 0, 101),
                radius: 100,
                material: new Material({
                    baseColor: COLORS.CYAN,
                    roughness: Math.random(),
                    metallic: Math.random()
                })
            })
        );

        // Add a cube
        this._scene.addObject(
            new OBJECTS.Cube({
                position: vec3.fromValues(-0.55, -0.28, 0),
                size: 0.5,
                material: new Material({
                    baseColor: COLORS.GREEN,
                    roughness: Math.random(),
                    metallic: Math.random()
                })
            })
        );

        // Add a plane
        this._scene.addObject(
            new OBJECTS.Plane({
                size: 4,
                material: new Material({
                    baseColor: COLORS.YELLOW,
                    roughness: Math.random(),
                    metallic: Math.random()
                })
            })
        );
   
    }

    public start(): void
    {
        this._renderer.start(this._scene, this._camera);
        this._ui.start(this._renderer);
        this._input.start();
        this.update();
    }

    public update() : void
    {
        this._stats.begin();
        this._renderer.render();
        this._stats.end();
        requestAnimationFrame(this.update.bind(this));
    }

    public get renderer(): Renderer { return this._renderer; }
    public get camera(): Camera { return this._camera; }
    public get scene(): Scene { return this._scene; }
    public get ui(): UserInterface { return this._ui; }

}