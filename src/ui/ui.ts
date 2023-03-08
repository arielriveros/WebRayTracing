import { vec3, vec4 } from "gl-matrix";
import { hexToVec4, vec4ToHex } from "../utils";
import Scene from "../scene/scene";
import Renderer from "../renderer";
import RenderObject from "../objects/renderObject";
import * as OBJECTS from "../objects/objects";

export class UserInterface
{
    private _appContainer: HTMLDivElement;
    private _renderer!: Renderer;
    private _scene!: Scene
    private _dom: HTMLDivElement;

    constructor(appContainer: HTMLDivElement)
    {
        this._appContainer = appContainer;
        const uiContainer = document.createElement("div");
        uiContainer.id = "ui-container";
        uiContainer.style.backgroundColor = "#333333";
        uiContainer.style.color = "white";
        uiContainer.style.fontFamily = "sans-serif";
        uiContainer.style.fontSize = "12px";
        uiContainer.style.fontWeight = "bold";
        uiContainer.style.textShadow = "0px 0px 1px black";
        uiContainer.style.padding = "10px";
        uiContainer.style.position = "fixed";
        uiContainer.style.left = appContainer.offsetWidth + "px";
        uiContainer.style.width = "150px";
        uiContainer.style.zIndex = "100";


        this._dom = uiContainer;
        this._appContainer.appendChild(uiContainer);
    }

    public start(renderer: Renderer): void
    {
        this._renderer = renderer;
        this._scene = renderer.scene;
        this.setUpRenderSettings();
        this.setUpDirectionalLight();
        this.setUpBackgroundColor();
        this.setUpAddButtons();

        let selectedObjectContainer = document.createElement("selected-object-container") as HTMLDivElement;
        selectedObjectContainer.id = "selected-object-container";
        this._dom.appendChild(selectedObjectContainer);

        let objectsListContainer = document.createElement("objects-list-container") as HTMLDivElement;
        objectsListContainer.id = "objects-list-container";
        this._dom.appendChild(objectsListContainer);
    }

    public setSelectedObject(object: RenderObject | null)
    {
        if(document.getElementById("selected-object") !== null)
            document.getElementById("selected-object")?.remove();

        let currentSelectedObjectContainer = document.createElement("selected-object") as HTMLDivElement;
        currentSelectedObjectContainer.id = "selected-object";

        if(object === null)
            return;

        let index = this._scene.objects.indexOf(object);
        switch(object.type)
        {
            case "sphere":
                currentSelectedObjectContainer.appendChild(this.setUpSphere(index));
                break;
            case "cube":
                currentSelectedObjectContainer.appendChild(this.setUpCube(index));
                break;
            case "plane":
                currentSelectedObjectContainer.appendChild(this.setUpPlane(index));
        }

        this._appContainer.appendChild(currentSelectedObjectContainer);
        document.getElementById("selected-object-container")?.appendChild(currentSelectedObjectContainer);
    }
    
    private setUpRenderSettings(): void
    {
        this.setupLayers();
        this.setUpUpdateInterval();
        this.setUpMaxBounces();
        this.setUpShadowBias();
    }

    private setupLayers(): void
    {
        const layersContainer = document.createElement("div");
        layersContainer.id = "layers-container";

        const layersLabel = document.createElement("label");
        layersLabel.htmlFor = "layers-container";
        layersLabel.innerText = "Layers: ";

        layersContainer.appendChild(layersLabel);

        const albedo = document.createElement("input");
        albedo.id = "albedo";
        albedo.type = "checkbox";
        albedo.checked = this._renderer.diffuseLighting;
        albedo.addEventListener("input", (e) => {
            this._renderer.diffuseLighting = (e.target as HTMLInputElement).checked;
        });

        const albedoLabel = document.createElement("label");
        albedoLabel.htmlFor = "albedo";
        albedoLabel.innerText = "Albedo";

        layersContainer.appendChild(albedo);
        layersContainer.appendChild(albedoLabel);

        const shadowsInput = document.createElement("input");
        shadowsInput.id = "shadows";
        shadowsInput.type = "checkbox";
        shadowsInput.checked = this._renderer.directionalShadows;
        shadowsInput.addEventListener("input", (e) => {
            this._renderer.directionalShadows = (e.target as HTMLInputElement).checked;
        });

        const shadowsLabel = document.createElement("label");
        shadowsLabel.htmlFor = "shadows";
        shadowsLabel.innerText = "Shadows";

        layersContainer.appendChild(shadowsInput);
        layersContainer.appendChild(shadowsLabel);

        const reflectionsInput = document.createElement("input");
        reflectionsInput.id = "reflections";
        reflectionsInput.type = "checkbox";
        reflectionsInput.checked = this._renderer.reflections;
        reflectionsInput.addEventListener("input", (e) => {
            this._renderer.reflections = (e.target as HTMLInputElement).checked;
        });

        const reflectionsLabel = document.createElement("label");
        reflectionsLabel.htmlFor = "reflections";
        reflectionsLabel.innerText = "Reflections";

        layersContainer.appendChild(reflectionsInput);
        layersContainer.appendChild(reflectionsLabel);
        
        const aoInput = document.createElement("input");
        aoInput.id = "ao";
        aoInput.type = "checkbox";
        aoInput.checked = this._renderer.ambientOcclusion;
        aoInput.addEventListener("input", (e) => {
            this._renderer.ambientOcclusion = (e.target as HTMLInputElement).checked;
        });

        const aoLabel = document.createElement("label");
        aoLabel.htmlFor = "ao";
        aoLabel.innerText = "Ambient Occlusion";

        layersContainer.appendChild(aoInput);
        layersContainer.appendChild(aoLabel);
        
        this._dom.appendChild(layersContainer);
    }

    private setUpUpdateInterval(): void
    {
        const updateIntervalContainer = document.createElement("div");
        updateIntervalContainer.id = "update-interval-container";

        const updateIntervalLabel = document.createElement("label");
        updateIntervalLabel.htmlFor = "updateInterval";
        updateIntervalLabel.innerText = "Skip Frames";

        updateIntervalContainer.appendChild(updateIntervalLabel);

        const updateIntervalInput = document.createElement("input");
        updateIntervalInput.id = "updateInterval";
        updateIntervalInput.type = "number";
        updateIntervalInput.min = "0";
        updateIntervalInput.max = "60";
        updateIntervalInput.value = this._renderer.updateInterval.toString();
        updateIntervalInput.addEventListener("input", (e) => {
            this._renderer.updateInterval = (e.target as HTMLInputElement).valueAsNumber;
        });

        updateIntervalContainer.appendChild(updateIntervalInput);

        this._dom.appendChild(updateIntervalContainer);
    }

    private setUpMaxBounces(): void
    {
        const maxBouncesContainer = document.createElement("div");
        maxBouncesContainer.id = "max-bounces-container";

        const maxBouncesLabel = document.createElement("label");
        maxBouncesLabel.htmlFor = "maxBounces";
        maxBouncesLabel.innerText = "Max Bounces";

        maxBouncesContainer.appendChild(maxBouncesLabel);

        const maxBouncesInput = document.createElement("input");
        maxBouncesInput.id = "maxBounces";
        maxBouncesInput.type = "number";
        maxBouncesInput.min = "0";
        maxBouncesInput.max = "3";
        maxBouncesInput.value = "1";
        maxBouncesInput.addEventListener("input", (e) => {
            this._renderer.bounceLimit = (e.target as HTMLInputElement).valueAsNumber;
        });

        maxBouncesContainer.appendChild(maxBouncesInput);

        this._dom.appendChild(maxBouncesContainer);
    }

    private setUpShadowBias(): void
    {
        const shadowBiasContainer = document.createElement("div");
        shadowBiasContainer.id = "shadow-bias-container";

        const shadowBiasLabel = document.createElement("label");
        shadowBiasLabel.htmlFor = "shadowBias";
        shadowBiasLabel.innerText = "Shadow Bias";

        shadowBiasContainer.appendChild(shadowBiasLabel);

        const shadowBiasInput = document.createElement("input");
        shadowBiasInput.id = "shadowBias";
        shadowBiasInput.type = "number";
        shadowBiasInput.min = "0";
        shadowBiasInput.max = "0.2";
        shadowBiasInput.step = "0.001";
        shadowBiasInput.value = this._renderer.shadowBias.toString();
        shadowBiasInput.addEventListener("input", (e) => {
            this._renderer.shadowBias = (e.target as HTMLInputElement).valueAsNumber;
        });

        shadowBiasContainer.appendChild(shadowBiasInput);

        this._dom.appendChild(shadowBiasContainer);
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
        lightDirXRotation.value = this._scene.directionalLight.theta.toString();
        lightDirXRotation.addEventListener("input", (e) => {
            this._scene.directionalLight.phi = (e.target as HTMLInputElement).valueAsNumber * Math.PI / 180;
        });


        const lightDirYRotation = document.createElement("input");
        lightDirYRotation.id = "lightDirYRotation";
        lightDirYRotation.type = "range";
        lightDirYRotation.min = "-90";
        lightDirYRotation.max = "90";
        lightDirYRotation.value = this._scene.directionalLight.theta.toString();
        lightDirYRotation.addEventListener("input", (e) => {
            this._scene.directionalLight.theta = (e.target as HTMLInputElement).valueAsNumber * Math.PI / 180;
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

    private setUpAddButtons(): void
    {
        let objectsContainer = document.createElement("div");

        const addSphereButton = document.createElement("button");
        addSphereButton.innerText = "Add Sphere";
        addSphereButton.addEventListener("click", () => {
            this._scene.addObject(new OBJECTS.Sphere({radius: 0.25}));
        });

        objectsContainer.appendChild(addSphereButton);

        const addCubeButton = document.createElement("button");
        addCubeButton.innerText = "Add Cube";
        addCubeButton.addEventListener("click", () => {
            this._scene.addObject(new OBJECTS.Cube({size: 0.25}));
        });

        objectsContainer.appendChild(addCubeButton);

        this._dom.appendChild(objectsContainer);
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

        const spherePropertiesContainer = document.createElement("div");
        spherePropertiesContainer.id = `sphere-${index}-properties-container`;
        spherePropertiesContainer.style.display = "flex";

        const sphereRadius = document.createElement("input");
        sphereRadius.id = `sphere-${index}-radius`;
        sphereRadius.type = "range";
        sphereRadius.min = "0";
        sphereRadius.max = "1";
        sphereRadius.step = "0.01";
        sphereRadius.value = (this._scene.objects[index] as OBJECTS.Sphere).radius?.toString();
        sphereRadius.style.width = "100%";
        sphereRadius.addEventListener("input", (e) => {
            (this._scene.objects[index] as OBJECTS.Sphere).radius = parseFloat((e.target as HTMLInputElement).value);
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
        sphereColor.value = vec4ToHex(this._scene.objects[index].color);
        sphereColor.style.width = "100%";
        sphereColor.addEventListener("input", (e) => {
            this._scene.objects[index].color = hexToVec4((e.target as HTMLInputElement).value);
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

        sphereContainer.appendChild(spherePropertiesContainer);

        return sphereContainer;
    }

    private setUpCube(index: number): HTMLDivElement
    {
        const cubeContainer = document.createElement("div");
        cubeContainer.id = `cube-${index}-container`;
        cubeContainer.style.position = "relative";
        cubeContainer.style.border = "1px solid black";
        cubeContainer.style.padding = "5px";

        const cubeLabel = document.createElement("label");
        cubeLabel.htmlFor = `cube-${index}`;
        cubeLabel.innerText = `Cube ${index}`;

        cubeContainer.appendChild(cubeLabel);

        const cubePropertiesContainer = document.createElement("div");
        cubePropertiesContainer.id = `cube-${index}-properties-container`;
        cubePropertiesContainer.style.display = "flex";

        const cubeSize = document.createElement("input");
        cubeSize.id = `cube-${index}-size`;
        cubeSize.type = "range";
        cubeSize.min = "0";
        cubeSize.max = "1";
        cubeSize.step = "0.01";
        cubeSize.value = (this._scene.objects[index] as OBJECTS.Cube).size?.toString();
        cubeSize.style.width = "100%";
        cubeSize.addEventListener("input", (e) => {
            (this._scene.objects[index] as OBJECTS.Cube).size = parseFloat((e.target as HTMLInputElement).value);
        });

        const cubeSizeLabel = document.createElement("label");
        cubeSizeLabel.htmlFor = `cube-${index}-size`;
        cubeSizeLabel.innerText = `Size`;

        const cubeSizeContainer = document.createElement("div");
        cubeSizeContainer.id = `cube-${index}-size-container`;

        cubeSizeContainer.appendChild(cubeSizeLabel);
        cubeSizeContainer.appendChild(cubeSize);

        const cubeColor = document.createElement("input");
        cubeColor.id = `cube-${index}-color`;
        cubeColor.type = "color";
        cubeColor.value = vec4ToHex(this._scene.objects[index].color);
        cubeColor.style.width = "100%";
        cubeColor.addEventListener("input", (e) => {
            this._scene.objects[index].color = hexToVec4((e.target as HTMLInputElement).value);
        });

        const cubeColorLabel = document.createElement("label");
        cubeColorLabel.htmlFor = `cube-${index}-color`;
        cubeColorLabel.innerText = `Color`;

        const cubeColorContainer = document.createElement("div");
        cubeColorContainer.id = `cube-${index}-color-container`;

        cubeColorContainer.appendChild(cubeColorLabel);
        cubeColorContainer.appendChild(cubeColor);

        cubePropertiesContainer.appendChild(cubeSizeContainer);
        cubePropertiesContainer.appendChild(cubeColorContainer);

        cubeContainer.appendChild(cubePropertiesContainer);

        return cubeContainer;
    }

    private setUpPlane(index: number): HTMLDivElement
    {
        const planeContainer = document.createElement("div");
        planeContainer.id = `plane-${index}-container`;
        planeContainer.style.position = "relative";
        planeContainer.style.border = "1px solid black";
        planeContainer.style.padding = "5px";

        const planeLabel = document.createElement("label");
        planeLabel.htmlFor = `plane-${index}`;
        planeLabel.innerText = `plane ${index}`;

        planeContainer.appendChild(planeLabel);

        const planePropertiesContainer = document.createElement("div");
        planePropertiesContainer.id = `plane-${index}-properties-container`;
        planePropertiesContainer.style.display = "flex";

        const planeSize = document.createElement("input");
        planeSize.id = `plane-${index}-size`;
        planeSize.type = "range";
        planeSize.min = "0";
        planeSize.max = "10";
        planeSize.step = "0.5";
        planeSize.value = (this._scene.objects[index] as OBJECTS.Plane).size?.toString();
        planeSize.style.width = "100%";
        planeSize.addEventListener("input", (e) => {
            (this._scene.objects[index] as OBJECTS.Plane).size = parseFloat((e.target as HTMLInputElement).value);
        });
        
        const planeSizeLabel = document.createElement("label");
        planeSizeLabel.htmlFor = `plane-${index}-size`;
        planeSizeLabel.innerText = `Size`;

        const planeSizeContainer = document.createElement("div");
        planeSizeContainer.id = `plane-${index}-size-container`;

        planeSizeContainer.appendChild(planeSizeLabel);
        planeSizeContainer.appendChild(planeSize);

        const planeColor = document.createElement("input");
        planeColor.id = `plane-${index}-color`;
        planeColor.type = "color";
        planeColor.value = vec4ToHex(this._scene.objects[index].color);
        planeColor.style.width = "100%";
        planeColor.addEventListener("input", (e) => {
            this._scene.objects[index].color = hexToVec4((e.target as HTMLInputElement).value);
        });

        const planeColorLabel = document.createElement("label");
        planeColorLabel.htmlFor = `plane-${index}-color`;
        planeColorLabel.innerText = `Color`;

        const planeColorContainer = document.createElement("div");
        planeColorContainer.id = `plane-${index}-color-container`;

        planeColorContainer.appendChild(planeColorLabel);
        planeColorContainer.appendChild(planeColor);

        planePropertiesContainer.appendChild(planeSizeContainer);
        planePropertiesContainer.appendChild(planeColorContainer);

        planeContainer.appendChild(planePropertiesContainer);

        return planeContainer;
    }

    public get dom(): HTMLDivElement { return this._dom; }
}