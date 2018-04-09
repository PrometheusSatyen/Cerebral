'use strict';

import Store from 'electron-store';

import EsiClient from './eve/EsiClient';
import SystemHelper from './SystemHelper';
import TypeHelper from './TypeHelper';

let things = undefined;
const thingsStore = new Store({
    name: 'stations-data'
});
let thingsLastUsed = 0;
let thingsSaveTimeout;

export default class StationHelper {
    static async resolveStation(id) {
        StationHelper.require();

        if (!things.hasOwnProperty(id)) {
            let client = new EsiClient();
            things[id] = await client.get('universe/stations/' + id, 'v2');
            things[id].system = await SystemHelper.resolveSystem(things[id].system_id);
            things[id].type = await TypeHelper.resolveType(things[id].type_id);
            delete things[id].type.dogma_attributes;
            delete things[id].type.dogma_effects;
            StationHelper.save();
        }

        return things[id];
    }

    static doMaintenance() {
        if ((things !== undefined) && (thingsLastUsed + 10000 < new Date().getTime())) {
            StationHelper.saveImmediately();
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

setInterval(StationHelper.doMaintenance, 5000);