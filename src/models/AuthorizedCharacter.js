'use strict';

import keytar from 'keytar';
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

            if (accessToken !== undefined) {
                this.setAccessToken(accessToken);
            }

            if (refreshToken !== undefined) {
                this.setRefreshToken(refreshToken);
            }
        }

        this.accessTokenExpiry = accessTokenExpiry;
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

    async setAccessToken(token) {
        this.accessToken = token;

        try {
            await keytar.setPassword(appProperties.keytar_service_name, `character-${this.id}-access-token`, token);
        } catch(err) {
            throw err;
        }
    }

    async setRefreshToken(token) {
        this.refreshToken = token;

        try {
            await keytar.setPassword(appProperties.keytar_service_name, `character-${this.id}-refresh-token`, token);
        } catch(err) {
            throw err;
        }
    }

    async loadTokensFromSecureStorage() {
        const service = appProperties.keytar_service_name;

        if (this.accessToken === undefined) {
            try {
                const res = await keytar.getPassword(service, `character-${this.id}-access-token`);
                this.accessToken = (res !== null) ? res : undefined;
            } catch(err) {}
        }

        if (this.refreshToken === undefined) {
            try {
                const res = await keytar.getPassword(service, `character-${this.id}-refresh-token`);
                this.refreshToken = (res !== null) ? res : undefined;
            } catch(err) {}
        }
    }

    async refresh() {
        let client = new SsoClient();
        let res = await client.refresh(this.refreshToken);

        this.accessTokenExpiry = res.accessTokenExpiry;
        await this.setAccessToken(res.accessToken);
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
                    let fileCharacter = rawCharacters[id];              // character from file
                    let newCharacter = new AuthorizedCharacter();       // build a new character object

                    // if there are tokens in the file character then we need to migrate to secure storage
                    const service = appProperties.keytar_service_name;
                    if (fileCharacter.hasOwnProperty('accessToken')) {
                        keytar.setPassword(service, `character-${id}-access-token`, fileCharacter.accessToken);
                    }
                    if (fileCharacter.hasOwnProperty('refreshToken')) {
                        keytar.setPassword(service, `character-${id}-refresh-token`, fileCharacter.refreshToken);
                    }

                    Object.assign(newCharacter, fileCharacter);         // copy properties
                    newCharacter.id = id.toString();                    // force string for id

                    newCharacter.loadTokensFromSecureStorage();         // load tokens from secure storage

                    newCharacters[newCharacter.id] = newCharacter;
                });
            }

            authorizedCharacters = newCharacters;
        }
    }

    async save() {
        if (authorizedCharacters !== undefined) {
            authorizedCharacters[this.id] = this;

            // we have to strip tokens from the objects before flushing them to (unencrypted) disk storage
            let tokensStripped = {};
            for(const id in authorizedCharacters) {
                if (authorizedCharacters.hasOwnProperty(id)) {
                    let char = {};
                    Object.assign(char, authorizedCharacters[id]);
                    delete char.accessToken;
                    delete char.refreshToken;

                    tokensStripped[id] = char;
                }
            }

            authorizedCharactersStore.set('authorizedCharacters', tokensStripped);
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