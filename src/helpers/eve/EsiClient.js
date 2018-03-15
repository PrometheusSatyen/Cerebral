'use strict';

const rp = require('request-promise-native');

import appProperties from './../../../resources/properties';

import logger from '../Logger';

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

    auth(token) {
        this.token = token;
    }

    async get(endpoint, version, options) {
        return await this.request('GET', endpoint, version, options);
    }

    async request(method, endpoint, version, options) {
        if (options === undefined) {
            options = {};
        }

        let requestOptions = {
            method: method,
            uri: this.constructUrl(endpoint, version),
            qs: {},
            headers: {
                'User-Agent': 'cerebral/' + process.env.npm_package_version + ' prometheussatyen@gmail.com',
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
            logger.log('verbose', `Firing ${method} ${endpoint}.${version}...`);
            let body = await rp(requestOptions);
            return JSON.parse(body);
        } catch(err) {
            logger.log('info', `FAILED ${method} ${endpoint}.${version}, retrying...`);
            try {
                let body = await rp(requestOptions);
                return JSON.parse(body);
            } catch(err) {
                logger.log('info', `FAILED x2 ${method} ${endpoint}.${version}, throwing error.`);
                throw err;
            }
        }
    }

    constructUrl(endpoint, version) {
        let baseUrl = EsiClient.trimSlashes(this.esiBaseUrl);
        let trimmedEndpoint = EsiClient.trimSlashes(endpoint);
        let trimmedVersion = EsiClient.trimSlashes(version);

        return baseUrl + '/' + trimmedVersion + '/' + trimmedEndpoint;
    }

    static trimSlashes(str) {
        return str.replace(/^\/+|\/+$/g, '');
    }
}