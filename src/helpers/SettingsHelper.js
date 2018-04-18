'use strict';

import Store from 'electron-store';

const settingsStore = new Store({
    name: 'settings'
});

let cachedItems = {};

export default class SettingsHelper {
    static set(key, value) {
        settingsStore.set(key, value);

        delete cachedItems[key];
    }

    static get(key, fallback) {
        if (!cachedItems.hasOwnProperty(key)) {
            const res = settingsStore.get(key, undefined);
            if (res !== undefined) {
                cachedItems[key] = res;
            }
        }

        return (cachedItems.hasOwnProperty(key)) ? cachedItems[key] : fallback;
    }
}