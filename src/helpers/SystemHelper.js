'use strict';

import EsiClient from './eve/EsiClient';
import Store from 'electron-store';

let things = undefined;
const thingsStore = new Store({
    name: 'systems-data'
});
let thingsLastUsed = 0;
let thingsSaveTimeout;

export default class SystemHelper {
    static async resolveSystem(id) {
        SystemHelper.require();

        if (!things.hasOwnProperty(id)) {
            let client = new EsiClient();
            things[id] = await client.get('universe/systems/' + id, 'v3', {}, false, false);
            SystemHelper.save();
        }

        return things[id];
    }

    static doMaintenance() {
        if ((things !== undefined) && (thingsLastUsed + 10000 < new Date().getTime())) {
            SystemHelper.saveImmediately();
            things = undefined;
        }
    }

    static require() {
        thingsLastUsed = new Date();

        if (things === undefined) {
            things = thingsStore.get('things');
            if (things === undefined) {
                things = {};
            }
        }
    }

    static save() {
        if (things !== undefined) {
            if (thingsSaveTimeout !== undefined) {
                clearTimeout(thingsSaveTimeout);
            }

            thingsSaveTimeout = setTimeout(() => {
                thingsStore.set('things', things);
            }, 10000);
        }
    }

    static saveImmediately() {
        if (things !== undefined) {
            if (thingsSaveTimeout !== undefined) {
                clearTimeout(thingsSaveTimeout);
            }

            thingsStore.set('things', things);
        }
    }
}

setInterval(SystemHelper.doMaintenance, 5000);