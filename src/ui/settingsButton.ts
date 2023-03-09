import { UserInterface } from "./ui";



export default class SettingsButton
{
    private _dom: HTMLButtonElement;
    constructor(ui: UserInterface)
    {
        const optionButton = document.createElement("button");
        optionButton.innerText = "⚙️";
        optionButton.style.position = "relative";
        optionButton.style.zIndex = "100";
        optionButton.style.margin = "10px";
        optionButton.style.padding = "5px";
        optionButton.style.fontSize = "20px";
        optionButton.style.backgroundColor = "white";
        optionButton.style.border = "1px solid black";
        optionButton.style.borderRadius = "50px";
        optionButton.style.cursor = "pointer";
        optionButton.style.userSelect = "none";

        optionButton.addEventListener("click", () => {
            ui.toggle();
        });

        this._dom = optionButton;
    }

    public get dom(): HTMLButtonElement { return this._dom; }

}