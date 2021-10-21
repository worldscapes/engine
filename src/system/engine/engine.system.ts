import {OBJFileLoader} from "babylonjs-loaders";
import {SystemDescription, SystemInstance} from "../system";
import {
    Engine,
    GlowLayer,
    ISceneLoaderPlugin,
    ISceneLoaderPluginAsync,
    Scene,
    SceneInstrumentation,
    SceneLoader,
    UniversalCamera,
    Vector3,
    PerfCounter,
    StandardMaterial,
    Mesh,
    Color3,
    DynamicTexture,
    TransformNode,
    TargetCamera,
    FxaaPostProcess,
    ImageProcessingPostProcess,
    PostProcessRenderPipeline,
    PostProcessRenderEffect
} from "babylonjs";
import {BeforeRenderHook} from "../scene/scene.system";

export class EngineSystemConfig {

    /**
     * @description
     * Container that will be used to render engine inspector
     */
    inspectorContainer: HTMLElement | null = null;

    /**
     * @description
     * Canvas that will be used to render engine graphics
     */
    canvas?: HTMLCanvasElement = undefined;
}


/**
 * System that initializes js
 */
export class EngineSystemImpl extends SystemInstance<EngineSystemImpl, EngineSystemConfig> {

    protected worldscapesFrameTimeCounter = new PerfCounter();

    protected plugin!: ISceneLoaderPluginAsync | ISceneLoaderPlugin;
    protected engine!: Engine;
    protected scene!: Scene;
    protected instrumentation!: SceneInstrumentation;
    protected beforeRenderHooks: BeforeRenderHook[] = [];

    /**
     * Default camera is needed to make sure babylon scene can work even without any other setup
     * @protected
     */
    protected defaultCamera!: TargetCamera;
    readonly defaultCameraName = 'engineDefaultCamera';

    protected async initialize() {

        const { canvas } = this.provider.getConfig();

        this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

        OBJFileLoader.OPTIMIZE_WITH_UV = true;
        this.plugin = new OBJFileLoader().createPlugin();
        SceneLoader.RegisterPlugin(this.plugin);

        this.scene = new Scene(this.engine);
        this.defaultCamera = this.createDefaultCamera(this.scene);

        this.engine.captureGPUFrameTime(true);
        this.instrumentation = new SceneInstrumentation(this.scene);
        this.instrumentation.captureInterFrameTime = true;
        this.instrumentation.captureCameraRenderTime = true;
        this.instrumentation.captureRenderTime = true;
        this.instrumentation.captureFrameTime = true;
        this.instrumentation.capturePhysicsTime = true;

        // const gl = new GlowLayer("glow", this.scene, {
        //     mainTextureFixedSize: 4096,
        //     blurKernelSize: 32
        // });
        // gl.intensity = 3;

        this.engine.runRenderLoop(() => {
            this.scene.render()
        });
        this.scene.registerBeforeRender(() => {
            this.worldscapesFrameTimeCounter.beginMonitoring();
            this.beforeRenderHooks.forEach(hook => hook())
        });
        this.scene.registerAfterRender(() => {
            this.worldscapesFrameTimeCounter.endMonitoring();
        })


        window.addEventListener('resize', () => {
            console.log("Resized window");
            this.engine.resize();
        });

        canvas.addEventListener('resize', () => {
            console.log("Resized canvas");
            this.engine.resize();
        });
    }

    isEngineInitialized(): boolean {
        return !!this.engine;
    }

    getEngine(): Engine {
        return this.engine;
    }

    getFps(): number {
        const fps = this.engine.getFps();
        return fps ? fps : 0;
    }

    getGpuInfo(): string {
        return JSON.stringify(this.engine.getGlInfo().renderer) ?? '';
    }

    toggleDebugConsole(toggleState: boolean = !this.scene.debugLayer.isVisible()): void {
        const { inspectorContainer } = this.provider.getConfig();

        if (!inspectorContainer) return;

        if (toggleState) {

            this.scene.debugLayer.show({
                embedMode: true,
                globalRoot: inspectorContainer
            })
        } else {

            this.scene.debugLayer.hide();
        }
    }

    registerBeforeRenderHook(hook: BeforeRenderHook) {
        this.beforeRenderHooks.push(hook);
    }

    getBabylonScene(): Scene {
        return this.scene;
    }

    getActiveSceneFaceCount(): number {
        return this.getBabylonScene().meshes.reduce((acc, mesh) => acc + (mesh.getTotalIndices() / 3), 0);
    }

    getDrawCallsCount(): string {
        return this.instrumentation.drawCallsCounter.lastSecAverage + '';
    }

    getRenderTime(): string {
        return this.instrumentation.renderTimeCounter.lastSecAverage + '';
    }

    getFrameTime(): string {
        return this.worldscapesFrameTimeCounter.lastSecAverage + '';
    }

    getBabylonFrameTime(): string {
        return this.instrumentation.frameTimeCounter.lastSecAverage + '';
    }

    getPhysicsTime(): string {
        return this.instrumentation.physicsTimeCounter.lastSecAverage + '';
    }

    getDefaultCamera(): TargetCamera {
        return this.defaultCamera;
    }

    protected createDefaultCamera(babylonScene: Scene) {
        const camera = new UniversalCamera(this.defaultCameraName, new Vector3(30, 20, 30).scale(5), babylonScene);
        // camera.detachControl();
        // camera.setTarget(new Vector3(5, 5, 5));

        // const pipeline = new PostProcessRenderPipeline(this.engine, "standardPipeline");
        //
        // const aa = new FxaaPostProcess("fxaa", 1.0, camera);
        // aa.samples = 8;
        //
        // const imageProcess = new ImageProcessingPostProcess("vignette", 1.0, camera);
        // imageProcess.vignetteWeight = 3;
        // imageProcess.vignetteStretch = 0.25;
        // imageProcess.vignetteColor = new BABYLON.Color4(0.25, 0.25, 0.8, 0.5);
        // imageProcess.vignetteEnabled = true;
        //
        // const effect = new PostProcessRenderEffect(
        //     this.engine,
        //     "main",
        //     function() {
        //         return [aa, imageProcess];
        //     }
        // );
        //
        // pipeline.addEffect(effect);
        //
        // this.scene.postProcessRenderPipelineManager.addPipeline(pipeline);
        // this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline(pipeline.name, this.defaultCamera);

        return camera;
    }
    
    public generateAxis(size: number) {

        const makeTextPlane = (text, color, size) => {
            const dynamicTexture = new DynamicTexture("DynamicTexture", { width: 128, height: 128 }, this.scene, true);
            dynamicTexture.hasAlpha = true;
            dynamicTexture.drawText(text, 5, 40, "bold 44px monospace", color, "transparent", true);

            const plane = Mesh.CreatePlane("TextPlane", size, this.scene, true);
            const standardMaterial = new StandardMaterial("TextPlaneMaterial", this.scene);
            plane.material = standardMaterial
            standardMaterial.backFaceCulling = false;
            standardMaterial.specularColor = new Color3(0, 0, 0);
            standardMaterial.diffuseTexture = dynamicTexture;
            return plane;
        };

        const axisX = Mesh.CreateLines("axisX", [
            Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
            new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
        ], this.scene);
        axisX.color = new Color3(1, 0, 0);
        const charX = makeTextPlane("X", 'red', size / 5);
        charX.position = new Vector3(0.9 * size, 0.15 * size, 0);

        const axisY = Mesh.CreateLines("axisY", [
            Vector3.Zero(), new Vector3(0, size, 0), new Vector3( -0.05 * size, size * 0.95, 0),
            new Vector3(0, size, 0), new Vector3( 0.05 * size, size * 0.95, 0)
        ], this.scene);
        axisY.color = new Color3(0, 1, 0);
        const charY = makeTextPlane("Y", 'green', size / 5);
        charY.position = new Vector3(0.15 * size, 0.9 * size, 0);

        const axisZ = Mesh.CreateLines("axisZ", [
            Vector3.Zero(), new Vector3(0, 0, size), new Vector3( 0 , -0.05 * size, size * 0.95),
            new Vector3(0, 0, size), new Vector3( 0, 0.05 * size, size * 0.95)
        ], this.scene);
        axisZ.color = new Color3(0, 0, 1);
        const charZ = makeTextPlane("Z", 'blue', size / 5);
        charZ.position = new Vector3(0, 0.15 * size, 0.9 * size);
        charZ.rotate(new Vector3(0, 1, 0), -Math.PI / 2);

        const parentNode = new TransformNode("world-axis");
        axisX.setParent(parentNode);
        charX.setParent(parentNode);
        axisY.setParent(parentNode);
        charY.setParent(parentNode);
        axisZ.setParent(parentNode);
        charZ.setParent(parentNode);

        axisX.material.depthFunction = Engine.ALWAYS;
        if (charX?.material) charX.material.depthFunction = Engine.ALWAYS;
        axisY.material.depthFunction = Engine.ALWAYS;
        if (charY?.material) charY.material.depthFunction = Engine.ALWAYS;
        axisZ.material.depthFunction = Engine.ALWAYS;
        if (charZ?.material) charZ.material.depthFunction = Engine.ALWAYS;

        return parentNode;
    }

}

export const EngineSystem = new SystemDescription(
    EngineSystemConfig,
    EngineSystemImpl,
    []
);