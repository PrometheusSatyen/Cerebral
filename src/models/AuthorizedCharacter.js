'use strict';

const Store = require('electron-store');

import StructureHelper from '../helpers/StructureHelper';
import SsoClient from '../helpers/eve/SsoClient';
import Character from './Character';

import appProperties from '../../resources/properties';

let authorizedCharacters;
const authorizedCharactersStore = new Store({
    name: 'authorized-characters'
});

class AuthorizedCharacter {
    constructor(id, accessToken, accessTokenExpiry, refreshToken, ownerHash, scopes) {
        if (id !== undefined) {
            id = id.toString();
            this.id = id;
        }

        this.accessToken = accessToken;
        this.accessTokenExpiry = accessTokenExpiry;
        this.refreshToken = refreshToken;
        this.ownerHash = ownerHash;
        this.scopes = scopes;
    }

    async getAccessToken() {
        if (new Date(this.accessTokenExpiry).getTime() <= new Date().getTime() + 30000) { // at least 30 seconds of validity
            try {
                await this.refresh();
            } catch(err) {
                // should do something here i guess
            }
        }

        return this.accessToken;
    }

    async refresh() {
        let client = new SsoClient();
        let res = await client.refresh(this.refreshToken);

        this.accessToken = res.accessToken;
        this.accessTokenExpiry = res.accessTokenExpiry;

        this.save();

        return this.accessToken;
    }

    getScopeInfo() {
        let scopeInfo = [];

        for(const scope of appProperties.scopes) {
            scopeInfo.push({
                name: scope.name,
                description: scope.description,
                isGranted: this.scopes.includes(scope.name)
            });
        }

        return scopeInfo;
    }

    static getAll() {
        return authorizedCharacters;
    }

    static get(id) {
        return authorizedCharacters.hasOwnProperty(id) ? authorizedCharacters[id] : undefined;
    }

    static load() {
        if (authorizedCharacters === undefined) {
            let rawCharacters = authorizedCharactersStore.get('authorizedCharacters');
            let newCharacters = {};

            if (rawCharacters !== undefined) {
                Object.keys(rawCharacters).map(id => {
                    newCharacters[id.toString()] = new AuthorizedCharacter();
                    Object.assign(newCharacters[id.toString()], rawCharacters[id]);
                    newCharacters[id.toString()].id = id.toString()
                });
            }

            authorizedCharacters = newCharacters;
        }
    }

    save() {
        if (authorizedCharacters !== undefined) {
            authorizedCharacters[this.id] = this;
            authorizedCharactersStore.set('authorizedCharacters', authorizedCharacters);
        }

        // when a save is triggered, we can assume that a new token+scopes was just granted
        // we go into the structures cache and we clear this character id from anywhere it appears in an attempted list
        // this ensures that on next refresh structures will be attempted to be repulled
        StructureHelper.removeCharacterIdFromAttemptedLists(this.id);

        // we also mark for a force refresh
        Character.markCharacterForForceRefresh(this.id);
    }
}

AuthorizedCharacter.load();

export default AuthorizedCharacter;