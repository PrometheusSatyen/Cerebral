'use strict';

import electron from 'electron';

import SsoClientv2 from './eve/SsoClientv2';
import Character from '../models/Character';

import StructureHelper from './StructureHelper';

import appProperties from '../../resources/properties.js';

let authWindow;

export default class CharacterHelper {
    static addCharacter() {
        let client = new SsoClientv2();
        const challenge = SsoClientv2.generateCodeChallenge();
        let redirect = client.redirect(appProperties.scopes.map(a => a.name), challenge);

        authWindow = new electron.remote.BrowserWindow({
            width: 475,
            height: 700,
            show: false,
            'node-integration': false
        });
        authWindow.loadURL(redirect);
        authWindow.setMenu(null);
        authWindow.show();

        async function handleCode(code) {
            let character = await client.authorize(code, challenge);
            character.save();

            // mark for a force refresh (this might be a re-authorization)
            Character.markCharacterForForceRefresh(character.id);

            // we go into the structures cache and we clear this character id from anywhere it appears in an attempted list
            // this ensures that on next refresh structures will be attempted to be repulled
            StructureHelper.removeCharacterIdFromAttemptedLists(character.id);

            Character.build();
        }

        authWindow.webContents.on('will-redirect', function(event, url) {
            let rawCode = /\?code=([^&]*)/.exec(url) || null;
            let code = (rawCode && rawCode.length > 1) ? rawCode[1] : null;
            let error = /\?error=(.+)$/.exec(url);

            if (code || error) {
                event.preventDefault();
                authWindow.destroy();
            }

            if (code) {
                handleCode(code);
            } else if (error) {
                alert("Failed to authorize your character, please try again.")
            }
        });

        authWindow.webContents.on('did-finish-load', function(event, url) {
            authWindow.webContents.findInPage('error');
        });

        authWindow.webContents.on('did-navigate', function(event, url) {
            authWindow.webContents.findInPage('error');
        });

        authWindow.webContents.on('found-in-page', function(event, res) {
            authWindow.webContents.stopFindInPage('clearSelection');
            if (res.matches > 0) {
                authWindow.destroy();
                alert("Failed to authorize your character, your EVE API credentials are invalid or you did not correctly configure the application on the EVE developer site. Please go to the Settings page and correct the issue.")
            }
        });

        authWindow.on('close', function () {
            authWindow = null;
        }, false);
    }
}