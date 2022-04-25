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

type Vector2D = [Vector3, Vector3];
type Vector3D = [Vector3, Vector3, Vector3];
type LineVector = [Vector3, SVector];
type TEdge = [Vector2D, LineVector];
type SVector = [Vector3, number];
type TOrientedEdge = [TEdge, boolean];
type TEdgeLoop = [TOrientedEdge, TOrientedEdge, TOrientedEdge, TOrientedEdge];
type TFaceOuterBound = [TEdgeLoop, boolean];
type TAdFace = [TFaceOuterBound, Vector3D, boolean];
type TCloseShell = TAdFace[];

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
  static ID_REG = /\(\s[\d\s#].+\)/;
  static CART_POINT = "CARTESIAN_POINT";
  static VER_POINT = "VERTEX_POINT";
  static VECTOR = "VECTOR";
  static EDGE_CURVE = "EDGE_CURVE";
  static LINE = "LINE";
  static DIRECTION = "DIRECTION";
  static ORIENTED_EDGE = "ORIENTED_EDGE";
  static EDGE_LOOP = "EDGE_LOOP";
  static FACE_OUTER_BOUND = "FACE_OUTER_BOUND";
  static AXIS2_PLACEMENT_3D = "AXIS2_PLACEMENT_3D";
  static PLANE = "PLANE";
  static ADVANCED_FACE = "ADVANCED_FACE";
  static CLOSED_SHELL = "CLOSED_SHELL";
  private pointMap = new Map<string, Vector3>();
  private DirMap = new Map<string, Vector3>();
  private VertexPointMap = new Map<string, Vector3>();
  private VectorMap = new Map<string, SVector>();
  private EdgeMap = new Map<string, TEdge>();
  //法线
  private LineMap = new Map<string, LineVector>();
  private OrientedEdgeMap = new Map<string, TOrientedEdge>();
  private EdgeLoopMap = new Map<string, TEdgeLoop>();
  private FaceOuterMap = new Map<string, TFaceOuterBound>();
  private Vector3DMap = new Map<string, Vector3D>();
  private PlaneMap = new Map<string, Vector3D>();
  private AdvFaceMap = new Map<string, TAdFace>();
  private CloseShellMap = new Map<string, TCloseShell>();
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
    const getVector3D: (() => Vector3D)[] = [];
    const getEdgeCurves: (() => TEdge)[] = [];
    const getLineCurves: (() => LineVector)[] = [];
    const getOrientedEdge: (() => TOrientedEdge)[] = [];
    const getEdgeLoop: (() => TEdgeLoop)[] = [];
    const getFaceOuterBound: (() => TFaceOuterBound)[] = [];
    const getPlane: (() => Vector3D)[] = [];
    const getAdvFace: (() => TAdFace)[] = [];
    const getCloseShell: (() => TCloseShell)[] = [];

    for (const line of lines) {
      const matchResult = line.match(SolidParser.DATA_LINE);
      if (matchResult) {
        if (matchResult.index === 0) {
          const startIndex = matchResult[0].length;
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
          } else if (line.includes(SolidParser.AXIS2_PLACEMENT_3D)) {
            const matchRes = line.match(SolidParser.Data_REG);
            if (matchRes) {
              const points = matchRes[0].slice(3, -2).split(",");

              getVector3D.push(() => {
                const ps = [
                  this.pointMap.get(points[1].trim()),
                  this.DirMap.get(points[2].trim()),
                  this.DirMap.get(points[3].trim()),
                ] as Vector3D;
                this.Vector3DMap.set(ID, ps);
                return ps;
              });
            }
          } else if (line.indexOf(SolidParser.PLANE) === startIndex + 1) {
            const matchRes = line.match(SolidParser.Data_REG);
            if (matchRes) {
              const points = matchRes[0].slice(3, -2).split(",");
              console.log("points: ", points);

              getPlane.push(() => {
                const p = this.Vector3DMap.get(points[1].trim());
                this.PlaneMap.set(ID, p);
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
                const v2d = [
                  this.VertexPointMap.get(points[1].trim()),
                  this.VertexPointMap.get(points[2].trim()),
                ] as Vector2D;

                const edge = [v2d, this.LineMap.get(points[3].trim())] as TEdge;
                this.EdgeMap.set(ID, edge);
                return edge;
              });
            }
          } else if (line.includes(SolidParser.LINE)) {
            const matchRes = line.match(SolidParser.Data_REG);
            if (matchRes) {
              const points = matchRes[0].trim().slice(1, -1).split(",");

              getLineCurves.push(() => {
                const line = [
                  this.pointMap.get(points[1].trim()),
                  this.VectorMap.get(points[2].trim()),
                ] as LineVector;
                this.LineMap.set(ID, line);
                return line;
              });
            }
          } else if (line.includes(SolidParser.ORIENTED_EDGE)) {
            const matchRes = line.match(SolidParser.Data_REG);
            if (matchRes) {
              const points = matchRes[0].trim().slice(1, -1).split(",");

              getOrientedEdge.push(() => {
                const edge = [
                  this.EdgeMap.get(points[3].trim()),
                  points[4].trim() === ".T.",
                ] as TOrientedEdge;
                this.OrientedEdgeMap.set(ID, edge);
                return edge;
              });
            }
          } else if (line.includes(SolidParser.EDGE_LOOP)) {
            const matchRes = line.match(SolidParser.ID_REG);
            if (matchRes) {
              const points = matchRes[0].trim().slice(1, -3).split(",");

              getEdgeLoop.push(() => {
                const edgeloop = [
                  this.OrientedEdgeMap.get(points[0].trim()),
                  this.OrientedEdgeMap.get(points[1].trim()),
                  this.OrientedEdgeMap.get(points[2].trim()),
                  this.OrientedEdgeMap.get(points[3].trim()),
                ] as TEdgeLoop;
                this.EdgeLoopMap.set(ID, edgeloop);
                return edgeloop;
              });
            }
          } else if (line.includes(SolidParser.FACE_OUTER_BOUND)) {
            const matchRes = line.match(SolidParser.Data_REG);
            if (matchRes) {
              const points = matchRes[0].trim().slice(1, -1).split(",");

              getFaceOuterBound.push(() => {
                const edgeloop = [
                  this.EdgeLoopMap.get(points[1].trim()),
                  points[2].trim() === ".T.",
                ] as TFaceOuterBound;
                this.FaceOuterMap.set(ID, edgeloop);
                return edgeloop;
              });
            }
          } else if (line.includes(SolidParser.ADVANCED_FACE)) {
            const matchRes = line.match(SolidParser.Data_REG);
            if (matchRes) {
              const points = matchRes[0].trim().slice(1, -1).split(",");

              getAdvFace.push(() => {
                const face = [
                  this.FaceOuterMap.get(points[1].trim().slice(1, -1).trim()),
                  this.PlaneMap.get(points[2].trim()),
                  points[3].trim() === ".T.",
                ] as TAdFace;
                this.AdvFaceMap.set(ID, face);
                return face;
              });
            }
          } else if (line.includes(SolidParser.CLOSED_SHELL)) {
            const matchRes = line.match(SolidParser.ID_REG);
            if (matchRes) {
              const list = matchRes[0].trim().slice(1, -3).split(",");
              console.log("list: ", list);

              getCloseShell.push(() => {
                const shells = list.map((l) => {
                  return this.AdvFaceMap.get(l.trim());
                });
                this.CloseShellMap.set(ID, shells);
                return shells;
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
      f();
    }

    for (const fv of getEdgeCurves) {
      const edge = fv();

      // const line = edge[1];

      // let l = MeshBuilder.CreateLines(
      //   "lines",
      //   { points: [line[0], line[0].add(line[1][0].scale(line[1][1]))] },
      //   scene
      // );
      // l.color = new Color3(1, 1, 1);

      // let lines = MeshBuilder.CreateLines("lines", { points: edge[0] }, scene);
      // lines.color = new Color3(Math.random(), Math.random(), Math.random());
    }

    for (const f of getOrientedEdge) {
      const t = f();
    }

    for (const f of getEdgeLoop) {
      const edgeLoop = f();
      const c = new Color3(Math.random(), Math.random(), Math.random());
      for (const oedge of edgeLoop) {
        const edge = oedge[0];

        const line = edge[1];

        let l = MeshBuilder.CreateLines(
          "lines",
          { points: [line[0], line[0].add(line[1][0].scale(line[1][1]))] },
          scene
        );
        l.color = new Color3(1, 1, 1);

        let lines = MeshBuilder.CreateLines(
          "lines",
          { points: edge[0] },
          scene
        );
        lines.color = c;
      }
    }
    for (const f of getFaceOuterBound) {
      const t = f();
    }
    for (const f of getVector3D) {
      const t = f();
    }
    for (const f of getPlane) {
      const t = f();
    }
    for (const f of getAdvFace) {
      const t = f();
      // console.log("plane ", t);
    }
    for (const f of getCloseShell) {
      const t = f();
      console.log("shell ", t);
    }
    // const pcs = new PointsCloudSystem("pcs", 12, scene);
    // pcs.addPoints(getVertexPoint.length, function (particle, i) {
    //   particle.position = getVertexPoint[i]();

    //   particle.color = new Color4(
    //     Math.random(),
    //     Math.random(),
    //     Math.random(),
    //     Math.random()
    //   );
    // });
    // pcs.buildMeshAsync();
  }
}
