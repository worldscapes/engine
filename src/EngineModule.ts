import {
  AssetsManager,
  DeviceSourceManager,
  Engine,
  FreeCamera,
  HemisphericLight,
  Mesh,
  PointLight,
  Scene,
  Vector3,
  ISceneLoaderPlugin,
  ISceneLoaderPluginAsync,
  SceneLoader
} from "babylonjs";
import {OBJFileLoader} from "babylonjs-loaders";
import {MeshAssetTask} from "babylonjs/Misc/assetsManager";
import {AbstractMesh} from "babylonjs/Meshes/abstractMesh";

let engine: Engine;
let scene: Scene;
let inspectorContainer: HTMLElement;
let assetsManager: AssetsManager;
let deviceSourceManager: DeviceSourceManager;
let plugin: ISceneLoaderPluginAsync | ISceneLoaderPlugin;

const plainRadius = 10;

function isInitialized(): boolean {
  return !!engine;
}

function setInspectorContainer(container: HTMLElement): void {
  inspectorContainer = container;
}

function toggleDebugConsole(state?: boolean): void {
  if (state === undefined) {
    state = !scene.debugLayer.isVisible();
  }
  state ? scene?.debugLayer.show({embedMode: true, globalRoot: inspectorContainer}) : scene?.debugLayer.hide();
}

async function loadResources(scene: Scene): Promise<void> {
  assetsManager = new AssetsManager(scene);
  // const loadTask = assetsManager.addMeshTask("load task", "", process.env.PUBLIC_URL + "/assets/mesh/", "cottage_obj.obj");
  // loadTask.onSuccess = () => {
  //   (loadTask.loadedMeshes[0]).scalingDeterminant = 5;
  // }
  await assetsManager.loadAsync();
}

async function initEngine(canvas: HTMLCanvasElement): Promise<Engine> {
  if (isInitialized()) return engine;

  OBJFileLoader.OPTIMIZE_WITH_UV = true;
  plugin = new OBJFileLoader().createPlugin();
  SceneLoader.RegisterPlugin(plugin);
  engine = new Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
  scene = await createAndInitScene(engine);
  deviceSourceManager = new DeviceSourceManager(engine);

  await loadResources(scene);

  engine.runRenderLoop(() => scene.render());
  canvas.addEventListener('resize', function () {
    engine.resize();
  });

  return engine;
}

async function createAndInitScene(engine: Engine): Promise<Scene> {
  const scene = await setupTestScene(setupCamera(setupLight(new Scene(engine))));
  scene.createDefaultSkybox();
  return scene;
}

function setupLight(scene: Scene): Scene {
  const hemisphericLight = new HemisphericLight('hemisphericLight', new Vector3(0, 1, 0), scene);
  hemisphericLight.intensity = 1;

  // const directionalLight = new DirectionalLight('directionalLight', new Vector3(15, 5, 15), scene);
  // directionalLight.setDirectionToTarget(new Vector3(0, 0, 0));

  const pointLight = new PointLight('pointLight', new Vector3(15, 5, 15), scene);
  pointLight.setDirectionToTarget(new Vector3(0, 0, 0));

  return scene;
}

function setupCamera(scene: Scene): Scene {
  const camera = new FreeCamera('camera1', new Vector3(15, 7.5, 15), scene);
  camera.setTarget(new Vector3(0, 1.5, 0));
  camera.attachControl(engine.getRenderingCanvas());
  return scene;
}

async function setupTestScene(scene: Scene): Promise<Scene> {
  Mesh.CreateGround('ground1', plainRadius * 2, plainRadius * 2, 2, scene, false);

  assetsManager = new AssetsManager(scene);
  const meshesRecord = await groupLoadedAssets(
    () => assetsManager.loadAsync(),
    {
      // cottage: assetsManager.addMeshTask("load task", "", process.env.PUBLIC_URL + "/assets/mesh/", "cottage_obj.obj"),
      tree1: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_1.obj"),
      tree2: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_2.obj"),
      tree3: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_4.obj"),
      tree4: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_5.obj"),
      tree5: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_3.obj"),
      tree6: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_1.obj"),
      tree7: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_4.obj"),
      tree8: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_4.obj"),
      tree9: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_1.obj"),
      tree10: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_2.obj"),
      tree11: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_5.obj"),
      tree12: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_4.obj"),
      tree13: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_3.obj"),
      tree14: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_2.obj"),
      tree15: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_2.obj"),
      tree16: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_3.obj"),
      tree17: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_1.obj"),
      tree18: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_2.obj"),
      tree19: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_3.obj"),
      tree20: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_4.obj"),
      tree21: assetsManager.addMeshTask("load tree", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "BirchTree_2.obj"),
      rock1: assetsManager.addMeshTask("load rock", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "Rock_1.obj"),
      rock2: assetsManager.addMeshTask("load rock", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "Rock_2.obj"),
      rock3: assetsManager.addMeshTask("load rock", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "Rock_3.obj"),
      rock4: assetsManager.addMeshTask("load rock", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "Rock_4.obj"),
      rock5: assetsManager.addMeshTask("load rock", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "Rock_5.obj"),
      rock6: assetsManager.addMeshTask("load rock", "", process.env.PUBLIC_URL + "/assets/mesh/OBJ/", "Rock_2.obj"),
    }
  )

  const setCachedRandom = () => {
    const cached = new Vector3((Math.random() - 0.5) * 2 * plainRadius, 0, (Math.random() - 0.5) * 2 * plainRadius);
    return (submesh: AbstractMesh) => submesh.setAbsolutePosition(cached);
  };

  (Object.keys(meshesRecord) as (keyof typeof meshesRecord)[]).forEach(key => meshesRecord[key].forEach(setCachedRandom()));

  return scene;
}

type MeshName = string;
type LoadedMeshesRecord<T extends Record<MeshName, MeshAssetTask>> = Record<keyof T, AbstractMesh[]>;

async function groupLoadedAssets<T extends Record<MeshName, MeshAssetTask>>(
  runFunc: () => Promise<void>,
  tasks: T
): Promise<LoadedMeshesRecord<T>> {
  await runFunc();
  return Object.keys(tasks).reduce(
    (acc, meshName: keyof T) => ({...acc, [meshName]: tasks[meshName].loadedMeshes}),
    {}
  ) as LoadedMeshesRecord<T>;
}

const EngineModule = {
  initEngine,
  isInitialized,
  toggleDebugConsole,
  setInspectorContainer,
}

export default EngineModule;