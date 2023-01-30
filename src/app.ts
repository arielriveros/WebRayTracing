import { Render } from "./renderer";

let renderer = new Render("raytracer-canvas");

// main application the browser runs
window.onload = () => {
    renderer.start(true);
}

window.onresize = () => {
    // renderer.resize();
}
