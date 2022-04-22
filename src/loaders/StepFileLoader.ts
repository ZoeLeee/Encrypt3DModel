import {
  AssetContainer,
  ISceneLoaderAsyncResult,
  ISceneLoaderPluginAsync,
  ISceneLoaderPluginExtensions,
  ISceneLoaderProgressEvent,
  Scene,
  SceneLoader,
} from "@babylonjs/core";

export class StepFileLoader implements ISceneLoaderPluginAsync {
  name: string;
  extensions: string | ISceneLoaderPluginExtensions = "STEP";
  loadAssetContainerAsync(
    scene: Scene,
    data: any,
    rootUrl: string,
    onProgress?: (event: ISceneLoaderProgressEvent) => void,
    fileName?: string
  ): Promise<AssetContainer> {
    return null;
  }
  importMeshAsync(
    meshesNames: any,
    scene: Scene,
    data: any,
    rootUrl: string,
    onProgress?: (event: ISceneLoaderProgressEvent) => void,
    fileName?: string
  ): Promise<ISceneLoaderAsyncResult> {
    return null;
  }
  loadAsync(
    scene: Scene,
    data: any,
    rootUrl: string,
    onProgress?: (event: ISceneLoaderProgressEvent) => void,
    fileName?: string
  ): Promise<void> {
    return null;
  }
}

SceneLoader.RegisterPlugin(new StepFileLoader());
