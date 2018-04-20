'use strict';

import CharacterHelper from '../helpers/CharacterHelper';

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
        this.lastRefresh = {};
    }

    async getAccessToken() {
        if (new Date(this.accessTokenExpiry).getTime() <= new Date().getTime() + 30000) { // at least 30 seconds of validity
            await this.refresh();
        }

        return this.accessToken;
    }

    refreshBlocked() {
        return (
            (this.lastRefresh.success === false) && // if last refresh was bad and
            (
                (this.lastRefresh.shouldRetry === false) || // we're never supposed to retry
                (new Date(this.lastRefresh.date) > new Date(new Date().getTime() - 300000)) // or we tried in last 5 min
            )
        );
    }

    async refresh() {
        if (this.refreshBlocked()) {
            throw this.lastRefresh.error;
        }

        let client = new SsoClient();

        this.lastRefresh.date = new Date();

        let res;
        try {
            res = await client.refresh(this.refreshToken);
        } catch(error) {
            this.lastRefresh.success = false;
            this.lastRefresh.error = error;
            this.save();

            switch(error.error) {
                // Failures due to revoked refresh tokens/belongs to bad client
                case 'invalid_grant':
                    this.lastRefresh.shouldRetry = false;
                    Character.get(this.id).markFailed('token');
                    break;

                // Failures due to bad client
                case 'invalid_client':
                case 'unauthorized_client':
                    this.lastRefresh.shouldRetry = false;
                    Character.get(this.id).markFailed('client');
                    break;

                // CCP's other weird responses
                case 'invalid_token':
                    if (error.error_description === 'The refresh token does not match the client specified.') {
                        this.lastRefresh.shouldRetry = false;
                        Character.get(this.id).markFailed('client');
                    }
                    break;

                // Some sort of other error, we'll delay refreshes temporarily
                default:
                    Character.get(this.id).markFailed('error', true);
                    break;
            }

            throw error;
        }

        this.lastRefresh.success = true;
        this.accessToken = res.accessToken;
        this.accessTokenExpiry = res.accessTokenExpiry;
        this.save();
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