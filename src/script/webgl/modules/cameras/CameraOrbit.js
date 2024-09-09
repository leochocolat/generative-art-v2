// Vendor
import { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { component } from 'webgl/vendor/bidello';

export default class CameraOrbit extends component(PerspectiveCamera) {
    init(options = {}) {
        // Props
        this._debug = options.debugFolder;

        // Setup
        this._bindAll();

        this._initialSettings = {
            fov: 45,
            near: 1,
            far: 1000,
            position: {
                x: 0,
                y: 0,
                z: 5,
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0,
            },
        };

        this._initialize();
        this._applySavedSettings();

        this._enabled = false;
        this._debugFolder = this._createDebugFolder();
        this._controls = this._createCameraControls();

        this._setupEventListeners();
    }

    /**
     * Lifecycle
     */
    destroy() {
        super.destroy();

        this._controls.dispose();
        this._removeEventListeners();
    }

    /**
     * Getters & Setters
     */
    get enabled() {
        return this._enabled;
    }

    set enabled(enabled) {
        this._enabled = enabled;
        this._controls.enabled = enabled;
    }

    /**
     * Private
     */
    _initialize() {
        this.fov = this._initialSettings.fov;
        this.near = this._initialSettings.near;
        this.far = this._initialSettings.far;

        this.position.x = this._initialSettings.position.x;
        this.position.y = this._initialSettings.position.y;
        this.position.z = this._initialSettings.position.z;

        this.rotation.x = this._initialSettings.rotation.x;
        this.rotation.y = this._initialSettings.rotation.y;
        this.rotation.z = this._initialSettings.rotation.z;

        this.updateProjectionMatrix();
    }

    _applySavedSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('camera-orbit-settings'));
        const savedPosition = JSON.parse(localStorage.getItem('camera-orbit-position'));
        const savedRotation = JSON.parse(localStorage.getItem('camera-orbit-rotation'));

        if (savedSettings && savedSettings.fov) this.fov = savedSettings.fov;
        if (savedSettings && savedSettings.near) this.near = savedSettings.near;
        if (savedSettings && savedSettings.far) this.far = savedSettings.far;

        if (savedPosition) this.position.x = savedPosition.x;
        if (savedPosition) this.position.y = savedPosition.y;
        if (savedPosition) this.position.z = savedPosition.z;

        if (savedRotation) this.rotation.x = savedRotation.x;
        if (savedRotation) this.rotation.y = savedRotation.y;
        if (savedRotation) this.rotation.z = savedRotation.z;

        this.updateProjectionMatrix();
    }

    _createCameraControls() {
        const controls = new OrbitControls(this, this.$renderer.domElement);
        controls.update();
        return controls;
    }

    _bindAll() {
        this._controlsChangeHandler = this._controlsChangeHandler.bind(this);
        this._updateCameraSettingsHandler = this._updateCameraSettingsHandler.bind(this);
        this._resetSettingsClickHandler = this._resetSettingsClickHandler.bind(this);
    }

    /**
     * Update
     */
    onUpdate() {
        if (!this._enabled) return;
    }

    /**
     * Window Resize
     */
    onWindowResize(dimensions) {
        // this.aspect = dimensions.innerWidth / dimensions.innerHeight;
        this.aspect = 1;
        this.updateProjectionMatrix();
    }

    /**
     * Events
     */
    _setupEventListeners() {
        this._controls.addEventListener('change', this._controlsChangeHandler);
    }

    _removeEventListeners() {
        this._controls.removeEventListener('change', this._controlsChangeHandler);
    }

    /**
     * Handlers
     */
    _controlsChangeHandler(e) {
        localStorage.setItem('camera-orbit-position', JSON.stringify(this.position));
        localStorage.setItem('camera-orbit-target', JSON.stringify(this._controls.target));
    }

    _updateCameraSettingsHandler() {
        const settings = {
            fov: this.fov,
            near: this.near,
            far: this.far,
        };

        localStorage.setItem('camera-orbit-settings', JSON.stringify(settings));

        this.updateProjectionMatrix();
    }

    _resetSettingsClickHandler() {
        localStorage.removeItem('camera-orbit-settings');
        localStorage.removeItem('camera-orbit-position');
        localStorage.removeItem('camera-orbit-rotation');

        this._initialize();

        this.$debugger.refresh();
    }

    /**
     * Debug
     */
    _createDebugFolder() {
        if (!this._debug) return;

        const folder = this._debug.addFolder({ title: 'Orbit', expanded: false });
        folder.addInput(this, 'fov').on('change', this._updateCameraSettingsHandler);
        folder.addInput(this, 'near').on('change', this._updateCameraSettingsHandler);
        folder.addInput(this, 'far').on('change', this._updateCameraSettingsHandler);
        folder.addButton({ label: ' ', title: 'Reset settings' }).on('click', this._resetSettingsClickHandler);

        return folder;
    }
}
