// Utils
import DragManager from '@/script/utils/DragManager';
import WindowResizeObserver from '@/script/utils/WindowResizeObserver';
import { CanvasTexture, LinearFilter, NearestFilter } from 'three';

const WIDTH = 160;
const HEIGHT = 160;

const GRID_WIDTH = 32;
const GRID_HEIGHT = 32;

export default class Canvas2d {
    constructor(options = {}) {
        // Props
        this._debugger = options.debugger;
        this._element = options.element;
        this._chaussette = options.chaussette;

        // Setuo
        this._canvas = this._createCanvas();
        this._canvasTexture = this._createCanvasTexture();
        this._context = this._canvas.getContext('2d');
        this._hue = 0;
        // this._color = { value: 'rgba(10, 0, 0, 1)' };
        this._color = { value: 'rgba(50, 0, 0, 1)' };

        this._bindAll();
        this._setupEventListeners();

        this._debugFolder = this._createDebugFolder();
    }

    /**
     * Getters
     */
    get texture() {
        return this._canvasTexture;
    }

    /**
     * Public
     */
    destroy() {
        this._removeEventListeners();
    }

    /**
     * Private
     */
    _createCanvas() {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        // canvas.style.position = 'absolute';
        // canvas.style.right = '0';
        // canvas.style.top = '0';

        return canvas;
    }

    _createCanvasTexture() {
        const texture = new CanvasTexture(this._canvas);
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        return texture;   
    }

    /**
     * Update
     */
    update() {
        this._canvasTexture.needsUpdate = true;
        this._draw();
    }

    _draw() {
        // this._context.clearRect(0, 0, WIDTH, HEIGHT);

        this.drawGrid();
    }

    drawGrid() {

    }

    _drawRect(position) {
        this._hue += 1;
        this._hue = this._hue % 360;

        const gridItemWidth = Math.round(WIDTH / GRID_WIDTH);
        const gridItemHeight = Math.round(HEIGHT / GRID_HEIGHT);
        const x = position.x / WindowResizeObserver.innerWidth * WIDTH;
        const y = position.y / WindowResizeObserver.innerHeight * HEIGHT;
        const fractX = Math.floor(x / gridItemWidth) * gridItemWidth;
        const fractY = Math.floor(y / gridItemHeight) * gridItemHeight;

        // this._context.fillStyle = `hsl(${this._hue}, 100%, 50%)`;
        this._context.fillStyle = this._color.value;
        this._context.fillRect(fractX, fractY, gridItemWidth, gridItemHeight);

        // Debug arduino pixel indexes
        // const pixelX = fractX / gridItemWidth;
        // const pixelY = fractY / gridItemHeight;
        // const pixelIndex = pixelX + pixelY * GRID_WIDTH;
        // this._chaussette.send(`${pixelIndex}`);
    }

    /**
     * Events
     */
    _bindAll() {
        this._dragstartHandler = this._dragstartHandler.bind(this);
        this._dragHandler = this._dragHandler.bind(this);
    }

    _setupEventListeners() {
        this._dragManager = new DragManager({ el: this._element });
        this._dragManager.addEventListener('dragstart', this._dragstartHandler);
        this._dragManager.addEventListener('drag', this._dragHandler);
    }

    _removeEventListeners() {
        this._dragManager.destroy();
    }

    _dragstartHandler(e) {
        this._drawRect(e.position);
    }
    
    _dragHandler(e) {
        this._drawRect(e.position);
    }

    /**
     * Debug
     */
    _createDebugFolder() {
        if (!this._debugger) return;

        const folder = this._debugger.addFolder({ title: 'Canvas 2d' });
        folder.addInput(this._color, 'value');
    }
}
