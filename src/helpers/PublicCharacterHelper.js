'use strict';

import Store from 'electron-store';

import EsiClient from './eve/EsiClient';

let things = undefined;
const thingsStore = new Store({
    name: 'public-characters-data'
});
let thingsLastUsed = 0;
let thingsSaveTimeout;

export default class PublicCharacterHelper {
    static async resolveCharacter(id) {
        PublicCharacterHelper.require();

        if (!things.hasOwnProperty(id)) {
            let client = new EsiClient();
            things[id] = await client.get('characters/' + id, 'v4');
            PublicCharacterHelper.save();
        }

        return things[id];
    }

    static doMaintenance() {
        if ((things !== undefined) && (thingsLastUsed + 10000 < new Date().getTime())) {
            PublicCharacterHelper.saveImmediately();
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

setInterval(PublicCharacterHelper.doMaintenance, 5000);