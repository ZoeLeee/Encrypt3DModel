import {
  Scene,
  Engine,
  SceneLoader,
  ArcRotateCamera,
  FramingBehavior,
  AxesViewer,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/OBJ";
import "./loaders/StepFileLoader";

// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("/sw.js")
//     .then(function (reg) {
//       // registration worked
//       console.log("Registration succeeded. Scope is " + reg.scope);
//     })
//     .catch(function (error) {
//       // registration failed
//       console.log("Registration failed with " + error);
//     });
// }

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const engine = new Engine(canvas);
engine.setSize(window.innerWidth, window.innerHeight);

const scene = new Scene(engine);
scene.createDefaultCameraOrLight(true, true, true);
new AxesViewer(scene);

// SceneLoader.AppendAsync("/static/models/", "1.STEP").then((scene) => {});
SceneLoader.AppendAsync("/static/models/", "AVG01.obj").then((s) => {
  // s.createDefaultCamera(true);
  const camera = s.activeCamera as ArcRotateCamera;

  // Enable camera's behaviors
  camera.useFramingBehavior = true;

  const framingBehavior = camera.getBehaviorByName(
    "Framing"
  ) as FramingBehavior;
  framingBehavior.framingTime = 0;
  framingBehavior.elevationReturnTime = 0;

  if (s.meshes.length) {
    camera.lowerRadiusLimit = null;

    const worldExtends = s.getWorldExtends(function (mesh) {
      return mesh.isVisible && mesh.isEnabled();
    });
    framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);
  }

  // camera.useAutoRotationBehavior = true;
  camera.pinchPrecision = 200 / camera.radius;
  camera.upperRadiusLimit = 5 * camera.radius;
  camera.wheelDeltaPercentage = 0.01;
  camera.pinchDeltaPercentage = 0.01;
});

function render() {
  engine.runRenderLoop(() => {
    scene.render();
  });
}

render();
