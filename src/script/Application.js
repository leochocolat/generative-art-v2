// Vendor
import ResourceLoader from '@cosmicshelter/resource-loader';

// Loaders
import ThreeTextureLoader from '@cosmicshelter/loaders/three-texture-loader/src/index';
// import ThreeTextureLoader from '@cosmicshelter/loaders/three-texture-loader';

// Utils
import Debugger from 'utils/debugger';

// Config
import config from 'script/config';

// Modules
import ComponentFactory from './ComponentFactory';

// WebGL
import WebGLApplication from 'script/webgl';

class Application {
    constructor() {
        // Expose application
        window.__app__ = this;

        // Setup
        this._bindAll();

        this._resourceLoader = this._createResourceLoader();
        this._debugger = this._createDebugger();
        this._componentFactory = this._createComponentFactory();
        this._webglApplication = this._createWebGLApplication();

        this._setupEventListeners();
    }

    /**
     * Public
     */
    destroy() {
        this._resourceLoader.destroy();
        this._debugger.dispose();
        this._componentFactory.destroy();
        this._webglApplication.destroy();
        this._removeEventListeners();
    }

    /**
     * Private
     */
    _createResourceLoader() {
        ResourceLoader.registerLoader(ThreeTextureLoader, 'texture');

        const resourceLoader = new ResourceLoader();
        resourceLoader.add({ resources: config.resources, preload: true });
        resourceLoader.preload();
        return resourceLoader;
    }

    _createDebugger() {
        const debug = new Debugger();
        return debug;
    }

    _createComponentFactory() {
        const componentFactory = new ComponentFactory({ app: this });
        componentFactory.start();

        return componentFactory;
    }

    _createWebGLApplication() {
        const webglApplication = new WebGLApplication({
            canvas: document.querySelector('.js-canvas'),
            debugger: this._debugger,
            app: this,
        });
        return webglApplication;
    }

    _bindAll() {
        this._loadCompleteHandler = this._loadCompleteHandler.bind(this);
    }

    /**
     * Events
     */
    _setupEventListeners() {
        this._resourceLoader.addEventListener('complete', this._loadCompleteHandler);
    }
    
    _removeEventListeners() {
        this._resourceLoader.removeEventListener('complete', this._loadCompleteHandler);
    }

    /**
     * Handlers
     */
    _loadCompleteHandler() {
        this._webglApplication.start();
    }
}

export default Application;
