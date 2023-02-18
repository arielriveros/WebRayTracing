import { vec3 } from "gl-matrix";
import { Camera } from "./camera";
import { Render } from "./renderer";
import { Scene } from "./scene";
import { COLORS } from "./utils";
import Stats from "stats.js";
import { Sphere } from "./sphere";
import { UserInterface } from "./ui";

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

        this._camera = new Camera({});
        this._scene = new Scene({});
        this._ui = new UserInterface(this._scene);
        document.body.appendChild(this._ui.dom);

        this._scene.lightDir = vec3.normalize(vec3.create(), vec3.fromValues(0, 0, 1));
        this._scene.addSphere(new Sphere({position: vec3.fromValues(0, 0, 0), radius: 0.5, color: COLORS.GREEN}));
        this._scene.addSphere(new Sphere({position: vec3.fromValues(0.2, 1, -1), radius: 0.5, color: COLORS.RED}));
        this._scene.addSphere(new Sphere({position: vec3.fromValues(-0.5, -0.5, 0.5), radius: 0.3, color: COLORS.BLUE}));
        this._scene.addSphere(new Sphere({position: vec3.fromValues(0.5, -0.5, 0.5), radius: 0.3, color: COLORS.YELLOW}));
        this._scene.addSphere(new Sphere({position: vec3.fromValues(0, -1, 0), radius: 0.1, color: COLORS.MAGENTA}));
        this._scene.addSphere(new Sphere({position: vec3.fromValues(-1, 1, 0), radius: 0.2, color: COLORS.CYAN}));
        

        // Move position on mouse move and clicking
        this._renderer.renderTarget.addEventListener("mousemove", (e) => {
            if(!this._camera) return;
            if(e.buttons === 1)
            {
                this._camera.position[0] = e.clientX / this._camera.width * 2 - 1;
                this._camera.position[1] = -e.clientY / this._camera.height * 2 + 1;
            }
        });     
        
        // Zoom on mouse wheel
        this._renderer.renderTarget.addEventListener("wheel", (e) => {
            if(!this._camera) return;
            this._camera!.position[2] -= e.deltaY / 1000;
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