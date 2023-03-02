import { vec3, vec4 } from "gl-matrix";
import { hexToVec4, vec4ToHex } from "./utils";
import { Scene } from "./scene";
import { Sphere } from "./objects/volumes/sphere";
import { Cube } from "./objects/volumes/cube";
import { Plane } from "./objects/planes/plane";
import { Render } from "./renderer";

export class UserInterface
{
    private _renderer!: Render;
    private _scene!: Scene
    private _dom: HTMLDivElement;

    constructor(scene: Scene)
    {
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

    public start(renderer: Render): void
    {
        this._renderer = renderer;
        this._scene = renderer.scene;
        this.setUpRenderSettings();
        this.setUpDirectionalLight();
        this.setUpBackgroundColor();
        this.setUpObjects();
    }

    private setUpRenderSettings(): void
    {
        this.setUpMaxBounces();
        this.setUpShadowBias();
    }

    private setUpMaxBounces(): void
    {
        const maxBouncesContainer = document.createElement("div");
        maxBouncesContainer.id = "max-bounces-container";
        maxBouncesContainer.style.border = "1px solid black";

        const maxBouncesLabel = document.createElement("label");
        maxBouncesLabel.htmlFor = "maxBounces";
        maxBouncesLabel.innerText = "Max Bounces";

        maxBouncesContainer.appendChild(maxBouncesLabel);

        const breakLine = document.createElement("br");
        maxBouncesContainer.appendChild(breakLine);

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
        shadowBiasContainer.style.border = "1px solid black";

        const shadowBiasLabel = document.createElement("label");
        shadowBiasLabel.htmlFor = "shadowBias";
        shadowBiasLabel.innerText = "Shadow Bias";

        shadowBiasContainer.appendChild(shadowBiasLabel);

        const breakLine = document.createElement("br");
        shadowBiasContainer.appendChild(breakLine);

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

    private setUpObjects(): void
    {
        if(document.getElementById("objects-container") != null)
            document.getElementById("objects-container")?.remove();

        const objectsContainer = document.createElement("div");
        objectsContainer.id = "objects-container";

        const objectsLabel = document.createElement("label");
        objectsLabel.htmlFor = "objects";
        objectsLabel.innerText = "Objects";
        objectsContainer.appendChild(objectsLabel);

        for(let i = 0; i < this._scene.objects.length; i++)
        {
            switch(this._scene.objects[i].type)
            {
                case "sphere":
                    let sphereContainer = this.setUpSphere(i);
                    objectsContainer.appendChild(sphereContainer);
                    break;
                case "cube":
                    let cubeContainer = this.setUpCube(i);
                    objectsContainer.appendChild(cubeContainer);
                    break;
                case "plane":
                    let planeContainer = this.setUpPlane(i);
                    objectsContainer.appendChild(planeContainer);
                    break;
                default:
                    break;
            }
        }

        this.setupAddButtons(objectsContainer);
        
    }

    private setupAddButtons(objectsContainer: HTMLDivElement ): void
    {
        const addSphereButton = document.createElement("button");
        addSphereButton.id = "add-sphere-button";
        addSphereButton.innerText = "Add Sphere";
        addSphereButton.addEventListener("click", () => {
            this._scene.addObject(new Sphere({radius: 0.25}));
            this.setUpObjects();
        });

        objectsContainer.appendChild(addSphereButton);

        const addRandomSphereButton = document.createElement("button");
        addRandomSphereButton.id = "add-random-sphere-button";
        addRandomSphereButton.innerText = "Add Random Sphere";
        addRandomSphereButton.addEventListener("click", () => {
            this._scene.addObject(new Sphere({
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
            this.setUpObjects();
        });

        objectsContainer.appendChild(addRandomSphereButton);

        const addCubeButton = document.createElement("button");
        addCubeButton.id = "add-cube-button";
        addCubeButton.innerText = "Add Cube";
        addCubeButton.addEventListener("click", () => {
            this._scene.addObject(new Cube({size: 0.25}));
            this.setUpObjects();
        });

        objectsContainer.appendChild(addCubeButton);

        const addRandomCubeButton = document.createElement("button");
        addRandomCubeButton.id = "add-random-cube-button";
        addRandomCubeButton.innerText = "Add Random Cube";
        addRandomCubeButton.addEventListener("click", () => {
            this._scene.addObject(new Cube({
                position: vec3.fromValues(
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1
                ),
                size: Math.random() * 0.5 + 0.5,
                color: vec4.fromValues(
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    1
                )
            }));
            this.setUpObjects();
        });

        objectsContainer.appendChild(addRandomCubeButton);

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

        const sphereRemoveButton = document.createElement("button");
        sphereRemoveButton.id = `sphere-${index}-remove-button`;
        sphereRemoveButton.innerText = "Remove";
        sphereRemoveButton.addEventListener("click", () => {
            this._scene.removeObject(index);
            this.setUpObjects();
        });

        sphereContainer.appendChild(sphereRemoveButton);

        const spherePosContainer = document.createElement("div");
        spherePosContainer.id = `sphere-${index}-pos-container`;
        spherePosContainer.style.display = "flex";

        const spherePosLabel = document.createElement("label");
        spherePosLabel.htmlFor = `sphere-${index}-pos`;
        spherePosLabel.innerText = `Position`;

        spherePosContainer.appendChild(spherePosLabel);
        const sphereX = this.setUpPosition(index, 'X', 'sphere');
        const sphereY = this.setUpPosition(index, 'Y', 'sphere');
        const sphereZ = this.setUpPosition(index, 'Z', 'sphere');

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
        sphereRadius.value = (this._scene.objects[index] as Sphere).radius?.toString();
        sphereRadius.style.width = "100%";
        sphereRadius.addEventListener("input", (e) => {
            (this._scene.objects[index] as Sphere).radius = parseFloat((e.target as HTMLInputElement).value);
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
        
        sphereContainer.appendChild(spherePosContainer);
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
        cubeLabel.innerText = `cube ${index}`;

        cubeContainer.appendChild(cubeLabel);

        const cubeRemoveButton = document.createElement("button");
        cubeRemoveButton.id = `cube-${index}-remove-button`;
        cubeRemoveButton.innerText = "Remove";
        cubeRemoveButton.addEventListener("click", () => {
            this._scene.removeObject(index);
            this.setUpObjects();
        });

        cubeContainer.appendChild(cubeRemoveButton);

        const cubePosContainer = document.createElement("div");
        cubePosContainer.id = `cube-${index}-pos-container`;
        cubePosContainer.style.display = "flex";

        const cubePosLabel = document.createElement("label");
        cubePosLabel.htmlFor = `cube-${index}-pos`;
        cubePosLabel.innerText = `Position`;

        cubePosContainer.appendChild(cubePosLabel);
        const cubeX = this.setUpPosition(index, 'X', 'cube');
        const cubeY = this.setUpPosition(index, 'Y', 'cube');
        const cubeZ = this.setUpPosition(index, 'Z', 'cube');

        cubePosContainer.appendChild(cubeX);
        cubePosContainer.appendChild(cubeY);
        cubePosContainer.appendChild(cubeZ);

        const cubePropertiesContainer = document.createElement("div");
        cubePropertiesContainer.id = `cube-${index}-properties-container`;
        cubePropertiesContainer.style.display = "flex";

        const cubeSize = document.createElement("input");
        cubeSize.id = `cube-${index}-size`;
        cubeSize.type = "range";
        cubeSize.min = "0";
        cubeSize.max = "1";
        cubeSize.step = "0.01";
        cubeSize.value = (this._scene.objects[index] as Cube).size?.toString();
        cubeSize.style.width = "100%";
        cubeSize.addEventListener("input", (e) => {
            (this._scene.objects[index] as Cube).size = parseFloat((e.target as HTMLInputElement).value);
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
        
        cubeContainer.appendChild(cubePosContainer);
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

        const planeRemoveButton = document.createElement("button");
        planeRemoveButton.id = `plane-${index}-remove-button`;
        planeRemoveButton.innerText = "Remove";
        planeRemoveButton.addEventListener("click", () => {
            this._scene.removeObject(index);
            this.setUpObjects();
        });

        planeContainer.appendChild(planeRemoveButton);

        const planePosContainer = document.createElement("div");
        planePosContainer.id = `plane-${index}-pos-container`;
        planePosContainer.style.display = "flex";

        const planePosLabel = document.createElement("label");
        planePosLabel.htmlFor = `plane-${index}-pos`;
        planePosLabel.innerText = `Position`;

        planePosContainer.appendChild(planePosLabel);
        const planeX = this.setUpPosition(index, 'X', 'plane');
        const planeY = this.setUpPosition(index, 'Y', 'plane');
        const planeZ = this.setUpPosition(index, 'Z', 'plane');

        planePosContainer.appendChild(planeX);
        planePosContainer.appendChild(planeY);
        planePosContainer.appendChild(planeZ);

        const planePropertiesContainer = document.createElement("div");
        planePropertiesContainer.id = `plane-${index}-properties-container`;
        planePropertiesContainer.style.display = "flex";

        const planeSize = document.createElement("input");
        planeSize.id = `plane-${index}-size`;
        planeSize.type = "range";
        planeSize.min = "0";
        planeSize.max = "10";
        planeSize.step = "0.5";
        planeSize.value = (this._scene.objects[index] as Plane).size?.toString();
        planeSize.style.width = "100%";
        planeSize.addEventListener("input", (e) => {
            (this._scene.objects[index] as Plane).size = parseFloat((e.target as HTMLInputElement).value);
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

        planeContainer.appendChild(planePosContainer);
        planeContainer.appendChild(planePropertiesContainer);

        return planeContainer;
    }

    private setUpPosition(index:number, axis: 'X' | 'Y' | 'Z', type: string): HTMLInputElement
    {
        const posInput = document.createElement("input");
        posInput.id = `pos-${type}-${index}-${axis.toLowerCase()}}`;
        posInput.type = "number";
        posInput.min = "-10";
        posInput.max = "10";
        posInput.step = "0.1";
        posInput.value = this._scene.objects[index].position[axis === 'X' ? 0 : axis === 'Y' ? 1 : 2].toString();
        posInput.style.width = "100%";
        const axisIndex = axis === 'X' ? 0 : axis === 'Y' ? 1 : 2;
        posInput.addEventListener("input", (e) => {
            this._scene.objects[index].position[axisIndex] = parseFloat((e.target as HTMLInputElement).value);
        });

        return posInput;
    }

    public get dom(): HTMLDivElement { return this._dom; }
}