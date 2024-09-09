// Utils
import EventDispatcher from 'utils/EventDispatcher';

export default class ComponentUI extends EventDispatcher {
    constructor(options = {}) {
        super();

        // Props
        this.$app = options.app;
        this.$el = options.el;
        this.$name = options.name;

        // Setup
        this.$refs = this.__getRefs();
    }

    /**
     * Private
     */
    __getRefs() {
        const elements = this.$el.querySelectorAll('[data-ref]');
        const refs = {};

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];

            // Prevent pushing refs from another component
            const parent = element.closest('[data-component]');
            if (parent !== this.$el) return;

            refs[element.dataset.ref] = element;
        }

        return refs;
    }
}
