import { InternalModuleManager } from './internal/InternalModuleManager.js'

class ModuleManager {
    static #instance;

    constructor() {
        throw new Error("Can't initialize ModuleManager directly...");
    }

    /**
     * @returns {InternalModuleManager}
     */
    static getInstance() {
        if (!ModuleManager.#instance) ModuleManager.#instance = new InternalModuleManager();
        return ModuleManager.#instance;
    }
}

export default ModuleManager.getInstance();