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
} from "babylonjs";
import {BeforeRenderHook} from "../scene/scene.system";
import {Camera} from "babylonjs/Cameras/camera";

export class EngineSystemConfig {
    inspectorContainer: HTMLElement | null = null;
    canvas?: HTMLCanvasElement = undefined;
}

export class EngineSystemImpl extends SystemInstance<EngineSystemImpl, EngineSystemConfig> {

    protected plugin!: ISceneLoaderPluginAsync | ISceneLoaderPlugin;
    protected engine!: Engine;
    protected scene!: Scene;
    protected instrumentation!: SceneInstrumentation;
    protected beforeRenderHooks: BeforeRenderHook[] = [];

    /**
     * Default camera is needed to make sure babylon scene can work even without any other setup
     * @protected
     */
    protected defaultCamera!: Camera;

    protected async initialize() {

        const { canvas } = this.provider.getInjectConfig();

        this.engine = new Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});

        OBJFileLoader.OPTIMIZE_WITH_UV = true;
        this.plugin = new OBJFileLoader().createPlugin();
        SceneLoader.RegisterPlugin(this.plugin);

        this.scene = new Scene(this.engine);
        this.defaultCamera = this.createDefaultCamera(this.scene);

        this.instrumentation = new SceneInstrumentation(this.scene);
        this.instrumentation.captureRenderTime = true;
        this.instrumentation.captureFrameTime = true;
        this.instrumentation.capturePhysicsTime = true;

        const gl = new GlowLayer("glow", this.scene, {
            mainTextureFixedSize: 4096,
            blurKernelSize: 32
        });
        gl.intensity = 3;

        this.engine.runRenderLoop(() => this.scene.render());
        this.scene.registerBeforeRender(() => this.beforeRenderHooks.forEach(hook => hook()));


        canvas.addEventListener('resize', () => {
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
        const { inspectorContainer } = this.provider.getInjectConfig();

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
        return this.instrumentation.drawCallsCounter.current + '';
    }

    getRenderTime(): string {
        return this.instrumentation.renderTimeCounter.current + '';
    }

    getFrameTime(): string {
        return this.instrumentation.frameTimeCounter.current + '';
    }

    getPhysicsTime(): string {
        return this.instrumentation.physicsTimeCounter.current + '';
    }

    protected createDefaultCamera(babylonScene: Scene) {
        const camera = new UniversalCamera('default-camera', new Vector3(15, 7.5, 15).scale(3), babylonScene);
        camera.setTarget(new Vector3(0, 1.5, 0));
        return camera;
    }

}

export const EngineSystem = new SystemDescription(
    EngineSystemConfig,
    EngineSystemImpl,
    []
);