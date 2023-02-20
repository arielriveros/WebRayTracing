import { vec3, vec4 } from "gl-matrix";
import { hexToVec4, vec4ToHex } from "./utils";
import { Scene } from "./scene";
import { Sphere } from "./objects/sphere";

export class UserInterface
{
    private _scene: Scene
    private _dom: HTMLDivElement;

    constructor(scene: Scene)
    {
        this._scene = scene;

        const uiContainer = document.createElement("div");
        uiContainer.id = "ui-container";
        uiContainer.style.backgroundColor = "#333333";
        uiContainer.style.color = "white";
        uiContainer.style.fontFamily = "sans-serif";
        uiContainer.style.fontSize = "12px";
        uiContainer.style.fontWeight = "bold";
        uiContainer.style.textShadow = "0px 0px 1px black";
        uiContainer.style.padding = "10px";
        uiContainer.style.overflowY = "scroll";
        uiContainer.style.overflowX = "hidden";
        uiContainer.style.position = "absolute";
        uiContainer.style.top = "0px";
        uiContainer.style.right = "0px";
        uiContainer.style.width = "300px";
        uiContainer.style.height = "100%";
        uiContainer.style.zIndex = "100";


        this._dom = uiContainer;
    }

    public start(): void
    {
        this.setUpDirectionalLight();
        this.setUpBackgroundColor();
        this.setUpSpheres();
    }

    private setUpDirectionalLight(): void
    {
        const lightDirContainer = document.createElement("div");
        lightDirContainer.id = "light-dir-container";
        lightDirContainer.style.border = "1px solid black";

        const lightDirLabel = document.createElement("label");
        lightDirLabel.htmlFor = "lightDir";
        lightDirLabel.innerText = "Light Direction";
        
        lightDirContainer.appendChild(lightDirLabel);

        const breakLine = document.createElement("br");
        lightDirContainer.appendChild(breakLine);

        const lightDirXRotation = document.createElement("input");
        lightDirXRotation.id = "lightDirXRotation";
        lightDirXRotation.type = "range";
        lightDirXRotation.min = "-180";
        lightDirXRotation.max = "180";
        lightDirXRotation.value = "0";
        lightDirXRotation.addEventListener("input", (e) => {
            this._scene.lightDir = vec3.fromValues(
                Math.sin((e.target as HTMLInputElement).valueAsNumber * Math.PI / 180),
                Math.cos((e.target as HTMLInputElement).valueAsNumber * Math.PI / 180),
                0
            );
        });


        const lightDirYRotation = document.createElement("input");
        lightDirYRotation.id = "lightDirYRotation";
        lightDirYRotation.type = "range";
        lightDirYRotation.min = "-180";
        lightDirYRotation.max = "180";
        lightDirYRotation.value = "0";
        lightDirYRotation.addEventListener("input", (e) => {
            this._scene.lightDir = vec3.fromValues(
                Math.sin((e.target as HTMLInputElement).valueAsNumber * Math.PI / 180),
                0,
                Math.cos((e.target as HTMLInputElement).valueAsNumber * Math.PI / 180)
            );
        });

        lightDirContainer.appendChild(lightDirXRotation);
        lightDirContainer.appendChild(lightDirYRotation);

        this._dom.appendChild(lightDirContainer);
    }

    private setUpBackgroundColor(): void
    {
        const bgColorContainer = document.createElement("div");
        bgColorContainer.id = "bg-color-container";
        bgColorContainer.style.position = "relative";
        bgColorContainer.style.border = "1px solid black";

        const bgColorLabel = document.createElement("label");
        bgColorLabel.htmlFor = "bgColor";
        bgColorLabel.innerText = "Background Color";
        bgColorLabel.style.position = "relative";
        bgColorLabel.style.top = "0px";
        bgColorLabel.style.left = "0px";
        bgColorLabel.style.width = "100%";
        bgColorLabel.style.textAlign = "center";
        bgColorLabel.style.color = "white";
        bgColorLabel.style.fontFamily = "sans-serif";
        bgColorLabel.style.fontSize = "12px";
        bgColorLabel.style.fontWeight = "bold";
        bgColorLabel.style.textShadow = "0px 0px 1px black";

        bgColorContainer.appendChild(bgColorLabel);

        const bgColorR = document.createElement("input");
        bgColorR.id = "bgColorR";
        bgColorR.type = "color";
        bgColorR.value = vec4ToHex(this._scene.backgroundColor);
        bgColorR.style.width = "100%";
        bgColorR.addEventListener("input", (e) => {
            this._scene.backgroundColor = hexToVec4((e.target as HTMLInputElement).value);
        });

        bgColorContainer.appendChild(bgColorR);

        this._dom.appendChild(bgColorContainer);

    }

    private setUpSpheres(): void
    {
        if(document.getElementById("spheres-container") != null)
        {
            document.getElementById("spheres-container")?.remove();
        }
        const spheresContainer = document.createElement("div");
        spheresContainer.id = "spheres-container";

        const spheresLabel = document.createElement("label");
        spheresLabel.htmlFor = "spheres";
        spheresLabel.innerText = "Spheres";
        spheresContainer.appendChild(spheresLabel);

        for(let i = 0; i < this._scene.volumes.length; i++)
        {
            let sphereContainer = this.setUpSphere(i);
            spheresContainer.appendChild(sphereContainer);
        }
        const addSphereButton = document.createElement("button");
        addSphereButton.id = "add-sphere-button";
        addSphereButton.innerText = "Add Sphere";
        addSphereButton.addEventListener("click", () => {
            this._scene.addSphere(new Sphere({}));
            this.setUpSpheres();
        });

        spheresContainer.appendChild(addSphereButton);

        const addRandomSphereButton = document.createElement("button");
        addRandomSphereButton.id = "add-random-sphere-button";
        addRandomSphereButton.innerText = "Add Random Sphere";
        addRandomSphereButton.addEventListener("click", () => {
            this._scene.addSphere(new Sphere({
                position: vec3.fromValues(
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1
                ),
                radius: Math.random() * 0.5 + 0.5,
                color: vec4.fromValues(
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    1
                )
            }));
            this.setUpSpheres();
        });

        spheresContainer.appendChild(addRandomSphereButton);

        this._dom.appendChild(spheresContainer);
    }

    private setUpSphere(index: number): HTMLDivElement
    {
        const sphereContainer = document.createElement("div");
        sphereContainer.id = `sphere-${index}-container`;
        sphereContainer.style.position = "relative";
        sphereContainer.style.border = "1px solid black";
        sphereContainer.style.padding = "5px";

        const sphereLabel = document.createElement("label");
        sphereLabel.htmlFor = `sphere-${index}`;
        sphereLabel.innerText = `Sphere ${index}`;

        sphereContainer.appendChild(sphereLabel);

        const sphereRemoveButton = document.createElement("button");
        sphereRemoveButton.id = `sphere-${index}-remove-button`;
        sphereRemoveButton.innerText = "Remove";
        sphereRemoveButton.addEventListener("click", () => {
            this._scene.removeSphere(index);
            this.setUpSpheres();
        });

        sphereContainer.appendChild(sphereRemoveButton);

        const spherePosContainer = document.createElement("div");
        spherePosContainer.id = `sphere-${index}-pos-container`;
        spherePosContainer.style.display = "flex";

        const spherePosLabel = document.createElement("label");
        spherePosLabel.htmlFor = `sphere-${index}-pos`;
        spherePosLabel.innerText = `Position`;

        spherePosContainer.appendChild(spherePosLabel);
        const sphereX = this.setUpSpherePosition(index, 'X');
        const sphereY = this.setUpSpherePosition(index, 'Y');
        const sphereZ = this.setUpSpherePosition(index, 'Z');

        spherePosContainer.appendChild(sphereX);
        spherePosContainer.appendChild(sphereY);
        spherePosContainer.appendChild(sphereZ);

        const spherePropertiesContainer = document.createElement("div");
        spherePropertiesContainer.id = `sphere-${index}-properties-container`;
        spherePropertiesContainer.style.display = "flex";

        const sphereRadius = document.createElement("input");
        sphereRadius.id = `sphere-${index}-radius`;
        sphereRadius.type = "range";
        sphereRadius.min = "0";
        sphereRadius.max = "1";
        sphereRadius.step = "0.01";
        sphereRadius.value = (this._scene.volumes[index] as Sphere).radius.toString();
        sphereRadius.style.width = "100%";
        sphereRadius.addEventListener("input", (e) => {
            (this._scene.volumes[index] as Sphere).radius = parseFloat((e.target as HTMLInputElement).value);
        });

        const sphereRadiusLabel = document.createElement("label");
        sphereRadiusLabel.htmlFor = `sphere-${index}-radius`;
        sphereRadiusLabel.innerText = `Radius`;

        const sphereRadiusContainer = document.createElement("div");
        sphereRadiusContainer.id = `sphere-${index}-radius-container`;

        sphereRadiusContainer.appendChild(sphereRadiusLabel);
        sphereRadiusContainer.appendChild(sphereRadius);


        const sphereColor = document.createElement("input");
        sphereColor.id = `sphere-${index}-color`;
        sphereColor.type = "color";
        sphereColor.value = vec4ToHex(this._scene.volumes[index].color);
        sphereColor.style.width = "100%";
        sphereColor.addEventListener("input", (e) => {
            this._scene.volumes[index].color = hexToVec4((e.target as HTMLInputElement).value);
        });

        const sphereColorLabel = document.createElement("label");
        sphereColorLabel.htmlFor = `sphere-${index}-color`;
        sphereColorLabel.innerText = `Color`;

        const sphereColorContainer = document.createElement("div");
        sphereColorContainer.id = `sphere-${index}-color-container`;

        sphereColorContainer.appendChild(sphereColorLabel);
        sphereColorContainer.appendChild(sphereColor);

        spherePropertiesContainer.appendChild(sphereRadiusContainer);
        spherePropertiesContainer.appendChild(sphereColorContainer);
        
        sphereContainer.appendChild(spherePosContainer);
        sphereContainer.appendChild(spherePropertiesContainer);

        return sphereContainer;
    }

    private setUpSpherePosition(index:number, axis: 'X' | 'Y' | 'Z'): HTMLInputElement
    {
        const spherePos = document.createElement("input");
        spherePos.id = `sphere-${index}-${axis.toLowerCase()}}`;
        spherePos.type = "number";
        spherePos.min = "-10";
        spherePos.max = "10";
        spherePos.step = "0.1";
        spherePos.value = this._scene.volumes[index].position[axis === 'X' ? 0 : axis === 'Y' ? 1 : 2].toString();
        spherePos.style.width = "100%";
        const axisIndex = axis === 'X' ? 0 : axis === 'Y' ? 1 : 2;
        spherePos.addEventListener("input", (e) => {
            this._scene.volumes[index].position[axisIndex] = parseFloat((e.target as HTMLInputElement).value);
        });

        return spherePos;
    }

    public get dom(): HTMLDivElement { return this._dom; }
}