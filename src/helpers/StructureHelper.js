'use strict';

import Store from 'electron-store';

import SystemHelper from './SystemHelper';
import TypeHelper from './TypeHelper';

let things = undefined;
const thingsStore = new Store({
    name: 'structures-data'
});
let thingsLastUsed = 0;
let thingsSaveTimeout;

export default class StructureHelper {
    static async resolveStructure(id, client, clientCharacterId) { // an authenticated client needs to be passed
        StructureHelper.require();

        if (
            (!things.hasOwnProperty(id)) || // if the structure isn't cached
            (
                (things[id].hasOwnProperty('failed')) && // or the structure is cached as FAILED
                (
                    (!things[id].characterIdsAttempted.includes(clientCharacterId)) || // and a pull hasn't been attempted with this character
                    (false) // or a pull hasn't been attempted with this character in > 30 days (TODO!)
                )
            )
        ) {
            try {
                things[id] = await client.get('universe/structures/' + id, 'v1');

                // ccp can't seem to make up their minds between "system_id" and "solar_system_id"
                // we're going with "system_id" EVERYWHERE in this app
                things[id].system_id = things[id].solar_system_id;
                delete things[id].solar_system_id;

                things[id].system = await SystemHelper.resolveSystem(things[id].system_id);
                things[id].type = await TypeHelper.resolveType(things[id].type_id);
                delete things[id].type.dogma_attributes;
                delete things[id].type.dogma_effects;
            } catch (err) {
                if (err.statusCode === 403) {
                    if (!things.hasOwnProperty(id)) {
                        things[id] = {};
                    }
                    if (!things[id].hasOwnProperty('characterIdsAttempted')) {
                        things[id].characterIdsAttempted = [];
                    }

                    things[id].failed = true;
                    things[id].characterIdsAttempted.push(clientCharacterId);
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

    static removeCharacterIdFromAttemptedLists(characterId) {
        characterId = characterId.toString();

        StructureHelper.require();

        for(const structureId in things) {
            if (things.hasOwnProperty(structureId)) {
                if (things[structureId].hasOwnProperty('characterIdsAttempted')) {
                    const i = things[structureId].characterIdsAttempted.indexOf(characterId);
                    console.log(characterId);
                    console.log(i);
                    if (i !== -1) {
                        things[structureId].characterIdsAttempted.splice(i, 1);
                    }
                }
            }
        }

        StructureHelper.save();
    }
}

setInterval(StructureHelper.doMaintenance, 5000);