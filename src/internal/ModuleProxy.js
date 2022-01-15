/**
 * @param {Object} target The Object/Class/Function to be proxied
 * @param {string} prop The property being accessed
 * @param {Object} receiver Either the proxy or an object that inherits from the proxy
 */
const get = (target, prop, receiver) => {
    switch (prop) {
        case 'classes':
            return target.classes;
        case 'constants':
            return target.constants;
        case 'info':
            return target.info;
    }

    return Reflect.get(target.instance, prop, receiver);
}

export class ModuleProxy {
    constructor(moduleData) {
        return new Proxy(moduleData, {
            get
        });
    }
}