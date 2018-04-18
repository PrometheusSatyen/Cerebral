'use strict';

import Store from 'electron-store';

import EsiClient from './eve/EsiClient';
import appProperties from '../../resources/properties';

let types = undefined;
const typesStore = new Store({
    name: 'types-data'
});
let typesLastUsed = 0;
let typesSaveTimeout;

const cachePolicy = appProperties.cache_policies.types;

export default class TypeHelper {
    static async resolveType(id) {
        TypeHelper.require();

        if ((!types.hasOwnProperty(id)) || (TypeHelper.needsRefresh(types[id]))) {
            let client = new EsiClient();
            let type = await client.get('universe/types/' + id, 'v3');
            type.group = await client.get('universe/groups/' + type.group_id, 'v1');

            type.meta = TypeHelper.buildMeta();
            types[id] = type;
            TypeHelper.save();
        }


        return types[id];
    }

    static buildMeta() {
        const randomComponent = Math.floor(Math.random() * cachePolicy.deviation);

        return {
            date: new Date(),
            next: new Date(new Date().getTime() + ((cachePolicy.base + randomComponent) * 1000))
        };
    }

    static needsRefresh(thing) {
        return (
            (!thing.hasOwnProperty('meta')) ||
            (new Date(thing.meta.next) < new Date()) ||
            (new Date(thing.meta.date) < (cachePolicy.invalid_before * 1000))
        );
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