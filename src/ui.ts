import { vec3, vec4 } from "gl-matrix";
import { hexToVec4, vec4ToHex } from "./utils";
import { Scene } from "./scene";

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
        lightDirLabel.style.position = "relative";
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
        for(let i = 0; i < this._scene.spheres.length; i++)
        {
            this.setUpSphere(i);
        }
    }

    private setUpSphere(index: number): void
    {
        const sphereContainer = document.createElement("div");
        sphereContainer.id = `sphere-${index}-container`;
        sphereContainer.style.position = "relative";
        sphereContainer.style.border = "1px solid black";

        const sphereLabel = document.createElement("label");
        sphereLabel.htmlFor = `sphere-${index}`;
        sphereLabel.innerText = `Sphere ${index}`;
        sphereLabel.style.position = "relative";
        sphereLabel.style.top = "0px";
        sphereLabel.style.left = "0px";
        sphereLabel.style.width = "100%";
        sphereLabel.style.textAlign = "center";
        sphereLabel.style.color = "white";
        sphereLabel.style.fontFamily = "sans-serif";
        sphereLabel.style.fontSize = "12px";
        sphereLabel.style.fontWeight = "bold";
        sphereLabel.style.textShadow = "0px 0px 1px black";

        sphereContainer.appendChild(sphereLabel);

        const sphereX = document.createElement("input");
        sphereX.id = `sphere-${index}-x`;
        sphereX.type = "range";
        sphereX.min = "-1";
        sphereX.max = "1";
        sphereX.step = "0.01";
        sphereX.value = "0";
        sphereX.style.width = "100%";
        sphereX.addEventListener("input", (e) => {
            this._scene.spheres[index].position[0] = parseFloat((e.target as HTMLInputElement).value);
        });

        const sphereY = document.createElement("input");
        sphereY.id = `sphere-${index}-y`;
        sphereY.type = "range";
        sphereY.min = "-1";
        sphereY.max = "1";
        sphereY.step = "0.01";
        sphereY.value = "0";
        sphereY.style.width = "100%";
        sphereY.addEventListener("input", (e) => {
            this._scene.spheres[index].position[1] = parseFloat((e.target as HTMLInputElement).value);
        });

        const sphereZ = document.createElement("input");
        sphereZ.id = `sphere-${index}-z`;
        sphereZ.type = "range";
        sphereZ.min = "-1";
        sphereZ.max = "1";
        sphereZ.step = "0.01";
        sphereZ.value = "0";
        sphereZ.style.width = "100%";
        sphereZ.addEventListener("input", (e) => {
            this._scene.spheres[index].position[2] = parseFloat((e.target as HTMLInputElement).value);
        });

        const sphereRadius = document.createElement("input");
        sphereRadius.id = `sphere-${index}-radius`;
        sphereRadius.type = "range";
        sphereRadius.min = "0";
        sphereRadius.max = "1";
        sphereRadius.step = "0.01";
        sphereRadius.value = "0.5";
        sphereRadius.style.width = "100%";
        sphereRadius.addEventListener("input", (e) => {
            this._scene.spheres[index].radius = parseFloat((e.target as HTMLInputElement).value);
        });

        const sphereColor = document.createElement("input");
        sphereColor.id = `sphere-${index}-color`;
        sphereColor.type = "color";
        sphereColor.value = vec4ToHex(this._scene.spheres[index].color);
        console.log(vec4ToHex(this._scene.spheres[index].color));
        sphereColor.style.width = "100%";
        sphereColor.addEventListener("input", (e) => {
            this._scene.spheres[index].color = hexToVec4((e.target as HTMLInputElement).value);
        });

        sphereContainer.appendChild(sphereX);
        sphereContainer.appendChild(sphereY);
        sphereContainer.appendChild(sphereZ);
        sphereContainer.appendChild(sphereRadius);
        sphereContainer.appendChild(sphereColor);

        this._dom.appendChild(sphereContainer);
    }

    public get dom(): HTMLDivElement { return this._dom; }
}