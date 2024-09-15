// Vendor
import gsap from 'gsap';
import { LinearSRGBColorSpace, NearestFilter, SRGBColorSpace, WebGLRenderTarget, WebGLRenderer } from 'three';
import { GPUStatsPanel } from 'three/examples/jsm/utils/GPUStatsPanel.js';
import Stats from 'stats-js';
import bidello from 'webgl/vendor/bidello';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Settings
import settings from './settings';

// Utils
import WindowResizeObserver from 'utils/WindowResizeObserver';

// Scenes
import scenes from 'webgl/scenes';

const BUFFER_WIDTH = 32;
const BUFFER_HEIGHT = 32;

gsap.ticker.fps(20);

export default class WebGLApplication {
    constructor(options = {}) {
        // Props
        this._app = options.app;
        this._canvas = options.canvas;
        this._debugger = options.debugger;

        // Setup
        this._chaussette = this._createChaussette();
        this._debugCanvas2D = this._createDebugCanvas2D();
        this._pixelBufferPrevious = this._createPixelBuffer();
        this._pixelBufferCurrent = this._createPixelBuffer();
        this._renderer = this._createRenderer();
        this._composer = this._createComposer();
        this._renderTargetSmall = this._createRenderTargetSmall();

        this._registerBidelloGlobals();

        this._stats = this._createStats();
        this._statsGpuPanel = this._createStatsGpuPanel();

        this._bindAll();
        this._setupEventListeners();

        WindowResizeObserver.triggerResize();
    }

    /**
     * Public
     */
    start() {
        this._scene = this._createScene();

        this._passes = this._createPasses();

        this._setupDebugger();
    }

    destroy() {
        this._removeEventListeners();
        this._removeStats();
        if (this._scene && this._scene.destroy) this._scene.destroy();
    }

    /**
     * Private
     */
    _createChaussette() {
        const serverUrl = 'ws:///172.16.2.10:1111/';
        const webSocket = new WebSocket(serverUrl);

        return webSocket;
    }

    _createDebugCanvas2D() {
        const width = 500;
        const height = 500;
        const canvas = document.createElement('canvas');
        canvas.context = canvas.getContext('2d');
        // document.body.appendChild(canvas);
        canvas.width = width;
        canvas.height = height;
        canvas.style.position = 'fixed';
        canvas.style.right = 0;
        canvas.style.top = 0;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.backgroundColor = 'red';
        canvas.style.border = 'solid 1px black';
        return canvas;
    }

    _createPixelBuffer() {
        return new Uint8Array(BUFFER_WIDTH * BUFFER_HEIGHT * 4); // 4 channels: RGBA
    }

    _createRenderer() {
        const renderer = new WebGLRenderer({
            canvas: this._canvas,
            powerPreference: 'high-performance',
            antialias: true,
            transparent: false,
        });
        
        return renderer;
    }

    _createComposer() {
        const renderTarget = new WebGLRenderTarget(0, 0, { samples: 2 });
        const composer = new EffectComposer(this._renderer, renderTarget);
        return composer;
    }

    _createRenderTargetSmall() {
        const renderTarget = new WebGLRenderTarget(BUFFER_WIDTH, BUFFER_HEIGHT, {
            minFilter: NearestFilter,
            magFilter: NearestFilter,
        });
        return renderTarget;
    }

    _createPasses() {
        const passes = {};
        passes.render = this._createRenderPass();
        passes.bokeh = this._createBokehPass();
        passes.output = this._createOutputPass();
        return passes;
    }

    _createRenderPass() {
        const renderPass = new RenderPass(this._scene, this._scene.camera);
        this._composer.addPass(renderPass);
        return renderPass;
    }

    _createBokehPass() {
        const bokehPass = new BokehPass(this._scene, this._scene.camera, {
            focus: settings.postprocessing.bokeh.focus,
            aperture: settings.postprocessing.bokeh.aperture,
            maxblur: settings.postprocessing.bokeh.maxblur,
        });
        bokehPass.enabled = settings.postprocessing.bokeh.enabled;
        this._composer.addPass(bokehPass);
        return bokehPass;
    }

    _createOutputPass() {
        const outputPass = new OutputPass();
        this._composer.addPass(outputPass);
        return outputPass;
    }

    _createScene() {
        const urlParams = new URLSearchParams(location.search);
        const sceneName = urlParams.get('scene');
        const scene = scenes[sceneName] ? new scenes[sceneName]() : new scenes.main();
        return scene;
    }

    /**
     * Stats
     */
    _createStats() {
        const stats = new Stats();
        // document.body.appendChild(stats.dom);
        return stats;
    }

    _createStatsGpuPanel() {
        const panel = new GPUStatsPanel(this._renderer.getContext());
        this._stats.addPanel(panel);
        this._stats.showPanel(0);
        return panel;
    }

    _removeStats() {
        if (!this._stats) return;
        document.body.removeChild(this._stats.dom);
        this._stats = null;
    }

    _registerBidelloGlobals() {
        bidello.registerGlobal('root', this);
        bidello.registerGlobal('app', this._app);
        bidello.registerGlobal('chaussette', this._chaussette);
        bidello.registerGlobal('renderer', this._renderer);
        bidello.registerGlobal('debugger', this._debugger);
    }

    /**
     * Resize
     */
    _resize(dimensions) {
        this._resizeRenderer(dimensions);
        this._resizeComposer(dimensions);
        this._triggerBidelloResize(dimensions);
    }

    _resizeRenderer(dimensions) {
        this._renderer.setPixelRatio(dimensions.dpr);
        this._renderer.setSize(dimensions.innerWidth, dimensions.innerHeight, true);
    }

    _resizeComposer(dimensions) {
        this._composer.setSize(dimensions.innerWidth, dimensions.innerHeight);
    }

    _triggerBidelloResize(dimensions) {
        bidello.trigger({ name: 'windowResize', fireAtStart: true }, dimensions);
    }

    /**
     * On Tick
     */
    _tick({ time, deltaTime, frame }) {
        this._stats.begin();

        this._update({ time, deltaTime, frame });
        this._render({ time, deltaTime, frame });

        this._stats.end();
    }

    _update({ time, deltaTime, frame }) {
        this._triggerBidelloUpdate({ time, deltaTime, frame });
    }

    _triggerBidelloUpdate({ time, deltaTime, frame }) {
        bidello.trigger(
            { name: 'update', fireAtStart: false },
            { time, deltaTime, frame },
        );
    }

    _render() {
        this._statsGpuPanel.startQuery();

        if (this._scene) {
            this._renderer.setRenderTarget(this._renderTargetSmall);
            this._renderer.render(this._scene, this._scene.camera);

            this._renderer.setRenderTarget(null);
            this._renderer.render(this._scene, this._scene.camera);

            this._pixelBufferPrevious.set(this._pixelBufferCurrent);
            this._renderer.readRenderTargetPixels(this._renderTargetSmall, 0, 0, BUFFER_WIDTH, BUFFER_HEIGHT, this._pixelBufferCurrent);

            this._drawDebugBuffer();
            // this._sendBuffer();
            this._sendFilteredBuffer();
        }
        
        // if (this._composer) this._composer.render();
        this._statsGpuPanel.endQuery();
    }

    _flipBufferVertically(buffer, width, height) {
        
    }

    _sendBuffer() {
        this._chaussette.send(this._pixelBufferCurrent);   
        console.log('Sending full buffer');
    }

    _sendFilteredBuffer() {
        const newData = [];

        let ledIndex = 0;

        for (let y = 0; y < BUFFER_HEIGHT; y++) {
            for (let x = 0; x < BUFFER_WIDTH; x++) {
                const i = (y * BUFFER_HEIGHT + x) * 4;

                // current
                const r0 = this._pixelBufferCurrent[i];
                const g0 = this._pixelBufferCurrent[i + 1];
                const b0 = this._pixelBufferCurrent[i + 2];
                // const a0 = this._pixelBufferCurrent[i + 3];

                const r1 = this._pixelBufferPrevious[i];
                const g1 = this._pixelBufferPrevious[i + 1];
                const b1 = this._pixelBufferPrevious[i + 2];
                // const a1 = this._pixelBufferPrevious[i + 3];

                const threshold = 0;
                const rDiff = Math.abs(r1 - r0) > threshold;
                const gDiff = Math.abs(g1 - g0) > threshold;
                const bDiff = Math.abs(b1 - b0) > threshold;

                if (rDiff || gDiff || bDiff) {
                    newData.push({ index: ledIndex, red: r0, green: g0, blue: b0 });
                }

                ledIndex++;
            }
        }
        
        // Length => 2 * RGB * newData.length;
        const dataLength = newData.length * 5;
        const data = new Uint8Array(dataLength);

        for (let i = 0; i < newData.length; i++) {
            const item = newData[i];

            const indexHighByte = (item.index >> 8) & 0xFF;
            const indexLowByte = item.index & 0xFF;

            data.set([indexHighByte, indexLowByte, item.red, item.green, item.blue], i * 5);
        }
                
        if (data.length > 0 && this._chaussette.readyState === 1) {
            console.log('SEND', data);
            this._chaussette.send(data);
        }
    }

    _drawDebugBuffer() {
        for (let y = 0; y < BUFFER_HEIGHT; y++) {
            for (let x = 0; x < BUFFER_WIDTH; x++) {
                const i = (y * BUFFER_HEIGHT + x) * 4;

                const posX = x;
                const posY = (BUFFER_HEIGHT - 1) - y;

                // current
                const r0 = this._pixelBufferCurrent[i];
                const g0 = this._pixelBufferCurrent[i + 1];
                const b0 = this._pixelBufferCurrent[i + 2];

                // Draw
                this._debugCanvas2D.context.fillStyle = `rgba(${r0}, ${g0}, ${b0}, 1)`;
                this._debugCanvas2D.context.fillRect(posX * this._debugCanvas2D.width / BUFFER_WIDTH, posY * this._debugCanvas2D.height / BUFFER_HEIGHT, this._debugCanvas2D.width / BUFFER_WIDTH, this._debugCanvas2D.height / BUFFER_HEIGHT);
            }
        }
    }

    /**
     * Bind All
     */
    _bindAll() {
        this._tickHandler = this._tickHandler.bind(this);
        this._resizeHandler = this._resizeHandler.bind(this);
        this._chaussetteMessageHandler = this._chaussetteMessageHandler.bind(this);
    }

    /**
     * Events
     */
    _setupEventListeners() {
        WindowResizeObserver.addEventListener('resize', this._resizeHandler);
        gsap.ticker.add(this._tickHandler);
        this._chaussette.addEventListener('message', this._chaussetteMessageHandler);
    }

    _removeEventListeners() {
        WindowResizeObserver.removeEventListener('resize', this._resizeHandler);
        gsap.ticker.remove(this._tickHandler);
    }

    /**
     * Handlers
     */
    _chaussetteMessageHandler(e) {
        
    }

    _tickHandler(time, deltaTime, frame) {
        this._tick({ time, deltaTime, frame });
    }

    _resizeHandler(dimensions) {
        this._resize(dimensions);
    }

    /**
     * Debugger
     */
    _setupDebugger() {
        if (!this._debugger) return;

        const settingsChangedHandler = () => {
            this._passes.bokeh.enabled = settings.postprocessing.bokeh.enabled;
            this._passes.bokeh.uniforms.focus.value = settings.postprocessing.bokeh.focus;
            this._passes.bokeh.uniforms.aperture.value = settings.postprocessing.bokeh.aperture;
            this._passes.bokeh.uniforms.maxblur.value = settings.postprocessing.bokeh.maxblur;
        };

        const folderPostprocessing = this._debugger.addFolder({ title: 'Postprocessing' });
        const folderBokeh = folderPostprocessing.addFolder({ title: 'Bokeh' });
        folderBokeh.addInput(settings.postprocessing.bokeh, 'enabled').on('change', settingsChangedHandler);
        folderBokeh.addInput(settings.postprocessing.bokeh, 'focus').on('change', settingsChangedHandler);
        folderBokeh.addInput(settings.postprocessing.bokeh, 'aperture', { step: 0.0001 }).on('change', settingsChangedHandler);
        folderBokeh.addInput(settings.postprocessing.bokeh, 'maxblur').on('change', settingsChangedHandler);

        this._debugger.on('save', () => {
            this._debugger.save(settings, settings.file).then((e) => {
                if (e.status === 200) console.log(`Successfully saved file: ${settings.file}`);
            });
        });
    }
}
