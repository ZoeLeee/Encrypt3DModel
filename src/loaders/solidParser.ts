import {
  AssetContainer,
  Color4,
  Material,
  Mesh,
  Nullable,
  ParticleSystem,
  PointsCloudSystem,
  Scene,
  Vector2,
  Vector3,
} from "@babylonjs/core";

type MeshObject = {
  name: string;
  indices?: Array<number>;
  positions?: Array<number>;
  normals?: Array<number>;
  colors?: Array<number>;
  uvs?: Array<number>;
  materialName: string;
  directMaterial?: Nullable<Material>;
};

/**
 * Class used to load mesh data from OBJ content
 */
export class SolidParser {
  /**
   * Function used to parse an OBJ string
   * @param meshesNames defines the list of meshes to load (all if not defined)
   * @param data defines the OBJ string
   * @param scene defines the hosting scene
   * @param assetContainer defines the asset container to load data in
   * @param onFileToLoadFound defines a callback that will be called if a MTL file is found
   */
  static DATA_LINE = /^(#)\d+(\s)=/;
  static VERTEX_POINT = "CARTESIAN_POINT";
  public parse(
    meshesNames: any,
    data: string,
    scene: Scene,
    assetContainer: Nullable<AssetContainer>,
    onFileToLoadFound: (fileToLoad: string) => void
  ): void {
    // Split the file into lines
    const lines = data.split("\n");
    console.log("lines: ", lines);
    const vectors: Vector3[] = [];
    for (const line of lines) {
      const matchResult = line.match(SolidParser.DATA_LINE);
      if (matchResult) {
        if (matchResult.index === 0) {
          const ID = matchResult[0].slice(0, -1);
          if (line.includes(SolidParser.VERTEX_POINT)) {
            const matchRes = line.match(/\(\s[\d\s].+\)/);
            if (matchRes) {
              console.log("ID: ", ID);
              const points = matchRes[0]
                .slice(2, -4)
                .split(",")
                .map(parseFloat);
              console.log(points);
              vectors.push(Vector3.FromArray(points));
            }
          }
        }
      }
    }
    const pcs = new PointsCloudSystem("pcs", 12, scene);
    pcs.addPoints(vectors.length, function (particle, i) {
      particle.position = vectors[i];
      particle.color = new Color4(
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random()
      );
    });
    pcs.buildMeshAsync();
  }
}
