'use strict';

import Store from 'electron-store';

import SystemHelper from './SystemHelper';

let things = undefined;
const thingsStore = new Store({
    name: 'structures-data'
});
let thingsLastUsed = 0;
let thingsSaveTimeout;

export default class StructureHelper {
    static async resolveStructure(id, client) { // an authenticated client needs to be passed
        StructureHelper.require();

        if (
            (!things.hasOwnProperty(id)) || // if the structure isn't cached
            (
                (things[id].hasOwnProperty('failed')) && // or the structure is cached but FAILED
                (false) // and last fetch was > 7 days ago (TODO!)
            )
        ) {
            try {
                things[id] = await client.get('universe/structures/' + id, 'v1');

                // ccp can't seem to make up their minds between "system_id" and "solar_system_id"
                // we're going with "system_id" EVERYWHERE in this app
                things[id].system_id = things[id].solar_system_id;
                delete things[id].solar_system_id;

                things[id].system = await SystemHelper.resolveSystem(things[id].system_id);
            } catch (err) {
                if (err.statusCode === 403) {
                    things[id] = {
                        failed: true,
                        fetchDate: new Date()
                    };
                }
            }

            StructureHelper.save();
        }

        return (!things[id].hasOwnProperty('failed')) ? things[id] : undefined;
    }

    static doMaintenance() {
        if ((things !== undefined) && (thingsLastUsed + 10000 < new Date().getTime())) {
            StructureHelper.saveImmediately();
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

setInterval(StructureHelper.doMaintenance, 5000);