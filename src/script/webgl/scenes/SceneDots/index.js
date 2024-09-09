// Vendor
import { BoxGeometry, Mesh, MeshNormalMaterial, Object3D, Scene, ShaderMaterial } from 'three';
import { component } from 'webgl/vendor/bidello';
import { ResourceManager } from '@cosmicshelter/resource-loader';

// Config
import config from './config';
import settings from './settings';

// Modules
import CameraManager from 'webgl/modules/CameraManager';

// Shaders
import vertex from 'webgl/shaders/dots/vertex.glsl';
import fragment from 'webgl/shaders/dots/fragment.glsl';
import math from '@/script/utils/math';

export default class SceneDots extends component(Scene) {
    init(options = {}) {
        // Props

        // Setup
        this._bindAll();

        this._config = config;

        this._debugFolder = this._createDebugFolder();
        this._cameraManager = this._createCameraManager();
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
        return this._cameraManager.camera;
    }

    /**
     * Private
     */
    _start() {
        this._components = this._createComponents();

        this._material = this._createMaterials();

        this._container = this._createContainer();
        this._cubes = this._createCubes();
        this._updateCubes();
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

    _createMaterials() {
        const material = new ShaderMaterial({
            // depthTest: false,
            // depthWrite: false,
            // wireframe: true,
            transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                uStrokeWidth: { value: settings.cubes.strokeWidth },
                uStrokeSmoothness: { value: settings.cubes.strokeSmoothness },
            },
        });

        // const material = new MeshNormalMaterial();

        return material;
    }

    _createContainer() {
        const container = new Object3D();
        this.add(container);
        return container;
    }

    _createCubes() {
        const size = 1;
        const amount = 100;

        const cubes = [];
        const geometry = new BoxGeometry(size, size, size);
        const material = this._material;
        const mesh = new Mesh(geometry, material);

        for (let i = 0; i < amount; i++) {
            const cube = mesh.clone();
            cube.renderOrder = amount - i;
            cubes.push(cube);
            this._container.add(cube);
        }

        return cubes;
    }

    _updateCubes() {
        const positionRangeX = settings.cubes.positionRangeX;
        const positionRangeY = settings.cubes.positionRangeY;
        const positionRangeZ = settings.cubes.positionRangeZ;
        const minScale = settings.cubes.minScale;
        const scaleRange = settings.cubes.scaleRange;

        for (let i = 0; i < this._cubes.length; i++) {
            const cube = this._cubes[i];
            const scale = minScale + math.randomFromRange(0, scaleRange);
            cube.position.x = math.randomFromRange(-positionRangeX, positionRangeX);
            cube.position.y = math.randomFromRange(-positionRangeY, positionRangeY);
            cube.position.z = math.randomFromRange(-positionRangeZ, positionRangeZ);
            cube.scale.set(scale, scale, scale);
        }
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
        this._container.rotation.x = time * settings.container.rotation.x;
        this._container.rotation.y = time * settings.container.rotation.y;
        this._container.rotation.z = time * settings.container.rotation.z;
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

        const settingsChangedHandler = () => {
            this._updateCubes();
        };

        const uniformsChangedHandler = () => {
            this._material.uniforms.uStrokeWidth.value = settings.cubes.strokeWidth;
            this._material.uniforms.uStrokeSmoothness.value = settings.cubes.strokeSmoothness;
        };

        const debugFolder = this.$debugger.addFolder({ title: `Scene ${this._config.name}` });
        const folderContainer = debugFolder.addFolder({ title: 'Container' });
        folderContainer.addInput(settings.container.rotation, 'x', { label: 'Rotation X' });
        folderContainer.addInput(settings.container.rotation, 'y', { label: 'Rotation Y' });
        folderContainer.addInput(settings.container.rotation, 'z', { label: 'Rotation Z' });
        const folderCubes = debugFolder.addFolder({ title: 'Cubes' });
        folderCubes.addInput(settings.cubes, 'positionRangeX', { label: 'Range X' }).on('change', settingsChangedHandler);
        folderCubes.addInput(settings.cubes, 'positionRangeY', { label: 'Range Y' }).on('change', settingsChangedHandler);
        folderCubes.addInput(settings.cubes, 'positionRangeZ', { label: 'Range Z' }).on('change', settingsChangedHandler);
        folderCubes.addInput(settings.cubes, 'minScale', { label: 'Min scale' }).on('change', settingsChangedHandler);
        folderCubes.addInput(settings.cubes, 'scaleRange', { label: 'Range scale' }).on('change', settingsChangedHandler);
        folderCubes.addInput(settings.cubes, 'strokeWidth', { label: 'Stroke width' }).on('change', uniformsChangedHandler);
        folderCubes.addInput(settings.cubes, 'strokeSmoothness', { label: 'Stroke smoothness' }).on('change', uniformsChangedHandler);
        folderCubes.addButton({ title: 'Randomize', label: '' }).on('click', settingsChangedHandler);

        this.$debugger.on('save', () => {
            this.$debugger.save(settings, settings.file).then((e) => {
                if (e.status === 200) console.log(`Successfully saved file: ${settings.file}`);
            });
        });

        return debugFolder;
    }
}
