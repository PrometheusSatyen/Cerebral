'use strict';

import rp from 'request-promise-native';
import queryString from 'querystring';

import AuthorizedCharacter from '../../models/AuthorizedCharacter';

import appProperties from './../../../resources/properties';
import SettingsHelper from '../SettingsHelper';

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

    redirect(scopes) {
        return this.constructUrl('authorize', {
            response_type: 'code',
            redirect_uri: 'eveauth-cerebral://callback',
            client_id: this.clientId,
            scope: scopes.join(' '),
            state: 'login'
        });
    }

    async authorize(code) {
        let options = {
            method: 'POST',
            uri: this.constructUrl('token'),
            formData: {
                grant_type: 'authorization_code',
                code: code
            },
            headers: {
                'User-Agent': `cerebral/${appProperties.version} ${appProperties.author_email}`,
                'Authorization': 'Basic ' + new Buffer(this.clientId + ":" + this.clientSecret).toString('base64')
            }
        };

        let body = JSON.parse(await rp(options));
        let tokenData = {
            accessToken: body.access_token,
            accessTokenExpiry: new Date(new Date().getTime() + (body.expires_in * 1000)),
            refreshToken: body.refresh_token
        };
        let charData = await this.verify(body.access_token);

        return new AuthorizedCharacter(
            charData.characterId,
            tokenData.accessToken,
            tokenData.accessTokenExpiry,
            tokenData.refreshToken,
            charData.characterOwnerHash,
            charData.scopes
        );
    }

    async verify(accessToken) {
        let options = {
            method: 'GET',
            uri: this.constructUrl('verify'),
            headers: {
                'User-Agent': `cerebral/${appProperties.version} ${appProperties.author_email}`,
                'Authorization': 'Bearer ' + accessToken
            }
        };

        let body = JSON.parse(await rp(options));

        return {
            characterId: body.CharacterID,
            characterName: body.CharacterName,
            scopes: body.Scopes.split(' '),
            type: body.TokenType,
            characterOwnerHash: body.CharacterOwnerHash
        };
    }

    /**
     * Request a new access token using a refresh token
     *
     * @param {string} refreshToken - previously issued
     * @returns {Promise<{accessToken: string, accessTokenExpiry: Date}>}
     * @throws {{error: string, error_description: string, error_uri: string}} error body as defined in
     * https://tools.ietf.org/html/rfc6749#section-5.2 or undefined if an unknown error occured
     */
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
                'Authorization': 'Basic ' + new Buffer(this.clientId + ":" + this.clientSecret).toString('base64')
            },
            resolveWithFullResponse: true,
            simple: false
        };

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
                return {
                    accessToken: body.access_token,
                    accessTokenExpiry: new Date(new Date().getTime() + (body.expires_in * 1000)),
                };
            case 400:
            case 401:
            case 403:
                if ((body.hasOwnProperty('error')) && (body.error !== undefined) && (body.error !== '')) {
                    throw body;
                } else {
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