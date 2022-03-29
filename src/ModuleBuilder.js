/**
 * @typedef {ModuleEventListener}
 * @type {object}
 * @property {string} name Name of the event
 * @property {string} call String representation of class method to call
 * @property {string} module Name of the module from which we should listen for events
 */

/**
 * ModuleBuilder is used to define the properties of your module
 * @class
 * @property {ModuleEventListener[]} events - Array of objects defining the events this module should listen on, class method that should be called and from which module the event is emitted.
 * @property {string} name - The name of this module
 * @property {string[]} required - Module names that are required for this module to function
 */
class ModuleBuilder {
    /**
     * @param {string} name The name of this module
     */
    constructor(name) {
        this.name = name;

        this.events = [];
        this.required = [];
    }

    /**
     * Add an event listener to this module
     * @param {string} module Name of the module that will emit the event
     * @param {string} name Name of the event that this module will emit
     * @param {string} call String representation of the class method to call with the event data
     */
    addEventListener(module, name, call) {
        this.events.push({
            module,
            name,
            call
        });

        return this;
    }

    /**
     * Add a required module
     * @param {string} name String identifier of the required module
     */
    addRequired(name) {
        this.required.push(name);

        return this;
    }

    /**
     * Marks this module as being disabled preventing it from loading
     * @param {boolean} toggle
     */
    setDisabled() {
        this.disabled = true;

        return this;
    }

    /**
     * Register this module for the scoped module list
     * @param {string} scope The scope that this module is part of
     * @param {string} name The custom name for this module within its scope
     */
    setScope(scope, name) {
        this.scope = { scope, name };

        return this;
    }

    /**
     * @returns {Object} JSON made through the module builder
     */
    toJSON() {
        return {
            disabled: this.disabled,

            name: this.name,
            events: this.events,
            required: this.required,
            scope: this.scope
        };
    }
}

export default ModuleBuilder;
