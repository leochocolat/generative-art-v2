// Vendor
import { Color, Scene } from 'three';
import { component } from 'webgl/vendor/bidello';
import { ResourceManager } from '@cosmicshelter/resource-loader';

// Config
import config from './config';

// Modules
import CameraManager from 'webgl/modules/CameraManager';

// Components
import ComponentBox from 'webgl/components/ComponentBox';

export default class SceneSample extends component(Scene) {
    init(options = {}) {
        // Props

        // Setup
        this._bindAll();

        this._config = config;

        this._debugFolder = this._createDebugFolder();
        this._cameraManager = this._createCameraManager();
        this._resourceManager = this._createResourceManager();

        this._setupEventListeners();

        // this.background = new Color('red');
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
        this._components = this._createComponents();
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
        const components = {
            box: this._createComponentBox(),
        };

        return components;
    }

    _createComponentBox() {
        const box = new ComponentBox({
            debugFolder: this._debugFolder,
        });
        this.add(box);
        return box;
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

        const debugFolder = this.$debugger.addFolder({ title: 'Scene Sample' });

        return debugFolder;
    }
}
