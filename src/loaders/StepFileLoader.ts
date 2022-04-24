import {
  AbstractMesh,
  AssetContainer,
  ISceneLoaderAsyncResult,
  ISceneLoaderPluginAsync,
  ISceneLoaderPluginExtensions,
  ISceneLoaderProgressEvent,
  Nullable,
  Scene,
  SceneLoader,
} from "@babylonjs/core";
import { SolidParser } from "./solidParser";

export class StepFileLoader implements ISceneLoaderPluginAsync {
  private _assetContainer: Nullable<AssetContainer> = null;
  name = "STEP";
  extensions: string | ISceneLoaderPluginExtensions = ".STEP";
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
    return this._parseSolid(meshesNames, scene, data, rootUrl).then(
      (meshes) => {
        return {
          meshes: meshes,
          particleSystems: [],
          skeletons: [],
          animationGroups: [],
          transformNodes: [],
          geometries: [],
          lights: [],
        };
      }
    );
  }
  loadAsync(
    scene: Scene,
    data: any,
    rootUrl: string,
    onProgress?: (event: ISceneLoaderProgressEvent) => void,
    fileName?: string
  ): Promise<void> {
    return this.importMeshAsync(null, scene, data, rootUrl).then(() => {
      // return void
    });
  }

  /**
   * Read the OBJ file and create an Array of meshes.
   * Each mesh contains all information given by the OBJ and the MTL file.
   * i.e. vertices positions and indices, optional normals values, optional UV values, optional material
   * @param meshesNames defines a string or array of strings of the mesh names that should be loaded from the file
   * @param scene defines the scene where are displayed the data
   * @param data defines the content of the obj file
   * @param rootUrl defines the path to the folder
   * @returns the list of loaded meshes
   */
  private _parseSolid(
    meshesNames: any,
    scene: Scene,
    data: string,
    rootUrl: string
  ): Promise<Array<AbstractMesh>> {
    let fileToLoad: string = ""; //The name of the mtlFile to load
    this._assetContainer = new AssetContainer(scene);
    // const materialsFromMTLFile: MTLFileLoader = new MTLFileLoader();
    // const materialToUse = new Array<string>();
    // const babylonMeshesArray: Array<Mesh> = []; //The mesh for babylon
    // // Main function
    const solidParser = new SolidParser();
    solidParser.parse(
      meshesNames,
      data,
      scene,
      this._assetContainer,
      (fileName: string) => {
        fileToLoad = fileName;
      }
    );
    // // load the materials
    // const mtlPromises: Array<Promise<void>> = [];
    // // Check if we have a file to load
    // if (fileToLoad !== "" && !this._loadingOptions.skipMaterials) {
    //   //Load the file synchronously
    //   mtlPromises.push(
    //     new Promise((resolve, reject) => {
    //       this._loadMTL(
    //         fileToLoad,
    //         rootUrl,
    //         (dataLoaded) => {
    //           try {
    //             //Create materials thanks MTLLoader function
    //             materialsFromMTLFile.parseMTL(
    //               scene,
    //               dataLoaded,
    //               rootUrl,
    //               this._assetContainer
    //             );
    //             //Look at each material loaded in the mtl file
    //             for (
    //               let n = 0;
    //               n < materialsFromMTLFile.materials.length;
    //               n++
    //             ) {
    //               //Three variables to get all meshes with the same material
    //               let startIndex = 0;
    //               const _indices = [];
    //               let _index;
    //               //The material from MTL file is used in the meshes loaded
    //               //Push the indice in an array
    //               //Check if the material is not used for another mesh
    //               while (
    //                 (_index = materialToUse.indexOf(
    //                   materialsFromMTLFile.materials[n].name,
    //                   startIndex
    //                 )) > -1
    //               ) {
    //                 _indices.push(_index);
    //                 startIndex = _index + 1;
    //               }
    //               //If the material is not used dispose it
    //               if (_index === -1 && _indices.length === 0) {
    //                 //If the material is not needed, remove it
    //                 materialsFromMTLFile.materials[n].dispose();
    //               } else {
    //                 for (let o = 0; o < _indices.length; o++) {
    //                   //Apply the material to the Mesh for each mesh with the material
    //                   const mesh = babylonMeshesArray[_indices[o]];
    //                   const material = materialsFromMTLFile.materials[n];
    //                   mesh.material = material;
    //                   if (!mesh.getTotalIndices()) {
    //                     // No indices, we need to turn on point cloud
    //                     material.pointsCloud = true;
    //                   }
    //                 }
    //               }
    //             }
    //             resolve();
    //           } catch (e) {
    //             Tools.Warn(`Error processing MTL file: '${fileToLoad}'`);
    //             if (this._loadingOptions.materialLoadingFailsSilently) {
    //               resolve();
    //             } else {
    //               reject(e);
    //             }
    //           }
    //         },
    //         (pathOfFile: string, exception?: any) => {
    //           Tools.Warn(`Error downloading MTL file: '${fileToLoad}'`);
    //           if (this._loadingOptions.materialLoadingFailsSilently) {
    //             resolve();
    //           } else {
    //             reject(exception);
    //           }
    //         }
    //       );
    //     })
    //   );
    // }
    // //Return an array with all Mesh
    // return Promise.all(mtlPromises).then(() => {
    //   return babylonMeshesArray;
    // });
    return Promise.resolve([]);
  }
}

SceneLoader.RegisterPlugin(new StepFileLoader());
