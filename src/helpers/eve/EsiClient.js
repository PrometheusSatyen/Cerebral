'use strict';

import rp from 'request-promise-native';
import log from 'electron-log';

import appProperties from './../../../resources/properties';

export default class EsiClient {

    constructor(options) {
        if (options === undefined) {
            options = {};
        }

        this.esiBaseUrl = options.hasOwnProperty('esiBaseUrl') ? options['esiBaseUrl'] : appProperties.eve_esi_url;
        this.dataSource = options.hasOwnProperty('dataSource') ?
            options['dataSource'] : appProperties.eve_default_data_source;
        this.token = undefined;
    }

    async authChar(authorizedCharacter) {
        this.token = await authorizedCharacter.getAccessToken();
        this.scopes = authorizedCharacter.scopes;
    }

    async get(endpoint, version, requiredScopes, options) {
        return await this.request('GET', endpoint, version, requiredScopes, options);
    }

    async post(endpoint, version, requiredScopes, options) {
        return await this.request('POST', endpoint, version, requiredScopes, options);
    }

    async request(method, endpoint, version, requiredScopes, options) {
        if (requiredScopes === undefined) {
            requiredScopes = [];
        } else if (typeof requiredScopes === 'string') {
            requiredScopes = [requiredScopes];
        }

        if (requiredScopes.length > 0) {
            for(const scope of requiredScopes) {
                if (!this.scopes.includes(scope)) {
                    log.warn(`[ESI] Skipping ${method} ${endpoint}.${version}, scope missing.`);
                    throw 'Scope missing';
                }
            }
        }

        if (options === undefined) {
            options = {};
        }

        let requestOptions = {
            method: method,
            uri: this.constructUrl(endpoint, version),
            qs: {},
            headers: {
                'User-Agent': `cerebral/${appProperties.version} ${appProperties.author_email}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        if (options.hasOwnProperty('query')) {
            requestOptions['qs'] = options['query'];
        }

        if (this.token !== undefined) {
            requestOptions['headers']['Authorization'] = 'Bearer ' + this.token;
        }

        if (options.hasOwnProperty('body')) {
            requestOptions['body'] = options['body'];
            requestOptions['json'] = true;
        }

        requestOptions['qs']['datasource'] = this.dataSource;

        try {
            log.verbose(`[ESI] Firing ${method} ${endpoint}.${version}...`);
            let body = await rp(requestOptions);
            return (typeof body === 'string') ? JSON.parse(body) : body;
        } catch(err) {
            log.warn(`[ESI] Failed ${method} ${endpoint}.${version}, retrying...`);
            try {
                let body = await rp(requestOptions);
                return (typeof body === 'string') ? JSON.parse(body) : body;
            } catch(err) {
                log.warn( `[ESI] Failed x2 ${method} ${endpoint}.${version}, throwing error.`);
                throw err;
            }
        }
    }

    constructUrl(endpoint, version) {
        let baseUrl = EsiClient.trimSlashes(this.esiBaseUrl);
        let trimmedEndpoint = EsiClient.trimSlashes(endpoint);
        let trimmedVersion = EsiClient.trimSlashes(version);

        return (trimmedVersion !== '') ?
            baseUrl + '/' + trimmedVersion + '/' + trimmedEndpoint  + '/':
            baseUrl + '/' + trimmedEndpoint + '/';
    }

    static trimSlashes(str) {
        return str.replace(/^\/+|\/+$/g, '');
    }
}