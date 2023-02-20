import { vec3, vec4 } from "gl-matrix";
import { hexToVec4, vec4ToHex } from "./utils";
import { Scene } from "./scene";
import { Sphere } from "./sphere";

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
        lightDirContainer.style.position = "relative";
        lightDirContainer.style.border = "1px solid black";

        const lightDirLabel = document.createElement("label");
        lightDirLabel.htmlFor = "lightDir";
        lightDirLabel.innerText = "Light Direction";
        lightDirLabel.style.top = "0px";
        lightDirLabel.style.left = "0px";
        lightDirLabel.style.width = "100%";
        lightDirLabel.style.textAlign = "center";
        lightDirLabel.style.color = "white";
        lightDirLabel.style.fontFamily = "sans-serif";
        lightDirLabel.style.fontSize = "12px";
        lightDirLabel.style.fontWeight = "bold";
        lightDirLabel.style.textShadow = "0px 0px 1px black";
        
        lightDirContainer.appendChild(lightDirLabel);

        const lightDirX = document.createElement("input");
        lightDirX.id = "lightDirX";
        lightDirX.type = "range";
        lightDirX.min = "-1";
        lightDirX.max = "1";
        lightDirX.step = "0.01";
        lightDirX.value = "0";
        lightDirX.style.width = "100%";
        lightDirX.addEventListener("input", (e) => {
            this._scene.lightDir[0] = parseFloat((e.target as HTMLInputElement).value);
        });

        const lightDirY = document.createElement("input");
        lightDirY.id = "lightDirY";
        lightDirY.type = "range";
        lightDirY.min = "-1";
        lightDirY.max = "1";
        lightDirY.step = "0.01";
        lightDirY.value = "0";
        lightDirY.style.width = "100%";
        lightDirY.addEventListener("input", (e) => {
            this._scene.lightDir[1] = parseFloat((e.target as HTMLInputElement).value);
        });
        
        const lightDirZ = document.createElement("input");
        lightDirZ.id = "lightDirZ";
        lightDirZ.type = "range";
        lightDirZ.min = "-1";
        lightDirZ.max = "1";
        lightDirZ.step = "0.01";
        lightDirZ.value = "1";
        lightDirZ.style.width = "100%";
        lightDirZ.addEventListener("input", (e) => {
            this._scene.lightDir[2] = parseFloat((e.target as HTMLInputElement).value);
        });

        lightDirContainer.appendChild(lightDirX);
        lightDirContainer.appendChild(lightDirY);
        lightDirContainer.appendChild(lightDirZ);

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

        for(let i = 0; i < this._scene.spheres.length; i++)
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
        sphereRadius.value = this._scene.spheres[index].radius.toString();
        sphereRadius.style.width = "100%";
        sphereRadius.addEventListener("input", (e) => {
            this._scene.spheres[index].radius = parseFloat((e.target as HTMLInputElement).value);
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
        sphereColor.value = vec4ToHex(this._scene.spheres[index].color);
        sphereColor.style.width = "100%";
        sphereColor.addEventListener("input", (e) => {
            this._scene.spheres[index].color = hexToVec4((e.target as HTMLInputElement).value);
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
        spherePos.value = this._scene.spheres[index].position[axis === 'X' ? 0 : axis === 'Y' ? 1 : 2].toString();
        spherePos.style.width = "100%";
        const axisIndex = axis === 'X' ? 0 : axis === 'Y' ? 1 : 2;
        spherePos.addEventListener("input", (e) => {
            this._scene.spheres[index].position[axisIndex] = parseFloat((e.target as HTMLInputElement).value);
        });

        return spherePos;
    }

    public get dom(): HTMLDivElement { return this._dom; }
}