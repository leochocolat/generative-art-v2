// Vendor
import { component } from 'webgl/vendor/bidello';

// Cameras
import CAMERAS from './cameras';

export default class CameraManager extends component() {
    init(options = {}) {
        // Props
        this._types = options.types || ['Default'];
        this._debug = options.debugFolder || this.$debugger;

        // Setup
        this._bindAll();

        this._settings = {
            active: this._types[0],
        };

        this._debugFolder = this._createDebugFolder();
        this._cameras = this._createCameras();

        this._camera = this._cameras[this._settings.active];

        this._camera.enabled = true;
    }

    /**
     * Getters & Setters
     */
    get camera() {
        return this._camera;
    }

    get cameras() {
        return this._cameras;
    }

    /**
     * Public
     */
    getCamera(type = 'Default') {
        if (!this._cameras[type]) throw Error(`No camera with type: "${type}" was found`);

        return this._cameras[type];
    }

    /**
     * Private
     */
    _createCameras() {
        const cameras = {};

        for (let i = 0; i < this._types.length; i++) {
            const type = this._types[i];

            if (!CAMERAS[type]) throw Error(`No camera with type: "${type}" was found`);

            cameras[type] = new CAMERAS[type]({
                debugFolder: this._debugFolder,
            });
        }

        return cameras;
    }

    _updateActiveCamera(camera) {
        this._camera.enabled = false;
        this._camera = camera;
        this._camera.enabled = true;
    }

    _bindAll() {
        this._activeCameraChangedHandler = this._activeCameraChangedHandler.bind(this);
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
     * Debug
     */
    _createDebugFolder() {
        if (!this._debug) return;

        const cameraOptions = {};
        for (let i = 0; i < this._types.length; i++) {
            const type = this._types[i];
            cameraOptions[type] = type;
        }

        const folder = this._debug.addFolder({ title: 'Camera' });
        folder.addInput(this._settings, 'active', { label: 'Active', options: cameraOptions }).on('change', this._activeCameraChangedHandler);

        return folder;
    }

    _activeCameraChangedHandler() {
        const newCamera = this._cameras[this._settings.active];
        this._updateActiveCamera(newCamera);
    }
}
