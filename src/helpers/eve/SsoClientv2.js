'use strict';

import rp from 'request-promise-native';
import queryString from 'querystring';
import log from 'electron-log';

import AuthorizedCharacter from '../../models/AuthorizedCharacter';

import appProperties from './../../../resources/properties';

import crypto from 'crypto';

export default class SsoClientv2 {

    constructor(options) {
        if (options === undefined) {
            options = {};
        }

        this.ssoBaseUrl = options.hasOwnProperty('ssoBaseUrl') ? options['ssoBaseUrl'] : appProperties.eve_sso_v2_url;
        this.clientId = options.hasOwnProperty('clientId') ? options['clientId'] : appProperties.eve_sso_client_id;
    }

    redirect(scopes, codeChallenge) {
        return this.constructUrl('authorize', {
            response_type: 'code',
            redirect_uri: 'https://localhost/callback',
            client_id: this.clientId,
            scope: scopes.join(' '),
            code_challenge: codeChallenge.challenge,
            code_challenge_method: 'S256',
            state: 'login'
        });
    }

    async authorize(code, challenge) {
        let options = {
            method: 'POST',
            uri: this.constructUrl('token'),
            body: `client_id=${this.clientId}&grant_type=authorization_code&code=${code}&code_verifier=${challenge.originalValue}`,
            headers: {
                'User-Agent': `cerebral/${appProperties.version} ${appProperties.author_email}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        log.verbose("[SSOv2] Sending authorize request, code = " + code);
        let body = JSON.parse(await rp(options));

        let tokenData = {
            accessToken: body.access_token,
            accessTokenExpiry: new Date(new Date().getTime() + (body.expires_in * 1000)),
            refreshToken: body.refresh_token
        };

        let charData = SsoClientv2.validate(body.access_token);

        log.verbose(`[SSOv2] Authorization successful, adding/updating character #${charData.characterId}, name: ${charData.characterName}`);
        return new AuthorizedCharacter(
            charData.characterId,
            tokenData.accessToken,
            tokenData.accessTokenExpiry,
            tokenData.refreshToken,
            charData.characterOwnerHash,
            charData.scopes,
            2
        );
    }

    async refresh(refreshToken) {
        let options = {
            method: 'POST',
            uri: this.constructUrl('token'),
            body: `client_id=${this.clientId}&grant_type=refresh_token&refresh_token=${refreshToken}`,
            headers: {
                'User-Agent': `cerebral/${appProperties.version} ${appProperties.author_email}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            resolveWithFullResponse: true,
            simple: false
        };

        log.verbose("[SSOv2] Sending refresh request, refresh token = " + refreshToken);
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
                log.verbose(`[SSOv2] Refresh successful, old refresh token = ${refreshToken}, new access token = ${body.access_token}, new refresh token = ${body.refresh_token}`);
                return {
                    accessToken: body.access_token,
                    accessTokenExpiry: new Date(new Date().getTime() + (body.expires_in * 1000)),
                    refreshToken: body.refresh_token,
                };
            case 400:
            case 401:
            case 403:
                if ((body.hasOwnProperty('error')) && (body.error !== undefined) && (body.error !== '')) {
                    log.verbose(`[SSOv2] Refresh failed, refresh token = ${refreshToken}, error: ${body.error}`);
                    throw body;
                } else {
                    log.verbose(`[SSOv2] Refresh failed, refresh token = ${refreshToken}, unknown error`);
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
        let baseUrl = SsoClientv2.trimSlashes(this.ssoBaseUrl);
        let trimmedEndpoint = SsoClientv2.trimSlashes(endpoint);

        if ((query !== null) && (query !== undefined)) {
            return baseUrl + '/' + trimmedEndpoint + '?' + queryString.stringify(query);
        } else {
            return baseUrl + '/' + trimmedEndpoint;
        }
    }

    static validate(accessToken) {
        const payload = accessToken.split('.')[1];
        const data = JSON.parse(Buffer.from(payload, 'base64').toString());

        return {
            characterId: data.sub.split(':')[2],
            characterName: data.name,
            scopes: data.scp,
            characterOwnerHash: data.owner
        };
    }

    static base64URLEncode(s) {
        return s.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    static generateCodeChallenge() {
        const originalValue = SsoClientv2.base64URLEncode(crypto.randomBytes(32));
        const challenge = SsoClientv2.base64URLEncode(crypto.createHash('sha256').update(originalValue).digest());

        return {
            originalValue: originalValue,
            challenge: challenge
        };
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