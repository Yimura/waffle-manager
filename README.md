# Waffle Manager

Waffle Manager is a global singleton manager I wrote for myself in NodeJS.
It checks for 

## Over Simplified Usage

```js
import Modules from 'waffle-manager';
import { resolve as resolvePath } from 'path';

const dataToPassToModules = {};

await Modules.load(dataToPassToModules, resolvePath('./src/modules'));

// do your stuff

// make sure our modules can do their cleanup if they have a cleanup method
await Modules.cleanup();

// exit your program
process.exit();
```

## Mock Module

```js
import BaseCommand from './structures/BaseCommand.js'; // some mock class that we'd like to expose
import ModuleBuilder from './src/ModuleBuilder.js';

export const ModuleClasses = {
    BaseCommand
};

export const ModuleInfo = new ModuleBuilder('commandHandler')
    .addEventListener('client', 'message', '_onMessage')
    .addRequired('client')
    .setScope('internal', 'commandRegistrar');

export default class CommandHandler {
    constructor(main) {

    }

    _onMessage(message) {

    }

    async init() {


        return true;
    }

    async initScope() {


        return true;
    }
}
```