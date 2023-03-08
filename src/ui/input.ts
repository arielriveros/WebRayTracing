import { Application } from "src/application";
import RenderObject from "src/objects/renderObject";

export default class Input
{
    private _app: Application;
    private _inputTarget: HTMLElement;
    private _selectedObject: RenderObject | null;

    constructor(app: Application)
    {
        this._app = app;
        this._inputTarget = this._app.renderer.renderTarget;
        this._selectedObject = null;
    }

    public start(): void
    {
        this._inputTarget.addEventListener("mousedown", (e) => {
            let object = this._app.renderer.castScreenRay(e.offsetX, e.offsetY);
            this._selectedObject = object;
            if(object)
                this._app.ui.setSelectedObject(object);
        });

        // Move position on mouse move and clicking
        this._inputTarget.addEventListener("mousemove", (e) => {
            if(!this._app.camera) return;

            switch(e.buttons)
            {   
                case 1:
                    this._app.camera.moveForward(-e.movementY / 100);
                    this._app.camera.moveRight(e.movementX / 100);
                    this._app.camera.isMoving = true;
                    break;
                case 2:
                    this._app.camera.rotateY(-e.movementX / 500);
                    this._app.camera.isMoving = true;
                    break;
                case 3:
                    this._app.camera.moveUp(e.movementY / 100);
                    this._app.camera.moveRight(e.movementX / 100);
                    this._app.camera.isMoving = true;
                    break;
                default:
                    this._app.camera.isMoving = false;
                    break;

            }
        });     
        
        // Zoom on mouse wheel
        this._inputTarget.addEventListener("wheel", (e) => {
            if(!this._app.camera) return;
            this._app.camera.moveForward(-e.deltaY / 500);
        });

        // Keyboard Inputs
        document.addEventListener("keydown", (e) => {
            if(!this._selectedObject) return;
            switch(e.key)
            {
                // WASDQE
                case "w":
                    this._selectedObject.position[1] -= 0.1;
                    break;
                case "a":
                    this._selectedObject.position[0] += 0.1;
                    break;
                case "s":
                    this._selectedObject.position[1] += 0.1;
                    break;
                case "d":
                    this._selectedObject.position[0] -= 0.1;
                    break;
                case "q":
                    this._selectedObject.position[2] += 0.1;
                    break;
                case "e":
                    this._selectedObject.position[2] -= 0.1;
                    break;

                // DELETE
                case "Delete":
                    let index = this._app.scene.objects.indexOf(this._selectedObject);
                    this._app.scene.removeObject(index);
            }
        });
    }
}