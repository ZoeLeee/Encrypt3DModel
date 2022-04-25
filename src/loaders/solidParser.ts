import {
  AssetContainer,
  Color3,
  Color4,
  Material,
  Mesh,
  MeshBuilder,
  Nullable,
  ParticleSystem,
  PointsCloudSystem,
  Scene,
  StandardMaterial,
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

type EdgeVector = [Vector3, Vector3];
type LineVector = [Vector3, SVector];
type SVector = [Vector3, number];

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
  static Data_REG = /\(\s.+\)/;
  static CART_POINT = "CARTESIAN_POINT";
  static VER_POINT = "VERTEX_POINT";
  static VECTOR = "VECTOR";
  static EDGE_CURVE = "EDGE_CURVE";
  static LINE = "LINE";
  static DIRECTION = "DIRECTION";
  private pointMap = new Map<string, Vector3>();
  private DirMap = new Map<string, Vector3>();
  private VertexPointMap = new Map<string, Vector3>();
  private VectorMap = new Map<string, SVector>();
  private EdgeMap = new Map<string, EdgeVector>();
  //法线
  private LineMap = new Map<string, LineVector>();
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
    const getVertex: (() => SVector)[] = [];
    const getVertexPoint: (() => Vector3)[] = [];
    const getEdgeCurves: (() => EdgeVector)[] = [];
    const getLineCurves: (() => LineVector)[] = [];

    for (const line of lines) {
      const matchResult = line.match(SolidParser.DATA_LINE);
      if (matchResult) {
        if (matchResult.index === 0) {
          const ID = matchResult[0].slice(0, -1).trim();
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
          } else if (line.includes(SolidParser.DIRECTION)) {
            const matchRes = line.match(SolidParser.CART_POINT_REG);
            if (matchRes) {
              const dir = matchRes[0].trim().slice(1, -1).split(",");
              console.log("dir: ", dir);
              this.DirMap.set(
                ID,
                new Vector3(
                  parseFloat(dir[0].trim()),
                  parseFloat(dir[1].trim()),
                  parseFloat(dir[2].trim())
                )
              );
            }
          } else if (line.includes(SolidParser.VER_POINT)) {
            const matchRes = line.match(SolidParser.Data_REG);
            if (matchRes) {
              const points = matchRes[0].slice(3, -2).split(",");
              const cid = points[1].trim();
              getVertexPoint.push(() => {
                const p = this.pointMap.get(cid);
                this.VertexPointMap.set(ID, p);
                return p;
              });
            }
          } else if (line.includes(SolidParser.VECTOR)) {
            const matchRes = line.match(SolidParser.Data_REG);
            if (matchRes) {
              const points = matchRes[0].trim().slice(1, -1).split(",");
              const cid = points[1].trim();
              getVertex.push(() => {
                const p = this.DirMap.get(cid);
                const v = [p, parseFloat(points[2].trim())] as SVector;
                this.VectorMap.set(ID, v);
                return v;
              });
            }
          } else if (line.includes(SolidParser.EDGE_CURVE)) {
            const matchRes = line.match(SolidParser.Data_REG);
            if (matchRes) {
              const points = matchRes[0].trim().slice(1, -1).split(",");

              getEdgeCurves.push(() => {
                const edge = [
                  this.VertexPointMap.get(points[1].trim()),
                  this.VertexPointMap.get(points[2].trim()),
                ] as EdgeVector;
                this.EdgeMap.set(ID, edge);
                return edge;
              });
            }
          } else if (line.includes(SolidParser.LINE)) {
            const matchRes = line.match(SolidParser.Data_REG);
            if (matchRes) {
              const points = matchRes[0].trim().slice(1, -1).split(",");
              console.log("points: ", points);

              getLineCurves.push(() => {
                const line = [
                  this.pointMap.get(points[1].trim()),
                  this.VectorMap.get(points[2].trim()),
                ] as LineVector;
                this.LineMap.set(ID, line);
                return line;
              });
            }
          }
        }
      }
    }

    for (const f of getVertexPoint) {
      f();
    }
    for (const f of getVertex) {
      f();
    }

    for (const f of getLineCurves) {
      const line = f();
      console.log("line: ", line);
      let lines = MeshBuilder.CreateLines(
        "lines",
        { points: [line[0], line[0].add(line[1][0].scale(line[1][1]))] },
        scene
      );
      lines.color = new Color3(1, 1, 1);
    }

    console.log(this.VertexPointMap);
    for (const fv of getEdgeCurves) {
      const edge = fv();
      console.log("edge: ", edge);

      let lines = MeshBuilder.CreateLines("lines", { points: edge }, scene);
      lines.color = new Color3(Math.random(), Math.random(), Math.random());
    }

    console.log(this.EdgeMap);

    const pcs = new PointsCloudSystem("pcs", 12, scene);
    pcs.addPoints(getVertexPoint.length, function (particle, i) {
      particle.position = getVertexPoint[i]();

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
