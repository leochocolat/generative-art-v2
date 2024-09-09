// Vendor
import { PerspectiveCamera } from 'three';
import { component } from 'webgl/vendor/bidello';

export default class CameraDefault extends component(PerspectiveCamera) {
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
    }

    /**
     * Getters & Setters
     */
    get enabled() {
        return this._enabled;
    }

    set enabled(enabled) {
        this._enabled = enabled;
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
        const savedSettings = JSON.parse(localStorage.getItem('camera-default-settings'));
        const savedPosition = JSON.parse(localStorage.getItem('camera-default-position'));
        const savedRotation = JSON.parse(localStorage.getItem('camera-default-rotation'));

        if (savedSettings && savedSettings.fov) this.fov = savedSettings.fov;
        if (savedSettings && savedSettings.near) this.near = savedSettings.near;
        if (savedSettings && savedSettings.far) this.far = savedSettings.far;

        if (savedPosition && savedPosition.x) this.position.x = savedPosition.x;
        if (savedPosition && savedPosition.y) this.position.y = savedPosition.y;
        if (savedPosition && savedPosition.z) this.position.z = savedPosition.z;

        if (savedRotation && savedRotation.x) this.rotation.x = savedRotation.x;
        if (savedRotation && savedRotation.y) this.rotation.y = savedRotation.y;
        if (savedRotation && savedRotation.z) this.rotation.z = savedRotation.z;

        this.updateProjectionMatrix();
    }

    /**
     * Update
     */
    onUpdate() {
        if (!this._enabled) return;
    }

    /**
     * Private
     */
    _bindAll() {
        this._updateCameraSettingsHandler = this._updateCameraSettingsHandler.bind(this);
        this._resetSettingsClickHandler = this._resetSettingsClickHandler.bind(this);
    }

    /**
     * Window Resize
     */
    onWindowResize(dimensions) {
        this.aspect = dimensions.innerWidth / dimensions.innerHeight;
        this.updateProjectionMatrix();
    }

    /**
     * Handlers
     */
    _updateCameraSettingsHandler() {
        const settings = {
            fov: this.fov,
            near: this.near,
            far: this.far,
        };

        localStorage.setItem('camera-default-settings', JSON.stringify(settings));
        localStorage.setItem('camera-default-position', JSON.stringify(this.position));
        localStorage.setItem('camera-default-rotation', JSON.stringify({ x: this.rotation.x, y: this.rotation.y, z: this.rotation.z }));

        this.updateProjectionMatrix();
    }

    _resetSettingsClickHandler() {
        localStorage.removeItem('camera-default-settings');
        localStorage.removeItem('camera-default-position');
        localStorage.removeItem('camera-default-rotation');

        this._initialize();

        this.$debugger.refresh();
    }

    /**
     * Debug
     */
    _createDebugFolder() {
        if (!this._debug) return;

        const folder = this._debug.addFolder({ title: 'Default', expanded: false });
        folder.addInput(this, 'fov').on('change', this._updateCameraSettingsHandler);
        folder.addInput(this, 'near').on('change', this._updateCameraSettingsHandler);
        folder.addInput(this, 'far').on('change', this._updateCameraSettingsHandler);
        folder.addInput(this, 'position').on('change', this._updateCameraSettingsHandler);
        folder.addInput(this, 'rotation').on('change', this._updateCameraSettingsHandler);
        folder.addButton({ label: ' ', title: 'Reset settings' }).on('click', this._resetSettingsClickHandler);

        return folder;
    }
}
