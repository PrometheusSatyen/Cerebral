'use strict';

import EsiClient from './eve/EsiClient';
import Store from 'electron-store';

let types = undefined;
const typesStore = new Store({
    name: 'types-data'
});
let typesLastUsed = 0;
let typesSaveTimeout;

export default class TypeHelper {
    static async resolveType(id) {
        TypeHelper.require();

        if (!types.hasOwnProperty(id)) {
            let client = new EsiClient();
            types[id] = await client.get('universe/types/' + id, 'v3', {}, false, false);
            TypeHelper.save();
        }

        return types[id];
    }

    static doMaintenance() {
        if ((types !== undefined) && (typesLastUsed + 10000 < new Date().getTime())) {
            TypeHelper.saveImmediately();
            types = undefined;
        }
    }

    static require() {
        typesLastUsed = new Date();

        if (types === undefined) {
            types = typesStore.get('types');
            if (types === undefined) {
                types = {};
            }
        }
    }

    static save() {
        if (types !== undefined) {
            if (typesSaveTimeout !== undefined) {
                clearTimeout(typesSaveTimeout);
            }

            typesSaveTimeout = setTimeout(() => {
                typesStore.set('types', types);
            }, 10000);
        }
    }

    static saveImmediately() {
        if (types !== undefined) {
            if (typesSaveTimeout !== undefined) {
                clearTimeout(typesSaveTimeout);
            }

            typesStore.set('types', types);
        }
    }
}

setInterval(TypeHelper.doMaintenance, 5000);