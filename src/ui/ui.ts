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
                break;
            case "circle":
                currentSelectedObjectContainer.appendChild(this.setUpCircle(index));
                break;
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

        layersContainer.appendChild(document.createElement("br"));

        const material = document.createElement("input");
        material.id = "material";
        material.type = "checkbox";
        material.checked = this._renderer.diffuseLighting;
        material.addEventListener("input", (e) => {
            this._renderer.diffuseLighting = (e.target as HTMLInputElement).checked;
        });

        const materialLabel = document.createElement("label");
        materialLabel.innerText = "Material";

        layersContainer.appendChild(material);
        layersContainer.appendChild(materialLabel);
        layersContainer.appendChild(document.createElement("br"));

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
        layersContainer.appendChild(document.createElement("br"));

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
        layersContainer.appendChild(document.createElement("br"));
        
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
        layersContainer.appendChild(document.createElement("br"));

        const acctumulation = document.createElement("input");
        acctumulation.id = "acctumulation";
        acctumulation.type = "checkbox";
        acctumulation.checked = this._renderer.accumulate;
        acctumulation.addEventListener("input", (e) => {
            this._renderer.accumulate = (e.target as HTMLInputElement).checked;
        });

        const acctumulationLabel = document.createElement("label");
        acctumulationLabel.htmlFor = "acctumulation";
        acctumulationLabel.innerText = "Accumulation";

        layersContainer.appendChild(acctumulation);
        layersContainer.appendChild(acctumulationLabel);
        layersContainer.appendChild(document.createElement("br"));

        const resetAccumulation = document.createElement("button");
        resetAccumulation.innerText = "Reset Accumulation";
        resetAccumulation.addEventListener("click", () => {
            this._renderer.resetFrameIndex();
        });

        layersContainer.appendChild(resetAccumulation);
        


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
        maxBouncesInput.value = this._renderer.bounceLimit.toString();
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

        const addPlaneButton = document.createElement("button");
        addPlaneButton.innerText = "Add Plane";
        addPlaneButton.addEventListener("click", () => {
            this._scene.addObject(new OBJECTS.Plane({size: 0.5}));
        });

        objectsContainer.appendChild(addPlaneButton);

        const addCircleButton = document.createElement("button");
        addCircleButton.innerText = "Add Circle";
        addCircleButton.addEventListener("click", () => {
            this._scene.addObject(new OBJECTS.Circle({radius: 0.5}));
        });

        objectsContainer.appendChild(addCircleButton);

        this._dom.appendChild(objectsContainer);
    }

    private setUpSphere(index: number): HTMLDivElement
    {
        const sphereContainer = document.createElement("div");
        sphereContainer.style.position = "relative";
        sphereContainer.style.border = "1px solid black";
        sphereContainer.style.padding = "5px";

        const sphereLabel = document.createElement("label");
        sphereLabel.htmlFor = `sphere-${index}`;
        sphereLabel.innerText = `Sphere ${index}`;

        sphereContainer.appendChild(sphereLabel);

        const spherePropertiesContainer = document.createElement("div");

        const sphereRadius = document.createElement("input");
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

        sphereRadiusContainer.appendChild(sphereRadiusLabel);
        sphereRadiusContainer.appendChild(sphereRadius);

        spherePropertiesContainer.appendChild(sphereRadiusContainer);
        spherePropertiesContainer.appendChild(this.setUpMaterial(index));

        sphereContainer.appendChild(spherePropertiesContainer);

        return sphereContainer;
    }

    private setUpCube(index: number): HTMLDivElement
    {
        const cubeContainer = document.createElement("div");
        cubeContainer.style.position = "relative";
        cubeContainer.style.border = "1px solid black";
        cubeContainer.style.padding = "5px";

        const cubeLabel = document.createElement("label");
        cubeLabel.htmlFor = `cube-${index}`;
        cubeLabel.innerText = `Cube ${index}`;

        cubeContainer.appendChild(cubeLabel);

        const cubePropertiesContainer = document.createElement("div");

        const cubeSize = document.createElement("input");
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

        cubeSizeContainer.appendChild(cubeSizeLabel);
        cubeSizeContainer.appendChild(cubeSize);

        cubePropertiesContainer.appendChild(cubeSizeContainer);
        cubePropertiesContainer.appendChild(this.setUpMaterial(index));

        cubeContainer.appendChild(cubePropertiesContainer);

        return cubeContainer;
    }

    private setUpPlane(index: number): HTMLDivElement
    {
        const planeContainer = document.createElement("div");
        planeContainer.style.position = "relative";
        planeContainer.style.border = "1px solid black";
        planeContainer.style.padding = "5px";

        const planeLabel = document.createElement("label");
        planeLabel.htmlFor = `plane-${index}`;
        planeLabel.innerText = `plane ${index}`;

        planeContainer.appendChild(planeLabel);

        const planePropertiesContainer = document.createElement("div");

        const planeSize = document.createElement("input");
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

        planeSizeContainer.appendChild(planeSizeLabel);
        planeSizeContainer.appendChild(planeSize);

        planePropertiesContainer.appendChild(planeSizeContainer);
        planePropertiesContainer.appendChild(this.setUpMaterial(index));

        planeContainer.appendChild(planePropertiesContainer);

        return planeContainer;
    }

    private setUpCircle(index: number): HTMLDivElement
    {
        const circleContainer = document.createElement("div");
        circleContainer.style.position = "relative";
        circleContainer.style.border = "1px solid black";
        circleContainer.style.padding = "5px";

        const circleLabel = document.createElement("label");
        circleLabel.htmlFor = `circle-${index}`;
        circleLabel.innerText = `Circle ${index}`;

        circleContainer.appendChild(circleLabel);

        const circlePropertiesContainer = document.createElement("div");

        const circleRadius = document.createElement("input");
        circleRadius.type = "range";
        circleRadius.min = "0";
        circleRadius.max = "1";
        circleRadius.step = "0.01";
        circleRadius.value = (this._scene.objects[index] as OBJECTS.Circle).radius?.toString();
        circleRadius.style.width = "100%";
        circleRadius.addEventListener("input", (e) => {
            (this._scene.objects[index] as OBJECTS.Circle).radius = parseFloat((e.target as HTMLInputElement).value);
        });

        const circleRadiusLabel = document.createElement("label");
        circleRadiusLabel.htmlFor = `circle-${index}-radius`;
        circleRadiusLabel.innerText = `Radius`;

        const circleRadiusContainer = document.createElement("div");

        circleRadiusContainer.appendChild(circleRadiusLabel);
        circleRadiusContainer.appendChild(circleRadius);

        circlePropertiesContainer.appendChild(circleRadiusContainer);
        circlePropertiesContainer.appendChild(this.setUpMaterial(index));

        circleContainer.appendChild(circlePropertiesContainer);


        return circleContainer;
    }

    private setUpMaterial(index: number): HTMLDivElement
    {
        const materialContainer = document.createElement("div");
        materialContainer.style.position = "relative";

        const materialLabel = document.createElement("label");
        materialLabel.innerText = `Material`;

        materialContainer.appendChild(materialLabel);

        const materialPropertiesContainer = document.createElement("div");
        
        const materialColor = document.createElement("input");
        materialColor.type = "color";
        materialColor.value = vec4ToHex(this._scene.objects[index].material.baseColor);
        materialColor.style.width = "100%";
        materialColor.addEventListener("input", (e) => {
            this._scene.objects[index].material.baseColor = hexToVec4((e.target as HTMLInputElement).value);
        });

        const materialColorLabel = document.createElement("label");
        materialColorLabel.htmlFor = `material-${index}-color`;
        materialColorLabel.innerText = `Color`;

        const materialColorContainer = document.createElement("div");

        materialColorContainer.appendChild(materialColorLabel);
        materialColorContainer.appendChild(materialColor);

        const materialRoughness = document.createElement("input");
        materialRoughness.type = "range";
        materialRoughness.min = "0";
        materialRoughness.max = "1";
        materialRoughness.step = "0.01";
        materialRoughness.value = this._scene.objects[index].material.roughness.toString();
        materialRoughness.style.width = "100%";
        materialRoughness.addEventListener("input", (e) => {
            this._scene.objects[index].material.roughness = parseFloat((e.target as HTMLInputElement).value);
        });

        const materialRoughnessLabel = document.createElement("label");
        materialRoughnessLabel.htmlFor = `material-${index}-roughness`;
        materialRoughnessLabel.innerText = `Roughness`;

        const materialRoughnessContainer = document.createElement("div");

        materialRoughnessContainer.appendChild(materialRoughnessLabel);
        materialRoughnessContainer.appendChild(materialRoughness);

        const materialMetallic = document.createElement("input");
        materialMetallic.type = "range";
        materialMetallic.min = "0";
        materialMetallic.max = "1";
        materialMetallic.step = "0.01";
        materialMetallic.value = this._scene.objects[index].material.metallic.toString();
        materialMetallic.style.width = "100%";
        materialMetallic.addEventListener("input", (e) => {
            this._scene.objects[index].material.metallic = parseFloat((e.target as HTMLInputElement).value);
        });

        const materialMetallicLabel = document.createElement("label");
        materialMetallicLabel.htmlFor = `material-${index}-metallic`;
        materialMetallicLabel.innerText = `Metallic`;

        const materialMetallicContainer = document.createElement("div");

        materialMetallicContainer.appendChild(materialMetallicLabel);
        materialMetallicContainer.appendChild(materialMetallic);

        materialPropertiesContainer.appendChild(materialColorContainer);
        materialPropertiesContainer.appendChild(materialRoughnessContainer);
        materialPropertiesContainer.appendChild(materialMetallicContainer);

        materialContainer.appendChild(materialPropertiesContainer);

        return materialContainer;
    }
    public get dom(): HTMLDivElement { return this._dom; }
}