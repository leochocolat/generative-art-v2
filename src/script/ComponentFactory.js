// Components
const COMPONENTS = {
    'sample': () => import('./components/Sample'),
};

export default class ComponentFactory {
    constructor(options = {}) {
        // Props
        this._app = options.app;

        // Setup
        this._selector = 'data-component';
        this._elements = document.querySelectorAll(`[${this._selector}]`);
        this._components = {};
    }

    /**
     * Getters & Setters
     */
    get components() {
        return this._components;
    }

    /**
     * Public
     */
    start() {
        for (let i = 0, limit = this._elements.length; i < limit; i++) {
            const element = this._elements[i];
            const componentName = element.getAttribute(this._selector);
            const componentId = element.getAttribute('data-id') || '';
            if (COMPONENTS[componentName]) {
                COMPONENTS[componentName]().then((value) => {
                    const component = new value.default({ el: element, name: componentName, app: this._app });
                    this._components[`${componentName}-${componentId}`] = component;
                });
            }
            else {
                console.log(`Component: '${componentName}' not found`);
            }
        }
    }

    destroy() {
        for (const key in this._components) {
            const component = this._components[key];
            if (component.destroy) component.destroy();
        }
    }
}
