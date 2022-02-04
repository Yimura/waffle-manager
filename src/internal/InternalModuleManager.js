import ImportDir from '@yimura/import-dir';
import { ModuleManagerProxy } from "./ModuleManagerProxy.js";
import { ModuleProxy } from "./ModuleProxy.js";

export class InternalModuleManager extends ModuleManagerProxy {
    /**
     * Cache in which all module instances are stored by their name
     * @private
     * @type {Map}
     */
    _cache = new Map();
    /**
     * A map with scope name as key and another map with the instances of those scoped modules
     * @private
     * @type {Map}
     */
    _scope = new Map();

    constructor() {
        super();
    }

    /**
     * Register a module that has a scope defined
     * @param {Object} instance The instance to register
     */
    addScoped(instance) {
        const { group, name } = instance.info.scope;
        if (!group || !name)
            throw new Error(`MODULES | Scoped module registered with either scope name not set or the module it's scoped name not set.`);

        const scope = this.getScope(group, true);
        if (scope.has(name))
            throw new Error(`MODULES | Duplicate scoped module name error, module "${instance.info.name}" is trying to register "${name}" to scope "${group}"`);

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
        for (const [ name, mod ] of this._cache) {
            if (mod.info.requires)
                for (const requirement of mod.info.requires)
                    if (!this.has(requirement))
                        throw new Error(`MODULES | Module "${name}" has an unmet requirement "${requirement}"`);

            if (mod.info.events)
                for (const _event of mod.info.events)
                    this._cache.get(_event.mod)?.on(_event.name, mod[_event.call].bind(mod));
        }

        for (const mod of this._cache.values())
            if (typeof mod.init === 'function' && !await mod.init())
                throw new Error(`MODULES | Module "${mod.info.name} failed to initialise."`);
    }

    async #registerModules(main, modules, parentName = 'root') {
        for (const bit in modules) {
            if (modules[bit] instanceof Promise) {
                const { ModuleClasses, ModuleConstants, ModuleInfo, ModuleInstance } = await modules[bit];
                if (ModuleInfo.disabled)
                    continue;

                if (this.has(ModuleInfo.name))
                    throw new Error(`MODULES | Duplicate module name error: "${ModuleInfo.name}"`);

                const moduleProxy = new ModuleProxy({
                    classes: ModuleClasses,
                    constants: ModuleConstants,
                    info: ModuleInfo,
                    instance: new ModuleInstance(main)
                });
                this._cache.set(ModuleInfo.name, moduleProxy);

                if (ModuleInfo.scope)
                    this.addScoped(moduleProxy);

                continue;
            }

            await this.#registerModules(main, modules[bit], bit);
        }
    }
}
