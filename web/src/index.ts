import {
  Scene,
  Engine,
  SceneLoader,
  ArcRotateCamera,
  FramingBehavior,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/obj";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    .then(function (reg) {
      // registration worked
      console.log("Registration succeeded. Scope is " + reg.scope);
    })
    .catch(function (error) {
      // registration failed
      console.log("Registration failed with " + error);
    });
}

function zoomAll(scene: Scene) {
  const camera = scene.activeCamera! as ArcRotateCamera;

  // Enable camera's behaviors
  camera.useFramingBehavior = true;

  var framingBehavior = camera.getBehaviorByName("Framing") as FramingBehavior;
  framingBehavior.framingTime = 0;
  framingBehavior.elevationReturnTime = 0;

  if (scene.meshes.length) {
    camera.lowerRadiusLimit = null;

    var worldExtends = scene.getWorldExtends(function (mesh) {
      return mesh.isVisible && mesh.isEnabled();
    });
    framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);
  }

  //   camera.useAutoRotationBehavior = true;

  //   camera.pinchPrecision = 200 / camera.radius;
  //   camera.upperRadiusLimit = 5 * camera.radius;

  camera.wheelDeltaPercentage = 0.01;
  camera.pinchDeltaPercentage = 0.01;
}

export function start(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas);
  engine.setSize(window.innerWidth, window.innerHeight);

  const scene = new Scene(engine);
  scene.createDefaultCameraOrLight(true, true, true);

  setTimeout(() => {
    fetch("/upload/zhuzi.hc")
      .then((r) => r.text())
      .then((r) => {
        const object = JSON.parse(r);
        console.log("object: ", object);
        const blob = new Blob([object.Data], {
          type: "text/plain",
        });
        const file = new File([blob], "zhuzi." + object.Type);
        console.log("file: ", file);
        SceneLoader.AppendAsync("file:", file).then((scene) => {});
      });
  }, 2000);

  function render() {
    engine.runRenderLoop(() => {
      scene.render();
    });
  }

  render();
}
