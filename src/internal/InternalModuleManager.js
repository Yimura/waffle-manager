import { ModuleManagerProxy } from "./ModuleManagerProxy";
import { ModuleProxy } from "./ModuleProxy";

export class InternalModuleManager extends ModuleManagerProxy {
    /**
     * Cache in which all module instances are stored by their name
     * @private
     * @type {Map}
     */
    #cache = new Map();
    /**
     * A map with scope name as key and another map with the instances of those scoped modules
     * @private
     * @type {Map}
     */
    #scope = new Map();

    constructor() {
        super();
    }

    /**
     * Register a module that has a scope defined
     * @param {Object} instance The instance to register
     */
    addScoped(instance) {
        const { group, name } = instance.scope;
        if (!group || !name)
            throw new Error(`MODULES | Scoped module registered with either scope name not set or the module it's scoped name not set.`);

        const scope = this.getScope(group, true);
        if (scope.has(name))
            throw new Error(`MODULES | Duplicate scoped module name error, module "${instance.name}" is trying to register "${name}" to scope "${group}"`);

        scope.set(name, instance);
    }

    /**
     * Notifies the modules that contain a cleanup method to remove
     */
    async cleanup() {
        for (const module of this._cache.values())
            if (typeof module.cleanup == 'function') await module.cleanup();
    }

    /**
     * Get a module by its name/identifier
     * @param {string} moduleName Name/Identifier of the module
     * @returns The module instance
     */
    get(moduleName) {
        return this._cache.get(moduleName);
    }

    /**
     * Get the group holding modules
     * @param {string} scopeName The scope name that holds those Modules
     * @param {boolean} [create=false] If the group should be create if it doesn't exist
     * @returns {Map} The map holding the modules
     */
    getScope(scopeName, create = false) {
        if (!this._scope.has(scopeName) && create)
            this._scope.set(scopeName, new Map());
        return this._scope.get(scopeName);
    }

    /**
     * Get a module from a group
     * @param {string} scopeName The scope name that holds the requested module
     * @param {string} moduleName The name/identifier of the module
     * @returns The module instance from that scope
     */
    getFromScope(scopeName, moduleName) {
        return this.getGroup(scopeName)?.get(moduleName);
    }

    /**
     * Returns if the module name is registered
     * @param {string} moduleName The name/identifier of the module
     * @returns {boolean} True if it exists, false if not
     */
    has(moduleName) {
        return this._cache.has(moduleName);
    }

    /**
     * Loads the modules from a given path
     * @param {Object} main General data to pass to all modules
     * @param {string} path The path from which the modules should be loaded
     */
    async load(main, path) {
        const modules = ImportDir(path, { recurse: true, recurseDepth: 1 });
        
        await this.#registerModules(main, modules);
        await this.#initModules(main);
    }

    /**
     * @private
     * @param {Object} main The main instance of your program to pass to all the modules
     */
    async #initModules(main) {
        for (const [ name, instance ] of this._cache) {
            if (instance.requires) {
                for (const requirement of instance.requires) {
                    if (!this.has(requirement)) {
                        throw new Error(`MODULES | Module "${name}" has an unmet requirement "${requirement}"`);
                    }
                }
            }

            if (instance.events) {
                for (const _event of instance.events) {
                    if (_event.mod) {
                        const mod = this._cache.get(_event.mod);
                        if (mod) {
                            mod.on(_event.name, instance[_event.call].bind(instance));

                            continue;
                        }
                    }

                    if (typeof main.on === 'function') main.on(_event.name, instance[_event.call].bind(instance));
                }
            }
        }

        for (const instance of this._cache.values()) {
            if (typeof instance.init === 'function' && !await instance.init())
                throw new Error(`MODULES | Module "${instance.name} failed to initialise."`);
        }
    }

    async #registerModules(main, modules, parentName = 'root') {
        for (const bit in modules) {
            if (modules[bit] instanceof Promise) {
                const { ModuleClasses, ModuleConstants, ModuleInfo, ModuleInstance } = await modules[bit];
                if (ModuleInfo.disabled)
                    continue;
                
                if (this.has(ModuleInfo.name))
                    throw new Error(`MODULES | Duplicate module name error: "${instance.name}"`);

                const instance = new ModuleInstance(main);

                const moduleProxy = new ModuleProxy({
                    classes: ModuleClasses,
                    constants: ModuleConstants,
                    info: ModuleInfo,
                    instance: new ModuleInstance(main)
                });
                this.#cache.set(ModuleInfo.name, moduleProxy);
                

                continue;
            }

            await this.#registerModules(main, modules[bit], bit);
        }
    }
}