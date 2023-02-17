import { vec3 } from "gl-matrix";


export class ConfigurationComponent
{
    private _update: boolean = true;
    private _lightDir: vec3 = vec3.fromValues(0, 0, 0);
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

        const lightDirXDiv = document.createElement("div");
        lightDirXDiv.innerHTML = "X";
        lightDirDiv.appendChild(lightDirXDiv);
        const lightDirX = document.createElement("input");
        lightDirX.type = "range";
        lightDirX.min = "-1";
        lightDirX.max = "1";
        lightDirX.step = "0.1";
        lightDirX.value = this._lightDir[0].toString();
        lightDirX.onchange = (e) => {
            this._lightDir[0] = parseFloat((e.target as HTMLInputElement).value);
        };
        lightDirXDiv.appendChild(lightDirX);
        lightDirDiv.appendChild(lightDirXDiv);

        const lightDirYDiv = document.createElement("div");
        lightDirYDiv.innerHTML = "Y";
        lightDirDiv.appendChild(lightDirYDiv);
        const lightDirY = document.createElement("input");
        lightDirY.type = "range";
        lightDirY.min = "-1";
        lightDirY.max = "1";
        lightDirY.step = "0.1";
        lightDirY.value = this._lightDir[0].toString();
        lightDirY.onchange = (e) => {
            this._lightDir[1] = parseFloat((e.target as HTMLInputElement).value);
        };
        lightDirYDiv.appendChild(lightDirY);
        lightDirDiv.appendChild(lightDirYDiv);

        const lightDirZDiv = document.createElement("div");
        lightDirZDiv.innerHTML = "Z";
        lightDirDiv.appendChild(lightDirZDiv);
        const lightDirZ = document.createElement("input");
        lightDirZ.type = "range";
        lightDirZ.min = "-1";
        lightDirZ.max = "1";
        lightDirZ.step = "0.1";
        lightDirZ.defaultValue = "-1"
        lightDirZ.value = this._lightDir[0].toString();
        lightDirZ.onchange = (e) => {
            this._lightDir[2] = parseFloat((e.target as HTMLInputElement).value);
        };
        lightDirZDiv.appendChild(lightDirZ);
        lightDirDiv.appendChild(lightDirZDiv);

        this._root.appendChild(lightDirDiv);
    }

    public get dom(): HTMLDivElement { return this._dom; }
    public get update(): boolean { return this._update; }
    public get lightDir(): vec3 { return this._lightDir; }
}