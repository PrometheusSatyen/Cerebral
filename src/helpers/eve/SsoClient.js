'use strict';

import rp from 'request-promise-native';
import queryString from 'querystring';

import appProperties from './../../../resources/properties';
import SettingsHelper from '../SettingsHelper';
import log from 'electron-log';

export default class SsoClient {

    constructor(options) {
        if (options === undefined) {
            options = {};
        }

        this.ssoBaseUrl = options.hasOwnProperty('ssoBaseUrl') ? options['ssoBaseUrl'] : appProperties.eve_sso_url;
        this.clientId = options.hasOwnProperty('clientId') ?
            options['clientId'] : SettingsHelper.get('eve_client_id', '');
        this.clientSecret = options.hasOwnProperty('clientSecret') ?
            options['clientSecret'] : SettingsHelper.get('eve_client_secret', '');

        if ((this.clientId === '') || (this.clientSecret === '')) {
            throw 'No configured EVE client id/secret';
        }
    }

    async refresh(refreshToken) {
        let options = {
            method: 'POST',
            uri: this.constructUrl('token'),
            formData: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            },
            headers: {
                'User-Agent': `cerebral/${appProperties.version} ${appProperties.author_email}`,
                'Authorization': 'Basic ' + Buffer.from(this.clientId + ":" + this.clientSecret).toString('base64')
            },
            resolveWithFullResponse: true,
            simple: false
        };

        log.verbose("[SSOv1] Sending refresh request, refresh token = " + refreshToken);
        let res;
        try {
            res = await rp(options);
        } catch(err) {
            throw undefined;
        }

        let body = res.body;
        if ((typeof body === 'string') && (body !== '')) {
            body = JSON.parse(body);
        }

        switch(res.statusCode) {
            case 200:
                log.verbose(`[SSOv1] Refresh successful, old refresh token = ${refreshToken}, new access token = ${body.access_token}`);
                return {
                    accessToken: body.access_token,
                    accessTokenExpiry: new Date(new Date().getTime() + (body.expires_in * 1000)),
                };
            case 400:
            case 401:
            case 403:
                if ((body.hasOwnProperty('error')) && (body.error !== undefined) && (body.error !== '')) {
                    log.verbose(`[SSOv1] Refresh failed, refresh token = ${refreshToken}, error: ${body.error}`);
                    throw body;
                } else {
                    log.verbose(`[SSOv1] Refresh failed, refresh token = ${refreshToken}, error: ${body.error}`);
                    throw undefined;
                }
            default:
                throw undefined;

        }
    }

    /**
     * Construct an sso request url from an endpoint and query parameters
     *
     * @param {string} endpoint - endpoint name, e.g. authorize
     * @param {object} query - query string parameters
     * @returns {string} request url
     */
    constructUrl(endpoint, query) {
        let baseUrl = SsoClient.trimSlashes(this.ssoBaseUrl);
        let trimmedEndpoint = SsoClient.trimSlashes(endpoint);

        if (query !== null) {
            return baseUrl + '/' + trimmedEndpoint + '/?' + queryString.stringify(query);
        } else {
            return baseUrl + '/' + trimmedEndpoint + '/';
        }
    }

    /**
     * Trim leading and trailing slashes from a string
     *
     * @param {string} str - string to trim
     * @return {string} trimmed string
     */
    static trimSlashes(str) {
        return str.replace(/^\/+|\/+$/g, '');
    }
}