import { vec3, vec4 } from "gl-matrix";
import { hexToVec4 } from "./utils";

export class ConfigurationComponent
{
    private _update: boolean = true;
    private _lightDir: vec3 = vec3.fromValues(0, 0, -1);
    private _sphereRadius: number = 0.5;
    private _sphereColor: vec4 = vec4.fromValues(1, 1, 1, 1);
    private _root: HTMLDivElement;
    private _dom: HTMLDivElement;
    constructor()
    {        
        this._root = document.createElement("div");

        const title = document.createElement("h2");
        title.innerHTML = "Settings";
        this._root.appendChild(title);

        this.setUpdate();
        this.setUpDirectionalLight();
        this.setUpSphere();

        this._dom = this._root;
    }

    private setUpdate()
    {
        const updateDiv = document.createElement("div");
        const updateTitle = document.createElement("h4");
        updateTitle.innerHTML = "Update";
        updateDiv.appendChild(updateTitle);
        const update = document.createElement("input");
        update.type = "checkbox";
        update.checked = this._update;
        update.onchange = (e) => {
            this._update = (e.target as HTMLInputElement).checked;
        };
        updateDiv.appendChild(update);
        this._root.appendChild(updateDiv);
    }

    private setUpDirectionalLight()
    {
        const lightDirDiv = document.createElement("div");

        const lightDirTitle = document.createElement("h4");
        lightDirTitle.innerHTML = "Directional light";
        lightDirDiv.appendChild(lightDirTitle);

        const lightDirXDiv = this.createLightDirSlider("X");
        lightDirDiv.appendChild(lightDirXDiv);

        const lightDirYDiv = this.createLightDirSlider("Y");
        lightDirDiv.appendChild(lightDirYDiv);

        const lightDirZDiv = this.createLightDirSlider("Z");
        lightDirDiv.appendChild(lightDirZDiv);

        this._root.appendChild(lightDirDiv);
    }

    private createLightDirSlider(axis: 'X' | 'Y' | 'Z'): HTMLDivElement
    {
        const out = document.createElement("div");
        out.innerHTML = axis;
        const lightDir = document.createElement("input");
        lightDir.type = "range";
        lightDir.min = "-1";
        lightDir.max = "1";
        lightDir.step = "0.1";
        
        const index = axis === 'X' ? 0 : axis === 'Y' ? 1 : 2;
        lightDir.value = this._lightDir[index].toString();
        lightDir.onchange = (e) => {
            this._lightDir[index] = parseFloat((e.target as HTMLInputElement).value);
        };
        out.appendChild(lightDir);
        return out;
    }

    private setUpSphere()
    {
        const sphereDiv = document.createElement("div");
        const sphereTitle = document.createElement("h4");
        sphereTitle.innerHTML = "Sphere Properties";
        sphereDiv.appendChild(sphereTitle);

        const sphereRadius = document.createElement("input");
        const sphereRadiusLabel = document.createElement("label");
        sphereRadiusLabel.innerHTML = "Radius";
        sphereDiv.appendChild(sphereRadiusLabel);

        sphereRadius.type = "range";
        sphereRadius.min = "0";
        sphereRadius.max = "1";
        sphereRadius.step = "0.05";
        sphereRadius.defaultValue = "0.5";
        sphereRadius.onchange = (e) => {
            this._sphereRadius = parseFloat((e.target as HTMLInputElement).value);
        };
        sphereDiv.appendChild(sphereRadius);

        const sphereColor = document.createElement("input");
        const sphereColorLabel = document.createElement("label");
        sphereColorLabel.innerHTML = "Color";
        sphereDiv.appendChild(sphereColorLabel);

        sphereColor.type = "color";
        sphereColor.defaultValue = "#ffffff";
        sphereColor.onchange = (e) => {
            this._sphereColor = hexToVec4((e.target as HTMLInputElement).value);
        };
        sphereDiv.appendChild(sphereColor);

        this._root.appendChild(sphereDiv);
    }

    public get dom(): HTMLDivElement { return this._dom; }
    public get update(): boolean { return this._update; }
    public get lightDir(): vec3 { return this._lightDir; }
    public get sphereRadius(): number { return this._sphereRadius; }
    public get sphereColor(): vec4 { return this._sphereColor; }
}