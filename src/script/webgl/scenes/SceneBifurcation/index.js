// Vendor
import { Scene, Mesh, PlaneGeometry, ShaderMaterial, MeshBasicMaterial } from 'three';
import { component } from 'webgl/vendor/bidello';
import { ResourceManager } from '@cosmicshelter/resource-loader';

// Config
import config from './config';
import settings from './settings';

// Modules
import CameraManager from 'webgl/modules/CameraManager';

// Shaders
import fragment from 'webgl/shaders/bifurcation/fragment.glsl';
import vertex from 'webgl/shaders/bifurcation/vertex.glsl';

export default class SceneBifurcation extends component(Scene) {
    init(options = {}) {
        // Props

        // Setup
        this._bindAll();

        this._config = config;

        this._debugFolder = this._createDebugFolder();
        this._cameraManager = this._createCameraManager();
        this._resourceManager = this._createResourceManager();

        this._planeGeometry = this._createPlaneGeometry();
        this._planeMaterial = this._createPlaneMaterial();
        this._planeMesh = this._createPlaneMesh();

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
        return this._cameraManager.camera;
    }

    /**
     * Private
     */
    _start() {
            
    }

    _createPlaneGeometry() {
        const geometry = new PlaneGeometry(1, 1, 1);
        return geometry;
    }

    _createPlaneMaterial() {
        const material = new ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                uTime: { value: 0 },
                uNoiseScale: { value: settings.noiseScale },
                uSpeed: { value: settings.speed },
            },
        });
        return material;
    }

    _createPlaneMesh() {
        const mesh = new Mesh(this._planeGeometry, this._planeMaterial);
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
     * Components
     */
    _createComponents() {
        const components = {};

        return components;
    }

    _destroyComponents() {
        if (!this._components) return;

        for (const key in this._components) {
            if (typeof this._components[key].destroy === 'function') this._components[key].destroy();
        }
    }

    /**
     * Update
     */
    onUpdate({ time, deltaTime, frame }) {
        this._planeMaterial.uniforms.uTime.value = time;
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

        this.$debugger.registerFile(settings, settings.file);

        const settingsChangedHandler = () => {
            this._planeMaterial.uniforms.uNoiseScale.value.x = settings.noiseScale.x;  
            this._planeMaterial.uniforms.uNoiseScale.value.y = settings.noiseScale.y;
            this._planeMaterial.uniforms.uSpeed.value = settings.speed;
        };

        const debugFolder = this.$debugger.addFolder({ title: `Scene ${config.name}` });
        debugFolder.addInput(settings.noiseScale, 'x', { lable: 'Scale X', stepSize: 0.1 }).on('change', settingsChangedHandler);
        debugFolder.addInput(settings.noiseScale, 'y', { lable: 'Scale Y', stepSize: 0.1 }).on('change', settingsChangedHandler);
        debugFolder.addInput(settings, 'speed', { lable: 'Speed', stepSize: 0.001 }).on('change', settingsChangedHandler);

        return debugFolder;
    }
}
