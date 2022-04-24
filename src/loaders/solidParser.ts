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
  static CART_POINT_REG = /\(\s[\d\s-].+\)/;
  static CART_POINT = "CARTESIAN_POINT";
  static VER_POINT = "VERTEX_POINT";
  private pointMap = new Map<string, Vector3>();
  public parse(
    meshesNames: any,
    data: string,
    scene: Scene,
    assetContainer: Nullable<AssetContainer>,
    onFileToLoadFound: (fileToLoad: string) => void
  ): void {
    // Split the file into lines
    const lines = data.split("\n");
    const vectors: Vector3[] = [];
    const getVertex: (() => Vector3)[] = [];
    for (const line of lines) {
      const matchResult = line.match(SolidParser.DATA_LINE);
      if (matchResult) {
        if (matchResult.index === 0) {
          const ID = matchResult[0].slice(0, -1);
          if (line.includes(SolidParser.CART_POINT)) {
            const matchRes = line.match(SolidParser.CART_POINT_REG);
            if (matchRes) {
              const points = matchRes[0]
                .slice(2, -4)
                .split(",")
                .map(parseFloat);
              vectors.push(Vector3.FromArray(points));
              this.pointMap.set(ID.trim(), Vector3.FromArray(points));
            }
          } else if (line.includes(SolidParser.VER_POINT)) {
            const matchRes = line.match(/ \(\s.+\)/);
            if (matchRes) {
              const points = matchRes[0].slice(3, -2).split(",");
              const cid = points[1].trim();
              getVertex.push(() => this.pointMap.get(cid));
            }
          }
        }
      }
    }
    const pcs = new PointsCloudSystem("pcs", 12, scene);
    pcs.addPoints(getVertex.length, function (particle, i) {
      particle.position = getVertex[i]();

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
