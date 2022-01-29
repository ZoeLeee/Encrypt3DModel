import { Scene, Engine, SceneLoader } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function (reg) {
      // registration worked
      console.log("Registration succeeded. Scope is " + reg.scope);
    })
    .catch(function (error) {
      // registration failed
      console.log("Registration failed with " + error);
    });
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const engine = new Engine(canvas);
engine.setSize(window.innerWidth, window.innerHeight);

const scene = new Scene(engine);
scene.createDefaultCameraOrLight(true, true, true);

SceneLoader.AppendAsync("/static/models/", "Xbot.glb").then((scene) => {});

function render() {
  engine.runRenderLoop(() => {
    scene.render();
  });
}

render();
