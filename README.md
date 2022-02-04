# Waffle Manager

Waffle Manager is a global singleton manager I wrote for myself in NodeJS.
It checks for 

## Mock Module

```js
import { ModuleBuilder } from 'waffle-manager';
import BaseCommand from './structures/BaseCommand.js'; // some mock class that we'd like to expose

export const ModuleConstants = {
    SystemReset: {
        state: 0,
        name: 'SomeThing'
    }
};

export const ModuleClasses = {
    BaseCommand
};

export const ModuleInfo = new ModuleBuilder('commandHandler')
    .addEventListener('client', 'message', '_onMessage')
    .addRequired('client')
    .setScope('internal', 'commandRegistrar');

export default class CommandHandler {
    /**
     * @param {object} global_data First argument passed to Modules#load() 
     */
    constructor(global_data) {

    }

    /**
     * @param {object} message  
     */
    _onMessage(message) {
        console.log(message);
    }

    /**
     * @param a1 test argument 
     */
    register(a1) {
        console.log('Logging register call, ', a1);
    }

    /**
     * @returns {boolean} True on success, false otherwise 
     */
    async init() {
        // do some fancy async init
        console.log('CommandHandler module started');

        return true;
    }
}
```

## Using said mock module

### Import Waffle-Manager
```js
import Modules from 'waffle-manager';
```

### Load Modules on app startup
```js
import { resolve as resolvePath } from 'path';

await Modules.load(null, resolvePath('./src/modules'));
```

### Call cleanup on modules
```js
// make sure our modules can do their cleanup if they have a cleanup method
await Modules.cleanup();

// exit your program
process.exit();
```

### Access Methods from modules

```js
Modules.commandHandler.register("call to register");
```

### Access classes exported from modules

```js
class SomeCommand extends Modules.commandHandler.classes.BaseCommand {
    constructor() {
        super();
    }
}
```

### Access constants exported from modules

```js
const { SystemReset } = Modules.commandHandler.constants;

console.log(SystemReset.state);
```