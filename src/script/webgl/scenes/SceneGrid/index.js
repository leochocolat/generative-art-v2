// Vendor
import { Color, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene } from 'three';
import { component } from 'webgl/vendor/bidello';
import { ResourceManager } from '@cosmicshelter/resource-loader';

// Config
import config from './config';

// Modules
import CameraManager from 'webgl/modules/CameraManager';

// Components
import ComponentBox from 'webgl/components/ComponentBox';
import WindowResizeObserver from '@/script/utils/WindowResizeObserver';
import Canvas2d from '../../modules/Canvas2d';

export default class SceneGrid extends component(Scene) {
    init(options = {}) {
        // Props

        // Setup
        this._bindAll();

        this._config = config;

        this._debugFolder = this._createDebugFolder();
        // this._cameraManager = this._createCameraManager();
        this._canvas2d = this._createCanvas2d();
        this._camera = this._createCamera();
        this._resourceManager = this._createResourceManager();

        this._setupEventListeners();
    }

    /**
     * Lifecycle
     */
    destroy() {
        super.destroy();

        this._destroyComponents();
        this._removeEventListeners();
    }

    /**
     * Getters
     */
    get config() {
        return this._config;
    }

    get camera() {
        return this._camera;
    }

    /**
     * Private
     */
    _start() {
        this._plane = this._createPlane();
    }

    _createPlane() {
        const geometry = new PlaneGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({
            map: this._canvas2d.texture,
            // color: new Color('red'),
        });
        const mesh = new Mesh(geometry, material);
        // mesh.scale.set(WindowResizeObserver.innerWidth, WindowResizeObserver.innerHeight, 1);
        this.add(mesh);
        return mesh;
    }

    _createCameraManager() {
        const cameraManager = new CameraManager({
            types: ['Orbit', 'Default'],
            debugFolder: this._debugFolder,
        });

        return cameraManager;
    }

    _createCanvas2d() {
        const canvas2d = new Canvas2d({
            debugger: this._debugFolder,
            element: this.$renderer.domElement,
            chaussette: this.$chaussette,
        });
        return canvas2d;
    }

    _createCamera() {
        const camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 2);
        camera.position.z = 1;
        return camera;
    }

    _createResourceManager() {
        const resourceManager = new ResourceManager();
        resourceManager.add(config.resources);
        resourceManager.load();
        return resourceManager;
    }

    _bindAll() {
        this._loadCompleteHandler = this._loadCompleteHandler.bind(this);
    }

    /**
     * Update
     */
    onUpdate({ time, deltaTime, frame }) {
        this._canvas2d.update();
    }

    /**
     * Window Resize
     */
    onWindowResize(dimensions) {

    }

    /**
     * Events
     */
    _setupEventListeners() {
        this._resourceManager.addEventListener('complete', this._loadCompleteHandler);
    }

    _removeEventListeners() {
        this._resourceManager.removeEventListener('complete', this._loadCompleteHandler);
    }

    /**
     * Handlers
     */
    _loadCompleteHandler() {
        this._start();
    }

    /**
     * Debug
     */
    _createDebugFolder() {
        if (!this.$debugger) return;

        const debugFolder = this.$debugger.addFolder({ title: 'Scene Grid' });

        return debugFolder;
    }
}
