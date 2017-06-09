'use strict';

let log_iface = require("../backend/logger.js");
let systemLogger = log_iface.systemLogger;
let config = require("../backend/config.js");
let DB = require('../backend/db/db')(systemLogger);
let User = require('../backend/models/user');
let C = require("../backend/constants");

let username = process.argv[2];
let password = process.argv[3];
let email = process.argv[4];

DB.getDB('default').then( db => {
	// set db to singleton modelFactory class
	require('../backend/models/factory/modelFactory').setDB(db);

}).then(() => {

	return User.createUser(systemLogger, username, password, { email }, 200000);

}).then(emailVerifyToken => {
	
	return User.verify(username, emailVerifyToken.token, {
		skipImportToyProject: 1
	});

}).then(() => {
	
	console.log(`user ${username} created.`);
	process.exit(0);

}).catch(err => {
	
	console.log(`Failed to create ghost user ${username}`, err);
	process.exit(-1);

});
