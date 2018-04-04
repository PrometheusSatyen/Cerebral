'use strict';

import electron from 'electron';

import SsoClient from './eve/SsoClient';
import Character from '../models/Character';

import appProperties from '../../resources/properties.js';

let authWindow;

export default class CharacterHelper {
    static addCharacter() {
        let client = new SsoClient();
        let redirect = client.redirect(appProperties.scopes.map(a => a.name));

        authWindow = new electron.remote.BrowserWindow({
            width: 400,
            height: 700,
            show: false,
            'node-integration': false
        });
        authWindow.loadURL(redirect);
        authWindow.setMenu(null);
        authWindow.show();

        async function handleCallback(url) {
            let raw_code = /code=([^&]*)/.exec(url) || null;
            let code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
            let error = /\?error=(.+)$/.exec(url);

            if (code || error) {
                authWindow.destroy();
            }

            if (code) {
                let character = await client.authorize(code);
                character.save();
                Character.build();
            } else if (error) {
                alert("Failed to authorize your character, please try again.")
            }
        }

        authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
            handleCallback(newUrl);
        });

        authWindow.on('close', function () {
            authWindow = null;
        }, false);
    }
}