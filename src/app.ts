import { Application } from "./application";

let application = new Application();

// main application the browser runs
window.onload = () => {
    application.start();
}

window.onresize = () => {
    // renderer.resize();
}
