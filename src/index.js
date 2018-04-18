'use strict';

import {app, BrowserWindow, Tray, Menu, shell} from 'electron';
import path from 'path';

import appProperties from './../resources/properties';

if (require('electron-squirrel-startup')) {
    app.quit();
}

import installExtension, {REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer';

let mainWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);
const iconPath = path.join(__dirname, '../resources/icon.ico');

const shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
    if (mainWindow) {
        mainWindow.show();
    }
});

if (shouldQuit) {
    app.quit();
}

const createWindow = async () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800
    });

    if (isDevMode) {
        await installExtension(REACT_DEVELOPER_TOOLS);
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.setTitle(`Cerebral ${appProperties.version}`);
    mainWindow.setMenu(null);

    let trayIcon = new Tray(iconPath);
    trayIcon.setToolTip('Cerebral');
    let contextMenu = Menu.buildFromTemplate([
        {label: 'Show', click: () => {mainWindow.show()}},
        {label: 'Quit', click: () => {
            app.isQuiting = true;
            app.quit()
        }}
    ]);
    trayIcon.setContextMenu(contextMenu);
    trayIcon.on('click', () => {
        mainWindow.show();
    });

    mainWindow.on('minimize', (e) => {
        e.preventDefault();
        mainWindow.hide();
    });
    mainWindow.on('close', (e) => {
        if (!app.isQuiting) {
            e.preventDefault();
            mainWindow.hide();
        }

        return false;
    });
    mainWindow.on('show', () => {
        trayIcon.setHighlightMode('always')
    });
    mainWindow.on('page-title-updated', (e) => {
        e.preventDefault();
    });
    mainWindow.webContents.on('new-window', function(event, url){
        event.preventDefault();
        shell.openExternal(url);
    });
};

app.on('ready', createWindow);
app.on('activate', () => {
    if (mainWindow === undefined) {
        createWindow();
    }
});