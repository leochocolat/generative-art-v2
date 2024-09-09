// Vendor
import { BoxGeometry, Color, DirectionalLight, Mesh, MeshBasicMaterial, MeshNormalMaterial, MeshPhongMaterial, MeshStandardMaterial, Object3D, TextureLoader } from 'three';
import { component } from 'webgl/vendor/bidello';
import ResourceLoader from '@cosmicshelter/resource-loader';

// Settings
import settings from './settings';

export default class ComponentBox extends component(Object3D) {
    init(options) {
        // Props
        this._debug = options.debugFolder;

        // Setup
        this._geometry = this._createGeometry();
        this._material = this._createMaterial();
        this._mesh = this._createMesh();
        this._debugFolder = this._createDebugFolder();
    }

    /**
     * Lifecycle
     */
    destroy() {
        super.destroy();
        this._geometry.dispose();
        this._material.dispose();
    }

    /**
     * Private
     */
    _createGeometry() {
        const geometry = new BoxGeometry(1, 1, 1);

        return geometry;
    }

    _createMaterial() {
        const material = new MeshNormalMaterial();

        return material;
    }

    _createMesh() {
        const mesh = new Mesh(this._geometry, this._material);
        this.add(mesh);
        return mesh;
    }

    /**
     * Update
     */
    onUpdate({ time, deltaTime, frame }) {
        // this._mesh.rotation.x = time;
        // this._mesh.rotation.y = time;
        // this._mesh.rotation.z = time;
    }

    /**
     * Window Resize
     */
    onWindowResize(dimensions) {
        this._resize();
    }

    _resize() {
        this._mesh.scale.set(settings.scale, settings.scale, settings.scale);
    }

    /**
     * Debug
     */
    _createDebugFolder() {
        if (!this._debug) return;

        const folder = this._debug.addFolder({ title: 'Box' });

        folder.addInput(settings, 'scale').on('change', () => { this._resize(); });

        this.$debugger.on('save', () => {
            this.$debugger.save(settings, settings.file).then((e) => {
                if (e.status === 200) console.log(`Successfully saved file: ${settings.file}`);
            });
        });

        return folder;
    }
}
