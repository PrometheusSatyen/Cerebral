'use strict';

const Store = require('electron-store');

import SsoClient from '../helpers/eve/SsoClient';
import appProperties from '../../resources/properties';

let authorizedCharacters;
const authorizedCharactersStore = new Store({
    name: 'authorized-characters'
});

class AuthorizedCharacter {
    constructor(id, accessToken, accessTokenExpiry, refreshToken, ownerHash, scopes) {
        this.id = id;
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
                    newCharacters[id] = new AuthorizedCharacter();
                    Object.assign(newCharacters[id], rawCharacters[id])
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
    }
}

AuthorizedCharacter.load();

export default AuthorizedCharacter;