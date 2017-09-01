/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Set environment for development
process.env.NODE_ENV = 'development'

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

// Install `vue-devtools`
require('electron').app.on('ready', () => {
	let installExtension = require('electron-devtools-installer')
	installExtension.default(installExtension.VUEJS_DEVTOOLS)
		.then(() => { })
		.catch(err => {
			console.log('Unable to install `vue-devtools`: \n', err)
		})
})

// Require `main` process to boot app
require('./index')

const ipcMain = require('electron').ipcMain
const dialog = require('electron').dialog

ipcMain.on('open_client_project_path', function (event) {
	dialog.showOpenDialog({
		properties: ['openFile', 'openDirectory']
	}, function (files) {
		event.sender.send('selected_client_project_path', files);
	})
})

ipcMain.on('open_client_proto_path', function (event) {
	dialog.showOpenDialog({
		properties: ['openFile', 'openDirectory']
	}, function (files) {
		event.sender.send('selected_client_proto_path', files);
	})
})

global.sharedObject = {
	client_project_path: ''
}