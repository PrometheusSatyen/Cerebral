'use strict';

import rp from 'request-promise-native';
import queryString from 'querystring';

import AuthorizedCharacter from '../../models/AuthorizedCharacter';

import appProperties from './../../../resources/properties';

export default class SsoClient {

    constructor(options) {
        if (options === undefined) {
            options = {};
        }

        this.ssoBaseUrl = options.hasOwnProperty('ssoBaseUrl') ? options['ssoBaseUrl'] : appProperties.eve_sso_url;
        this.clientId = options.hasOwnProperty('clientId') ? options['clientId'] : appProperties.eve_client_id;
        this.clientSecret = options.hasOwnProperty('clientSecret') ?
            options['clientSecret'] : appProperties.eve_client_secret;
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
                'User-Agent': 'cerebral/' + process.env.npm_package_version + ' prometheussatyen@gmail.com',
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
                'User-Agent': 'cerebral/' + process.env.npm_package_version + ' prometheussatyen@gmail.com',
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

    async refresh(refreshToken) {
        let options = {
            method: 'POST',
            uri: this.constructUrl('token'),
            formData: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            },
            headers: {
                'User-Agent': 'cerebral/' + process.env.npm_package_version + ' prometheussatyen@gmail.com',
                'Authorization': 'Basic ' + new Buffer(this.clientId + ":" + this.clientSecret).toString('base64')
            }
        };

        let body = JSON.parse(await rp(options));

        return {
            accessToken: body.access_token,
            accessTokenExpiry: new Date(new Date().getTime() + (body.expires_in * 1000)),
        };
    }

    constructUrl(endpoint, query) {
        let baseUrl = SsoClient.trimSlashes(this.ssoBaseUrl);
        let trimmedEndpoint = SsoClient.trimSlashes(endpoint);

        if (query !== null) {
            return baseUrl + '/' + trimmedEndpoint + '/?' + queryString.stringify(query);
        } else {
            return baseUrl + '/' + trimmedEndpoint + '/';
        }
    }

    static trimSlashes(str) {
        return str.replace(/^\/+|\/+$/g, '');
    }
}