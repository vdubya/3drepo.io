/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var dbConn_js = require("./db.js");
var async = require("async");
var logger = require("./logger.js");
var C = require("./constants");
var utils = require("./utils.js");

var RepoVector        = require("./repoVector.js");
var RepoGraphScene    = require("./repoGraphScene.js");
var RepoNodeWayfinder = require("./repoNodeWayfinder.js");
var RepoNodeCamera    = require("./repoNodeCamera");
var RepoNodeMeta      = require("./repoNodeMeta");
var RepoIssue         = require("./repoIssue");

var responseCodes = require("./response_codes.js");

var DBInterface = function()
{
	"use strict";

	// Private connection pool
	var dbConn = new dbConn_js();
	var self = this;

	/*******************************************************************************
	* DATABASE FUNCTIONS
	*******************************************************************************/

	/*******************************************************************************
	* Get list of databases
	* @param {function} callback - Callback function
	*******************************************************************************/
	this.getDBList = function(callback) {
		logger.logDebug("Getting list of databases");

		dbConn.dbCallback(C.REPO_DATABASE_ADMIN, function(err, db) {
			if (err.value) {
				return callback(err);
			}

			db.admin().listDatabases(function(err, dbs) {
				if (err.value) {
					return callback(err);
				}

				var dbList = [];

				// Create array
				for (var idx in dbs.databases) {
					if (dbs.databases.hasOwnProperty(idx)) {
						dbList.push({ name: dbs.databases[idx].name});
					}
				}

				dbList.sort();

				callback(responseCodes.OK, dbList);
			});
		});
	};

	/*******************************************************************************
	* USER ADMINISTRATION FUNCTIONS
	*******************************************************************************/

	/*******************************************************************************
	* Authenticate user against the database
	* @param {string} username - Username 
	* @param {string} password - Password
	* @param {function} callback - Callback function
	*******************************************************************************/
	this.authenticate = function(username, password, callback) {
		dbConn.authenticateUser(username, password, function(err)
		{
			if(err.value)
			{
				return callback(err);
			}

			callback(responseCodes.OK, {username: username});
		});
	};


	/*******************************************************************************
	* Create user in database
	* @param {string} username - Username 
	* @param {string} password - Password
	* @param {string} email    - Email address
	* @param {function} callback - Callback function
	*******************************************************************************/
	this.createUser = function(username, password, email, callback) {
		// Open connection to the admin database
		dbConn.dbCallback(C.REPO_DATABASE_ADMIN, function(err, db) {
			if (err.value) {
				return callback(err);
			}

			// Attempt to add the user
			db.addUser(username, password, function(err)
			{
				// TODO: Should move this to db.js
				if (err) {
					return callback(responseCodes.DB_ERROR(err));
				}

				// Retrieve document again to be able to store
				// the user\"s email
				dbConn.collCallback(C.REPO_DATABASE_ADMIN, C.REPO_COLLECTION_USERS, C.STRICT_MODE, function(err, coll) {
					if(err.value) {
						return callback(err);
					}

					var selector = { user : username };

					var updateJSON = {
						$set: { "customData.email" : email}
					};

					// Run Update
					coll.update(selector, updateJSON, function(err) {
						if (err) {
							callback(responseCodes.DB_ERROR(err));
						} else {
							callback(responseCodes.OK);
						}
					});
				});
			});
		});
	};

	/*******************************************************************************
	* Update user details in database
	* @param {string} username - Username 
	* @param {JSON} data - JSON containing custom data
	* @param {function} callback - Callback function
	*******************************************************************************/
	this.updateUser = function(username, data, callback) {
		// Connect to the admin database
		dbConn.dbCallback(C.REPO_DATBASE_ADMIN, function(err, db) {
			if (err.value) {
				return callback(err);
			}

			// Get public information
			self.getUserInfo(username, C.GET_PUBLIC, function(err, oldCustomData) {
				if(err.value){
					return callback(err);
				}

				// Build update user command to run on database
				var updateUserCommand = {};
				updateUserCommand[C.DB_COMMAND_UPDATE_USER] = username;

				var newCustomData = oldCustomData;

				if(data[C.REPO_USER_EMAIL]) {
					newCustomData[C.REPO_USER_EMAIL] = data[C.REPO_USER_EMAIL];
				}

				if(data[C.REPO_USER_FIRST_NAME]) {
					newCustomData[C.REPO_USER_FIRST_NAME] = data[C.REPO_USER_FIRST_NAME];
				}

				if(data[C.REPO_USER_LAST_NAME]) {
					newCustomData[C.REPO_USER_LAST_NAME] = data[C.REPO_USER_LAST_NAME];
				}

				updateUserCommand[C.REPO_USER_DATA] = newCustomData;

				db.command( updateUserCommand, function(err) {
					// TODO: Should move this to db.js
					if (err){
						callback(responseCodes.DB_ERROR(err));
					} else{
						callback(responseCodes.OK);
					}
				});
			});
		});
	};


	/*******************************************************************************
	* Update a user's password
	* @param {string} username - Username 
	* @param {string} oldPassword - Old password to be changed
	* @param {string} newPassword - New password to be updated to
	* @param {function} callback - Callback function
	*******************************************************************************/
	this.updatePassword = function(username, oldPassword, newPassword, callback) {
		if(!(oldPassword && newPassword))
		{
			return callback(responseCodes.INVALID_INPUTS_TO_PASSWORD_UPDATE);
		}

		// First check that the old password is correct
		this.authenticate(username, oldPassword, function(err) {
			if(err.value) {
				return callback(err);
			}

			dbConn.dbCallback(C.REPO_DATABASE_ADMIN, function(err, db) {
				if (err.value) {
					return callback(err);
				}

				// Get user information but only non-public
				self.getUserInfo(username, C.GET_NON_PUBLIC, function(err, oldCustomData) {
					if(err.value) {
						return callback(err);
					}

					// Build the update user command
					var updateUserCommand = {};

					updateUserCommand[C.DB_COMMAND_UPDATE_USER] = username;
					updateUserCommand[C.REPO_USER_PASSWORD] = newPassword;
					updateUserCommand[C.REPO_USER_DATA]     = oldCustomData;

					db.command(updateUserCommand, function(err) {
						// TODO: Should move this to db.js
						if(err){
							callback(responseCodes.DB_ERROR(err));
						} else {
							callback(responseCodes.OK);
						}
					});
				});
			});
		});
	};

	/*******************************************************************************
	* Get a database list for a user
	*
	* @param {string}   username       - Account that the project belongs to
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getUserDBList = function(username, callback) {
		if (!username) {
			return callback(responseCodes.USERNAME_NOT_SPECIFIED);
		}

		logger.logDebug("Getting database list for " + username);

		var filter = {};
		filter[C.REPO_USER_USER] = username;

		this.getUserInfo(username, C.GET_PUBLIC, function(err, user) {
			if(err.value){
				return callback(err);
			}

			// Return a list of user projects
			callback(responseCodes.OK, user[C.REPO_USER_PROJECTS]);
		});
	};

	/*******************************************************************************
	* Get user information
	*
	* @param {string}   username       - Account that the project belongs to
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getUserInfo = function(username, getPublic, callback) {
		if(!username) {
			return callback(responseCodes.USERNAME_NOT_SPECIFIED);
		}

		logger.logDebug("Getting user info for " + username);

		var filter = {};
		filter[C.REPO_NODE_LABEL_USER] = username;

		var projection = {};
		projection[C.REPO_USER_DATA]                                = 1;
		projection[C.REPO_USER_DATA + "." + C.REPO_USER_FIRST_NAME] = 1;
		projection[C.REPO_USER_DATA + "." + C.REPO_USER_LAST_NAME]  = 1;
		projection[C.REPO_USER_DATA + "." + C.REPO_USER_EMAIL]      = 1;

		// Private user information goes here
		if(!getPublic) {
			projection[C.REPO_USER_DATA + "." + C.REPO_USER_PROJECTS] = 1;
		}

		dbConn.filterColl(C.REPO_DATABASE_ADMIN, C.REPO_COLLECTION_USERS, filter, projection, function(err, users) {
			if(err.value) {
				return callback(err);
			}

			// If a user has been found
			if (users.length)
			{
				var user = users[0][C.REPO_USER_DATA];
				callback(responseCodes.OK, user);
			} else {
				callback(responseCodes.USER_NOT_FOUND, null);
			}
		});
	};

	/*******************************************************************************
	* Get user avatar
	*
	* @param {string}   username       - Account that the project belongs to
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getAvatar = function(username, callback) {
		if(!username) {
			return callback(responseCodes.USER_NOT_SPECIFIED);
		}

		logger.logDebug("Getting user avatar for " + username);

		var filter = {};
		filter[C.REPO_USER_USER] = username;

		var projection = {};
		projection[C.REPO_USER_DATA] = 1;

		dbConn.filterColl(C.REPO_DATABASE_ADMIN, C.REPO_COLLECTION_USERS, filter, projection, function(err, users) {
			if(err.value) {
				return callback(err);
			}

			// If the user is found, return raw binary data.
			if (users.length){
				callback(responseCodes.OK, users[0][C.REPO_USER_DATA][C.REPO_USER_AVATAR]);
			} else {
				callback(responseCodes.USER_NOT_FOUND, null);
			}
		});
	};

	/*******************************************************************************
	* WAYFINDER FUNCTIONS
	*******************************************************************************/

	/*******************************************************************************
	* Get wayfinder info
	* @param {string} account     - Account that the project belongs to
	* @param {string} project     - Wayfinder project
	* @param {Array} uniqueIDs    - Set of UIDs to get info for
	* @param {function} callback  - Callback function
	*******************************************************************************/
	this.getWayfinderInfo = function(account, project, uniqueIDs, callback) {
		// If a list of unique IDs has been passed in then only
		// retreive for those IDs
		if(uniqueIDs) {
			logger.logDebug("Getting waypoint information for UIDs " + JSON.stringify(uniqueIDs));

			var uids = utils.stringsToUUIDs(uniqueIDs);

			// Convert the uids to binary notation
			var filter = {};
			filter[C.REPO_NODE_LABEL_ID] = {$in : uids};

			logger.logDebug("Searching for wayfinding in paths: " + JSON.stringify(uniqueIDs));

			dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_WAYFINDER, filter, {}, function(err, docs) {
				if (err.value) {
					return callback(err);
				}

				callback(responseCodes.OK, docs);
			});
		} else {
			logger.logDebug("Getting list of all waypoint recordings");

			// Only need to retrieve certain properties
			var projection = {};
			projection[C.REPO_NODE_LABEL_ID]        = 1;
			projection[C.REPO_NODE_LABEL_USER]      = 1;
			projection[C.REPO_NODE_LABEL_TIMESTAMP] = 1;

			dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_WAYFINDER, {}, projection, function(err, docs) {
				if(err.value) {
					return callback(err);
				}

				callback(responseCodes.OK, RepoGraphScene.bulkDecode(RepoNodeWayfinder, docs));
			});
		}
	};

	/*******************************************************************************
	* Store wayfinder info
	* @param {string} account     - Account that the project belongs to
	* @param {string} project     - Wayfinder project
	* @param {string} username    - Username
	* @param {string} sessionID   - Unique session ID to store waypoints against
	* @param {number} timestamp   - Timestamp (seconds since the epoch)
	* @param {function} callback  - Callback function
	*******************************************************************************/
	this.storeWayfinderInfo = function(account, project, username, sessionID, waypoints, timestamp, callback) {
		logger.logDebug("Storing waypoint information for " + username + " @ " + (new Date(timestamp)));

		dbConn.collCallback(account, project + "." + C.REPO_COLLECTION_WAYFINDER, C.NON_STRICT_MODE, function(err, coll) {
			if(err.value) {
				return callback(err);
			}

			// Construct unique key JSON To search for
			var uniqueKey = {};
			uniqueKey[C.REPO_NODE_LABEL_USER]      = username;
			uniqueKey[C.REPO_NODE_LABEL_SESSION]   = sessionID;
			uniqueKey[C.REPO_NODE_LABEL_TIMESTAMP] = timestamp;

			// Construct new object which contains the updated information
			var newWayfinder = new RepoNodeWayfinder();

			RepoNodeWayfinder.init(username, sessionID, timestamp);

			for(let i = 0; i < waypoints.length; i++)
			{
				RepoNodeWayfinder.addRecord(
					new RepoVector(waypoints[i][C.REPO_NODE_LABEL_DIRECTION]),
					new RepoVector(waypoints[i][C.REPO_NODE_LABEL_POSITION]),
					waypoints[i][C.REPO_NODE_LABEL_TIMESTAMP]
				);
			}

			coll.update(uniqueKey, { $set : newWayfinder.toJSON() }, {upsert: true}, function(err, count) {
				if (err) {
					return callback(responseCodes.DB_ERROR(err));
				}

				logger.logDebug("Updated " + count + " records.");
				callback(responseCodes.OK);
			});
		});
	};


	/*******************************************************************************
	* Add a set of IDs to the current list of a revision
	*
	* @todo This shouldn't exist 
	* @param {string} account     - Account that the project belongs to
	* @param {string} project     - Wayfinder project
	* @param {string} branch      - Branch name
	* @param {string} objUUID     - Unique ID to add to the current list
	* @param {function} callback  - Callback function
	*******************************************************************************/
	this.addToCurrentList = function(account, project, branch, objUUID, callback) {
		self.getHeadUUID(account, project, branch, function(err, uuid) {
			dbConn.collCallback(account, project + "." + C.REPO_COLLECTION_HISTORY, C.USE_STRICT, function(err, coll) {
				if(err.value) {
					return callback(err);
				}

				var uniqueKey = {};
				uniqueKey[C.REPO_NODE_LABEL_ID] = uuid.uuid;

				var pushObj = {};
				pushObj[C.REPO_NODE_LABEL_CURRENT] = objUUID;

				coll.update(uniqueKey, { $push: pushObj }, {}, function(err) {
					if (err) {
						return callback(responseCodes.DB_ERROR(err));
					}

					logger.logDebug("Adding " + utils.uuidToString(objUUID) + " to current list of " + utils.uuidToString(uuid.uuid));

					callback(responseCodes.OK);
				});
			});
		});
	};

	/*******************************************************************************
	* Store viewpoint in database
	*
	* @param {string}   account        - Account that the project belongs to
	* @param {string}   project        - Wayfinder project
	* @param {string}   branch         - Branch name
	* @param {string}   parentSharedID - Shared ID of parent
	* @param {BSON}     bson           - BSON representation
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.storeViewpoint = function(account, project, branch, parentSharedID, bson, callback) {

		// Add parents to object
		bson.parents = [utils.stringToUUID(parentSharedID)];

		var newCamera = new RepoNodeCamera(bson);

		dbConn.collCallback(account, project + "." + C.REPO_COLLECTION_SCENE, C.STRICT_MODE, function(err, coll) {
			if(err.value) {
				return callback(err);
			}

			var uniqueKey = {};
			uniqueKey[C.REPO_NODE_LABEL_ID] = newCamera.getID();

			coll.update(uniqueKey, { $set : newCamera.toDB() }, { upsert: true }, function(err, count) {
				if(err) {
					return callback(responseCodes.DB_ERROR(err));
				}

				logger.logDebug("Updated " + count + " records.");

				self.addToCurrentList(account, project, branch, newCamera.getID(), function (err) {
					if (err.value) {
						return callback(err);
					}

					callback(responseCodes.OK);
				});
			});
		});
	};

	/*******************************************************************************
	* PROJECT FUNCTIONS
	*******************************************************************************/

	/*******************************************************************************
	* Get information for a project
	*
	* @param {string}   account        - Account that the project belongs to
	* @param {string}   project        - Project to find information for
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getProjectInfo = function(account, project, callback) {
		if(!project) {
			return callback(responseCodes.PROJECT_NOT_SPECIFIED);
		}

		logger.logDebug("Getting project info for " + account + "/" + project);

		var filter = {};
		filter[C.REPO_NODE_LABEL_ID] = project;

		var projection = {};
		projection[C.REPO_SETTINGS_GROUPS] = 0;

		dbConn.filterColl(account, C.REPO_COLLECTION_SETTINGS, filter, projection, function(err, projects) {
			if(err.value) {
				return callback(err);
			}

			// If a project is found
			if(projects.length)
			{
				callback(responseCodes.OK, projects[0]);
			} else {
				callback(responseCodes.PROJECT_INFO_NOT_FOUND);
			}
		});
	};


	/*******************************************************************************
	* Get groups for a particular database
	*
	* @param {string}   account        - Account that the project belongs to
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getDatabaseGroups = function(account, callback) {

		var filter = {};
		filter[C.REPO_USER_DATABASE] = account;

		var projection = {};
		projection[C.REPO_USER_USER] = 1;

		logger.logDebug("Getting database groups for " + account);

		dbConn.filterColl(C.REPO_DATABASE_ADMIN, C.REPO_COLLECTION_USERS, filter, projection, function(err, coll) {
			if(err.value) {
				return callback(err);
			}

			callback(responseCodes.OK, coll);
		});
	};

	/*******************************************************************************
	* Get list of users for a particular project
	*
	* @param {string}   account        - Account that the project belongs to
	* @param {string}   project        - Project to find information for
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getProjectUsers = function(account, project, callback) {
		if(!project) {
			return callback(responseCodes.PROJECT_NOT_SPECIFIED);
		}

		logger.logDebug("Getting project users for " + account + "/" + project);

		var filter = {};
		filter[C.REPO_NODE_LABEL_ID] = project;

		var projection = {};
		projection[C.REPO_SETTINGS_USERS] = 1;

		// Get list of users for a particular project
		dbConn.filterColl(account, C.REPO_COLLECTION_SETTINGS, filter, projection, function(err, projects) {
			if(err.value) {
				return callback(err);
			}

			// If there are no projects found
			if(!projects.length) {
				return callback(responseCodes.SETTINGS_ERROR);
			}

			// If there are no users on the project, or not specified
			// then send that back
			if(!projects[0][C.REPO_SETTINGS_USERS] || !projects[0][C.REPO_SETTINGS_USERS].length) {
				return callback(responseCodes.OK, []);
			}

			// For a given project get a list of groups
			// to check whether a user is a group or a user
			self.getDatabaseGroups(account, function(err, groups) {
				if(err.value){
					return callback(err);
				}

				// Generate JSON response with user and their type
				var projectUsers = projects[0][C.REPO_SETTINGS_USERS].map(function (user) {
					var bson = {};

					bson[C.REPO_USER_USER] = user;
					bson[C.REPO_USER_TYPE] = groups.indexOf(user[C.REPO_SETTINGS_USERS_USER]) > 0 ? C.REPO_TYPE_GROUP : C.REPO_TYPE_USER;
				});

				callback(responseCodes.OK, projectUsers);
			});
		});
	};

	/*******************************************************************************
	* ACCESS FUNCTIONS
	*******************************************************************************/

	/*******************************************************************************
	* Get project access for a user
	*
	* @param {string}   username       - Username to get access for
	* @param {string}   account        - Account to check access for
	* @param {string}   project        - Project to check access for
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getAccessToProject = function(username, account, project, callback) {
		if (project === null) {
			return callback(responseCodes.PROJECT_NOT_SPECIFIED);
		}

		self.getProjectInfo(account, project, function(err, info) {
			if(err.value) {
				return callback(err);
			}

			if(username === info[C.REPO_SETTINGS_OWNER]) {
				logger.logDebug(username + " has owner permissions");
				return callback(responseCodes.OK, info[C.REPO_SETTINGS_PERMISSIONS][C.REPO_PERM_OWNER]);
			}

			self.getProjectUsers(account, project, function(err, users) {
				if(err.value) {
					return callback(err);
				}

				var usernameList = users.map(function(user) { return user[C.REPO_SETTINGS_USERS_USER]; });

				logger.logDebug(project + " has the following users " + JSON.stringify(usernameList));

				if (usernameList.indexOf(username) > -1)
				{
					// Valid user or group
					logger.logDebug(username + " has group permissions");
					return callback(responseCodes.OK, info[C.REPO_SETTINGS_PERMISSIONS][C.REPO_PERM_GROUP]);
				} else {
					// Must be a public user ?
					logger.logDebug(username + " has public permissions");
					return callback(responseCodes.OK, info[C.REPO_SETTINGS_PERMISSIONS][C.REPO_PERM_PUBLIC]);
				}
			});
		});
	};

	/*******************************************************************************
	* Check a paticular permission bit for a username, account, project
	*
	* @param {string}   username       - Username to get access for
	* @param {string}   account        - Account to check access for
	* @param {string}   project        - Project to check access for
	* @param {number}   bitMask        - Bit mask for permission bit
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.checkPermissionsBit = function(username, account, project, bitMask, callback)
	{
		this.getAccessToProject(username, account, project, function(err, permission) {
			if(err.value) {
				return callback(err);
			}

			logger.log("debug", "Permission for " + username + " @ " + account + "/" + project + " is " + permission);

			if (permission & bitMask)
			{
				callback(responseCodes.OK);
			} else {
				callback(responseCodes.NOT_AUTHORIZED);
			}
		});
	};

	/*******************************************************************************
	* Check a read permission bit for a username, account, and project
	*
	* @param {string}   username       - Username to get access for
	* @param {string}   account        - Account to check access for
	* @param {string}   project        - Project to check access for
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.hasReadAccessToProject = function(username, account, project, callback) {
		self.checkPermissionsBit(username, account, project, C.REPO_READ_BIT, callback);
	};

	/*******************************************************************************
	* Check a write permission bit for a username, account, and project
	*
	* @param {string}   username       - Username to get access for
	* @param {string}   account        - Account to check access for
	* @param {string}   project        - Project to check access for
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.hasWriteAccessToProject = function(username, account, project, callback) {
		self.checkPermissionsBit(username, account, project, C.REPO_WRITE_BIT, callback);
	};

	/*******************************************************************************
	* Check a execute permission bit for a username, account, and project
	*
	* @param {string}   username       - Username to get access for
	* @param {string}   account        - Account to check access for
	* @param {string}   project        - Project to check access for
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.hasExecuteAccessToProject = function(username, account, project, callback) {
		self.checkPermissionsBit(username, account, project, C.REPO_EXECUTE_BIT, callback);
	};

	/*******************************************************************************
	* Query the scene collection for a particular revision
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   branch         - Branch of scene to query
	* @param {JSON}     filter         - JSON representing filter criterion
	* @param {JSON}     projection     - JSON representing info to retrieve
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.queryScene = function(account, project, branch, revision, filter, projection, callback) {
		var historyQuery = {};

		if (revision)
		{
			historyQuery[C.REPO_NODE_LABEL_ID] = utils.stringToUUID(revision);
		} else {
			var branch_id = null;

			if (branch === C.MASTER_BRANCH_NAME){
				branch_id = C.MASTER_UUID;
			} else {
				branch_id = utils.stringToUUID(branch);
			}

			historyQuery[C.REPO_NODE_LABEL_SHARED_ID] = branch_id;
		}

		dbConn.getLatest(account, project + "." + C.REPO_COLLECTION_HISTORY, historyQuery, null, function(err, docs)
		{
			if (err.value) {
				return callback(err);
			}

			if (!docs.length) {
				return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
			}

			filter[C.REPO_NODE_LABEL_REV_ID] = docs[0][C.REPO_NODE_LABEL_ID];

			dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_REPO_STASH, filter, projection, function(err, coll) {
				if (err.value || !coll.length)
				{
					// TODO: At this point we should generate send off to generate a stash
					// There is no stash so just pass back the unoptimized scene graph
					delete filter[C.REPO_NODE_LABEL_REV_ID];

					filter[C.REPO_NODE_LABEL_ID] = { $in: docs[0][C.REPO_NODE_LABEL_CURRENT] };

					dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_SCENE, filter, projection, function(err, coll) {
						if (err.value) {
							return callback(err);
						}

						callback(responseCodes.OK, false, coll);
					});
				} else {
					callback(responseCodes.OK, true, coll);
				}
			});
		});
	};


	/*******************************************************************************
	* Get the root 
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   branch         - Branch of scene to query
	* @param {string}   revision       - Revision UUID
	* @param {boolean}  queryStash     - Should I query the stash ?
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getRootNode = function(account, project, branch, revision, queryStash, callback) {
		var historyQuery = {};
		var branch_id    = null;

		if (revision)
		{
			historyQuery[C.REPO_NODE_LABEL_ID] = utils.stringToUUID(revision);
		} else {
			if (branch === C.MASTER_BRANCH_NAME) {
				branch_id = C.MASTER_UUID;
			} else {
				branch_id = utils.stringToUUID(branch);
			}

			historyQuery[C.REPO_NODE_LABEL_SHARED_ID] = branch_id;
		}

		// Find the history for the revision
		dbConn.getLatest(account, project + "." + C.REPO_COLLECTION_HISTORY, historyQuery, null, function(err, revisions)
		{
			if (err.value) {
				return callback(err);
			}

			if (!revisions.length) {
				return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
			}

			var revision = revisions[0];
			var filter  = {};

			if (queryStash)
			{
				filter[C.REPO_NODE_LABEL_PARENTS] = {$exists : false };
				filter[C.REPO_NODE_LABEL_TYPE]    = C.REPO_NODE_TYPE_TRANSFORMATION;
				filter[C.REPO_NODE_LABEL_REV_ID]  = utils.stringToUUID(revision[C.REPO_NODE_LABEL_ID]);

				// Query stash based on revision ID
				dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_REPO_STASH, filter, null, function(err, nodes) {
					if (err.value) {
						return callback(err);
					}

					if (!nodes.length) {
						return callback(responseCodes.ROOT_NODE_NOT_FOUND);
					}

					var root = nodes[0];

					callback(responseCodes.OK, root);
				});
			} else {
				filter[C.REPO_NODE_LABEL_PARENTS] = {$exists : false};
				filter[C.REPO_NODE_LABEL_TYPE]    = C.REPO_NODE_TYPE_TRANSFORMATION;
				filter[C.REPO_NODE_LABEL_ID]      = {$in: revision[C.REPO_NODE_LABEL_CURRENT]};

				// Query scene based on current field of history
				dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_SCENE, filter, null, function(err, nodes) {
					if (err.value) {
						return callback(err);
					}

					if (!nodes.length) {
						return callback(responseCodes.ROOT_NODE_NOT_FOUND);
					}

					var root = nodes[0];

					callback(responseCodes.OK, root);
				});
			}
		});
	};

	/*
	{DEPRECATED}
	exports.queryObjectsScene = function(account, project, uid, rid, sid, filter, projection, callback) {

		// If the uid is not specified then we are requesting a
		// specific object for a branch and revision
		if (!uid)
		{
			var filter = {
				parents: stringToUUID(sid),
				type: "meta"
			};

			var projection = {
				shared_id: 0,
				paths: 0,
				type: 0,
				api: 0,
				parents: 0
			};

			self.queryScene(account, project, branch, revision, filter, projection, function(err, fromStash, docs) {
				if (err.value) return callback(err);

				callback(responseCodes.OK, docs);
			});
		} else {
			// In this case we want an object with a specific uid
			// first we find the revision that it belongs to
			var historyQuery = {
				current : stringToUUID(uid)
			};

			var historyProjection = {
				_id : 1
			}

			dbConn.filterColl(account, project + ".history", historyQuery, historyProjection, function(err, obj) {
				if (err.value) return callback(err);

				if (!obj.length)
					return callback(responseCodes.HISTORY_NOT_FOUND);

				var revision = uuidToString(obj[0]["_id"]);

				var f
					parents: obj[0]["shared_id"],
					type: "meta"
				};

				var projection = {
					shared_id: 0,
					paths: 0,
					type: 0,
					api: 0,
					parents: 0
				};

				// TODO: This will query the history collection again, unnecessarily
				self.queryScene(account, project, null, revision, filter, projection, function(err, docs) {
					if (err.value) return callback(err);

					callback(responseCodes.OK, docs);
				});
			});
		}
	}
	*/

	/*******************************************************************************
	* Get the children of a node by it's UID
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   uid            - UID of object
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getChildrenByUID = function(account, project, uid, callback) {

		// First lookup the object in either the stash or the scene
		// TODO: Don't need to get the full object only the Shared ID
		self.getObject(account, project, uid, null, null, function (err, type, uid, fromStash, obj) {
			if (err.value) {
				return callback(err);
			}

			if (obj[C.REPO_SCENE_LABEL_ALL_NODES].length > 1) {
				return callback(responseCodes.OBJECT_NOT_FOUND);
			}

			// Get shared ID for object 
			var sid    = Object.keys(obj[C.REPO_SCENE_LABEL_ALL_NODES][0]);

			var sceneQuery = {};
			sceneQuery[C.REPO_NODE_LABEL_PARENTS] = utils.stringToUUID(sid);

			if (fromStash) // If we got this from the stash
			{
				// Extract the revision ID from the stash object
				var rev_id = utils.uuidToString(obj[C.REPO_SCENE_LABEL_ALL_NODES][sid][C.REPO_NODE_LABEL_REV_ID]);

				self.queryScene(account, project, null, rev_id, sceneQuery, null, function (err, fromStash, nodes) {
					if (err.value) {
						return callback(err);
					}

					if (!nodes.length) {
						return callback(responseCodes.OBJECT_NOT_FOUND);
					}

					callback(responseCodes.OK, new RepoGraphScene(nodes));
				});
			} else {
				var historyQuery = {};
				historyQuery[C.REPO_NODE_LABEL_CURRENT] = utils.stringToUUID(uid);

				var projection = {};
				projection[C.REPO_NODE_LABEL_ID] = 1;

				dbConn.getLatest(account, project + "." + C.REPO_COLLECTION_HISTORY, historyQuery, projection, function (err, revisions) {
					if (err.value) {
						return callback(err);
					}

					if (!revisions.length) {
						return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
					}

					// Extract the revision ID from the history
					var historyRevID = utils.uuidToString(revisions[0][C.REPO_NODE_LABEL_ID]);

					// If the object came from the
					self.queryScene(account, project, null, historyRevID, sceneQuery, null, function (err, fromStash, nodes) {
						if (err.value) {
							return callback(err);
						}

						if (!nodes.length) {
							return callback(responseCodes.OBJECT_NOT_FOUND);
						}

						callback(responseCodes.OK, new RepoGraphScene(nodes));
					});
				});
			}
		});
	};


	/*******************************************************************************
	* Get the children of a node based on an sid
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   uid            - UID of object
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getChildren = function(account, project, branch, revision, sid, callback) {
		var historyQuery = {};
		var branch_id    = null;

		if (revision !== null)
		{
			historyQuery[C.REPO_NODE_LABEL_ID] = utils.stringToUUID(revision);
		} else {
			if (branch === C.REPO_MASTER_BRANCH_NAME) {
				branch_id = C.MASTER_UUID;
			} else {
				branch_id = utils.stringToUUID(branch);
			}

			historyQuery[C.REPO_NODE_LABEL_SHARED_ID] = branch_id;
		}

		dbConn.getLatest(account, project + "." + C.REPO_COLLECTION_HISTORY, historyQuery, null, function(err, revisions)
		{
			var revision = revisions[0];

			var filter = {};
			filter[C.REPO_NODE_LABEL_PARENTS] = utils.stringToUUID(sid);
			filter[C.REPO_NODE_LABEL_TYPE]    = [C.REPO_NODE_TYPE_TRANSFORMATION, C.REPO_NODE_TYPE_REF, C.REPO_NODE_TYPE_MAP];
			filter[C.REPO_NODE_LABEL_ID]      = { $in: revision[C.REPO_NODE_LABEL_CURRENT] };

			dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_SCENE, filter, null, function(err, doc) {
				if (err.value) {
					return callback(err);
				}

				callback(responseCodes.OK, doc);
			});
		});
	};


	/*******************************************************************************
	* Generate a map of SIDs for a list of UIDs
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {Array}   uids            - A list of UIDs
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getUIDMap = function(account, project, uids, callback) {
		// Map the strings representation to binary representation
		uids = uids.map(function(uid) { 
			return utils.stringToUUID(uid); 
		});

		var query = {};
		query[C.REPO_NODE_LABEL_ID] = {$in : uids};

		var projection = {};
		projection[C.REPO_NODE_SHARED_ID] = 1;

		dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_SCENE, query, projection, function(err, uids) {
			if (err.value) {
				return callback(err);
			}

			var UIDMap = {};

			for (var i = 0; i < uids.length; i++){
				UIDMap[utils.uuidToString(uids[i][C.REPO_NODE_LABEL_ID])] = utils.uuidToString(uids[i][C.REPO_NODE_LABEL_SHARED_ID]);
			}

			callback(responseCodes.OK, UIDMap);
		});
	};

	/*******************************************************************************
	* Generate a complete map of UIDs to SIDs and vice versa for a revision
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   branch         - Branch name
	* @param {string}   revision       - Revision name
	* @param {Array}   uids            - A list of UIDs
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getSIDMap = function(account, project, branch, revision, callback) {
		var historyQuery = {};
		var branch_id    = null;

		if (revision !== null)
		{
			historyQuery[C.REPO_NODE_LABEL_ID] = utils.stringToUUID(revision);
		} else {
			if (branch === C.MASTER_BRANCH_NAME) {
				branch_id = C.MASTER_UUID;
			} else {
				branch_id = utils.stringToUUID(branch);
			}

			historyQuery[C.REPO_NODE_LABEL_SHARED_ID] = branch_id;
		}

		dbConn.getLatest(account, project + "." + C.REPO_NODE_COLLECTION_HISTORY, historyQuery, null, function(err, revisions)
		{
			if (err.value) {
				return callback(err);
			}

			if (!revisions.length) {
				return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
			}

			var revision = revisions[0];

			var filter                   = {};
			filter[C.REPO_NODE_LABEL_ID] = revision[C.REPO_NODE_LABEL_CURRENT];

			var projection                          = {};
			projection[C.REPO_NODE_LABEL_ID]        = 1;
			projection[C.REPO_NODE_LABEL_SHARED_ID] = 1;

			dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_SCENE, filter, projection, function(err, nodes) {
				if (err.value) {
					return callback(err);
				}

				var SIDMap = {};

				for(let i = 0; i < nodes.length; i++)
				{
					SIDMap[utils.uuidToString(nodes[i][C.REPO_NODE_LABEL_SHARED_ID])] = utils.uuidToString(nodes[i][C.REPO_NODE_LABEL_ID]);
				}

				var invSIDMap = {};

				for(let i = 0; i < nodes.length; i++)
				{
					invSIDMap[utils.uuidToString(nodes[i][C.REPO_NODE_LABEL_ID])] = utils.uuidToString(nodes[i][C.REPO_NODE_LABEL_SHARED_ID]);
				}

				callback(responseCodes.OK, SIDMap, invSIDMap);
			});
		});
	};


	/*******************************************************************************
	* Get the head revision for a particular project and branch
	*
	* @todo  Should return a revision object
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   branch         - Branch name
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getHeadRevision = function(account, project, branch, callback) {
		var branch_id = null;

		if (branch === C.MASTER_BRANCH_NAME)
		{
			branch_id = C.MASTER_UUID;
		}else {
			branch_id = utils.stringToUUID(branch);
		}

		var historyQuery = {};
		historyQuery[C.REPO_NODE_SHARED_ID] = branch_id;

		dbConn.getLatest(account, project + "." + C.REPO_COLLECTION_HISTORY, historyQuery, null, function(err, head) {
			if (err.value) {
				return callback(err);
			}

			callback(responseCodes.OK, head);
		});
	};


	/*******************************************************************************
	* Get the UUID only of the head revision for a project/branch
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   branch         - Branch name
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getHeadUUID = function(account, project, branch, callback) {
		self.getHeadRevision(account, project, branch, function(err, doc) {
			if (err.value) {
				return callback(err);
			}

			var revision = doc[0];

			var bson  = {};
			bson.uuid = revision[C.REPO_NODE_LABEL_ID];
			bson.sid  = revision[C.REPO_NODE_LABEL_SHARED_ID];

			callback(responseCodes.OK, bson);
		});
	};


	/*******************************************************************************
	* Get head revision of a project/branch and run a function on it
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   branch         - Branch name
	* @param {function} getFunc        - Function to call on result
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getHeadOf = function(account, project, branch, getFunc, callback) {
		var branch_id = null;

		if (branch === C.MASTER_BRANCH_NAME){
			branch_id = C.MASTER_UUID;
		} else {
			branch_id = utils.stringToUUID(branch);
		}

		var historyQuery = {};
		historyQuery[C.REPO_NODE_LABEL_SHARED_ID] = branch_id;

		dbConn.getLatest(account, project + "." + C.REPO_COLLECTION_HISTORY, historyQuery, null, function(err, revisions) {
			if (err.value) {
				return callback(err);
			}

			if (!revisions.length) {
				return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
			}

			var revision = revisions[0];

			getFunc(account, project, utils.uuidToString(revision[C.REPO_NODE_LABEL_ID]), function(err, doc) {
				if(err.value) {
					return callback(err);
				}

				callback(responseCodes.OK, doc);
			});
		});
	};


	/*******************************************************************************
	* Get information for a particular revision
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   revID          - Revision UUID
	* @param {function} getFunc        - Function to call on result
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getRevisionInfo = function(account, project, revID, callback) {
		var filter = {};
		filter[C.REPO_NODE_LABEL_ID] = utils.stringToUUID(revID);

		dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_HISTORY, filter, null, function(err, revisions) {
			if (err.value) {
				return callback(err);
			}

			if (!revisions.length) {
				return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
			}

			var revision = revisions[0];

			var rev = {};

			rev[C.REPO_NODE_LABEL_REVISION] = revID; 
			rev[C.REPO_NODE_LABEL_AUTHOR]	= utils.coalesce(revision[C.REPO_NODE_LABEL_AUTHOR], "unnamed");
			rev[C.REPO_NODE_LABEL_MESSAGE]  = utils.coalesce(revision[C.REPO_NODE_LABEL_MESSAGE], "");
			rev[C.REPO_NODE_LABEL_TAG]		= utils.coalesce(revision[C.REPO_NODE_LABEL_TAG], "");
			rev[C.REPO_NODE_LABEL_BRANCH]   = utils.uuidToString(revision[C.REPO_NODE_LABEL_SHARED_ID]);

			if (history[C.REPO_NODE_LABEL_TIMESTAMP])
			{
				var timestampDate = new Date(history[C.REPO_NODE_LABEL_TIMESTAMP]);

				rev[C.REPO_NODE_LABEL_TIMESTAMP] = timestampDate.toString();
			} else {
				rev[C.REPO_NODE_LABEL_TIMESTAMP] = "Unknown";
			}

			callback(responseCodes.OK, rev);
		});
	};


	/*******************************************************************************
	* Get readme for a particular project/revision
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   revID          - Revision UUID
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getReadme = function(account, project, revID, callback) {
		var historyQuery = {};
		historyQuery[C.REPO_NODE_LABEL_ID] = utils.stringToUUID(revID);

		dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_HISTORY, historyQuery, null, function(err, revisions)
		{
			if(!revisions.length) {
				return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
			}

			var revision = revisions[0];

			var query                                 = {};
			query[C.REPO_NODE_LABEL_METADATA_TYPE]    = C.REPO_NODE_TYPE_META;
			query[C.REPO_NODE_LABEL_METADATA_SUBTYPE] = C.REPO_NODE_SUBTYPE_README;
			query[C.REPO_NODE_LABEL_ID]               = { $in: revision[C.REPO_NODE_LABEL_CURRENT] };

			dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_SCENE, query, null, function(err, nodes) {
				if(err.value) {
					return callback(err);
				}

				var bson = {};

				if (!nodes.length) {
					bson[C.BSON_NODE_SUBTYPE_README] = "Readme Missing";
				} else {
					var readme = nodes[0];
					bson[C.BSON_BODE_SUBTYPE_README] = readme[C.REPO_NODE_LABEL_METADATA];
				}

				callback(responseCodes.OK, bson);
			});
		});
	};

	/*******************************************************************************
	* Get list of revisions for a particular branch
	* Pagination available with from/to
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   branch         - Branch UID to query
	* @param {number}   from           - Index of first revision to retrieve
	* @param {number}   to             - Index of last revision to retrieve
	* @param {string}   revision       - Revision UUID
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getRevisions = function(account, project, branch, from, to, full, callback) {
		var filter = {};
		filter[C.REPO_NODE_LABEL_TYPE] = C.REPO_NODE_TYPE_REVISION;

		if(branch) {
			if (branch === C.MASTER_BRANCH_NAME) {
				filter[C.REPO_NODE_LABEL_SHARED_ID] = C.MASTER_UUID;
			} else {
				filter[C.REPO_NODE_LABEL_SHARED_ID] = utils.stringToUUID(branch);
			}
		}

		var projection = {};

		if (!full)
		{
			projection[C.REPO_NODE_LABEL_ID] = 1;
		} else if (from && to) {	
			projection[C.REPO_NODE_LABEL_ID] = { $slice: [from, (to - from + 1)]};
		}

		dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_HISTORY, filter, projection, function(err, revisions) {
			if (err.value) {
				return callback(err);
			}

			var revisionList = [];

			for (let idx = 0; idx < revisions.length; idx++)
			{
				var revision     = revisions[idx];
				var revisionName = utils.uuidToString(revision);
				var rev = {};

				rev[C.REPO_NODE_LABEL_NAME] = revisionName;

				if (full) {
					if (revision[C.REPO_NODE_LABEL_AUTHOR]) {
						rev[C.REPO_NODE_LABEL_AUTHOR] = revision[C.REPO_NODE_LABEL_AUTHOR];
					}

					if (revision[C.REPO_NODE_LABEL_TIMESTAMP])
					{
						rev[C.REPO_NODE_LABEL_TIMESTAMP] = revision[C.REPO_NODE_LABEL_TIMESTAMP];
					}

					if (revision[C.REPO_NODE_LABEL_MESSAGE]) {
						rev[C.REPO_NODE_LABEL_MESSAGE] = revision[C.REPO_NODE_LABEL_MESSAGE];
					}

					if (revision[C.REPO_NODE_LABEL_BRANCH]) {
						rev[C.REPO_NODE_LABEL_BRANCH]  = revision[C.REPO_NODE_LABEL_BRANCH];
					}
				}

				revisionList.push(rev);
			}

			callback(responseCodes.OK, revisionList);
		});
	};

	/*******************************************************************************
	* Get list of branches for a particular project
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getBranches = function(account, project, callback) {
		var filter = {};
		filter[C.REPO_NODE_LABEL_TYPE] = C.REPO_NODE_TYPE_REVISION;

		var projection = {};
		projection[C.REPO_NODE_LABEL_SHARED_ID] = 1;

		dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_HISTORY, filter, projection, function(err, revisions) {
				if (err.value) {
					return callback(err);
				}

				var branchList  = [];
				var branchNames = [];

				for (let i = 0; i < revisions.length; i++)
				{
					var revision = revisions[i];
					var branchName = utils.uuidToString(revisions[i][C.REPO_NODE_LABEL_SHARED_ID]);

					if (branchNames.indexOf(branchName) === -1) 
					{
						var bson = {};
						bson[C.REPO_NODE_LABEL_SHARED_ID] = utils.uuidToString(revision[C.REPO_NODE_LABEL_SHARED_ID]);

						branchList.push(bson);
						branchNames.push(revision[C.REPO_NODE_LABEL_SHARED_ID]);
					}
				}

				callback(responseCodes.OK, branchList);
		});
	};

	/*******************************************************************************
	* Get list of projects that make up a federation
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   branch         - Branch UID to query
	* @param {string}   revID          - Revision ID to query
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getFederatedProjectList = function(account, project, branch, revID, callback) {
		var historyQuery = {};
		var branch_id    = null;

		if (revID !== null)
		{
			historyQuery[C.REPO_NODE_LABEL_ID] = utils.stringToUUID(revID);
		} else {

			if (branch === C.MASTER_BRANCH_NAME)
			{
				branch_id = C.MASTER_UUID;
			} else  {
				branch_id = utils.stringToUUID(branch);
			}

			historyQuery[C.REPO_NODE_LABEL_SHARED_ID] = branch_id;
		}

		dbConn.getLatest(account, project + "." + C.REPO_COLLECTION_HISTORY, historyQuery, null, function(err, revisions)
		{
			if (err.value) {
				return callback(err.value);
			}

			if (!revisions.length) {
				return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
			}

			var revision = revisions[0];

			var filter = {};
			filter[C.REPO_NODE_LABEL_TYPE] = C.REPO_NODE_TYPE_REF;
			filter[C.REPO_NODE_LABEL_ID]   = { $in : revision[C.REPO_NODE_LABEL_CURRENT]};

			dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_SCENE, filter, {}, function(err, refs) {
				async.concat(refs, function (ref, iter_callback) {

					var childDbName  = utils.coalesce(ref[C.REPO_NODE_LABEL_OWNER][C.REPO_NODE_LABEL_OWNER], account);
					var childProject = ref[C.REPO_NODE_LABEL_PROJECT];

					var unique = utils.coalesce(ref[C.REPO_NODE_LABEL_UNIQUE], false);

					var childRevision = null;
					var childBranch   = null;

					// If the reference has a revision ID inside
					if (ref[C.REPO_NODE_LABEL_RID])
					{
						var rid = ref[C.REPO_NODE_LABEL_RID];

						if (unique)
						{
							childRevision = utils.uuidToString(rid);
							childBranch   = null;
						} else {
							childRevision = null;
							childBranch   = utils.uuidToString(rid);
						}
					} else {
						childBranch   = C.MASTER_BRANCH_NAME;
						childRevision = C.HEAD_REVISION_NAME;
					}

					self.getFederatedProjectList(childDbName, childProject, childBranch, childRevision, function (err, childrefs) {
						if (err.value) {
							return iter_callback(err);
						}

						iter_callback(responseCodes.OK, childrefs);
					});
				},
				function (err, results) {
					// TODO: Deal with errors here

					callback(responseCodes.OK, refs.concat(results));
				});
			});
		});
	};


	/*******************************************************************************
	* ISSUE FUNCTIONS
	*******************************************************************************/

	/*******************************************************************************
	* Get issues attached to specific object
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   uid            - UUID of object
	* @param {boolean}  onlyStubs      - Choose whether or not to return stubs only
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getIssue = function(account, project, uid, onlyStubs, callback) {
		var filter = {};
		filter[C.REPO_NODE_LABEL_ID] = utils.stringToUUID(uid);

		var projection = {};

		if (onlyStubs)
		{
			projection[C.REPO_NODE_LABEL_ID]             = 1;
			projection[C.REPO_NODE_LABEL_NAME]           = 1;
			projection[C.REPO_NODE_LABEL_DEADLINE]       = 1;
			projection[C.REPO_NODE_LABEL_ISSUE_POSITION] = 1;
			projection[C.REPO_NODE_LABEL_ISSUE_PARENT]   = 1;
		}

		dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_ISSUES, filter, projection, function (err, issues) {
			if (err.value) {
				return callback(err);
			}

			var issueObjs = utils.bulkDecode(issues);

			return callback(responseCodes.OK, issueObjs);
		});
	};

	/*******************************************************************************
	* Get issues for a particular project and revision
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   branch         - Branch UID to query
	* @param {string}   revID          - Revision ID to query
	* @param {boolean}  onlyStubs      - Choose whether or not to return stubs only
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getIssues = function(account, project, branch, revID, onlyStubs, callback) {
		// First get the main project issues
		self.getSIDMap(account, project, branch, revID, function (err, SIDMap) {
			if (err.value) {
				return callback(err);
			}

			var sids = Object.keys(SIDMap);

			self.getObjectIssues(account, project, sids, null, onlyStubs, function (err, issues) {
				if (err.value) {
					return callback(err);
				}

				var collatedIssues = issues;

				// Now search for all federated issues
				self.getFederatedProjectList(account, project, branch, revID, function (err, refs) {
					if (err.value) {
						return callback(err);
					}

					async.concat(refs, function (ref, iter_callback) {
						var childDbName  = utils.coalesce(ref[C.REPO_NODE_LABEL_OWNER], account);
						var childProject = ref[C.REPO_NODE_LABEL_PROJECT];
						var unique       = utils.coalesce(ref[C.REPO_NODE_LABEL_UNIQUE], false);

						var childRevision = null;
						var childBranch  = null;

						if (ref[C.REPO_NODE_LABEL_RID])
						{
							if (unique)
							{
								childRevision = utils.uuidToString(ref[C.REPO_NODE_LABEL_REV_ID]);
							} else {
								childBranch   = utils.uuidToString(ref[C.REPO_NODE_LABEL_REV_ID]);
							}
						} else {
							childBranch   = C.MASTER_BRANCH_NAME;
							childRevision = C.HEAD_REVISION_NAME;
						}

						self.getSIDMap(childDbName, childProject, childBranch, childRevision, function (err, SIDMap) {
							if (err.value) {
								return iter_callback(err);
							}

							var sids = Object.keys(SIDMap);

							// For all federated child projects get a list of shared IDs
							self.getObjectIssues(childDbName, childProject, sids, null, onlyStubs, function (err, issues) {
								if (err.value) {
									return iter_callback(err);
								}

								iter_callback(responseCodes.OK, issues);
							});
						});
					},
					function (err, results) {
						// TODO: Deal with errors here

						callback(responseCodes.OK, collatedIssues.concat(results));
					});
				});
			});
		});
	};

	/*******************************************************************************
	* Get list of issues for a set of objects 
	* Optionally provide number to get a single issue for a SID
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {Array}    sids           - List of object SIDs
	* @param {number}   number         - Issue number
	* @param {boolean}  onlyStubs      - Choose whether or not to return stubs only
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getObjectIssues = function(account, project, sids, number, onlyStubs, callback) {
		if (sids.constructor !== Array) {
			sids = [sids];
		}

		sids = sids.map( function (item) { return utils.stringToUUID(item); } );

		var filter = {};
		filter[C.REPO_NODE_LABEL_PARENT] = { $in : sids };

		if ( number ) {
			filter[C.REPO_NODE_LABEL_ISSUE_NUMBER] = number;
		}

		var projection = {};

		if (onlyStubs)
		{
			projection[C.REPO_NODE_LABEL_ISSUE_COMMENTS] = 0;
		}

		dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_ISSUES, filter, {}, function (err, issues) {
			if (err.value) {
				return callback(err);
			}

			var issueObjs = utils.bulkDecode(issues);

			return callback(responseCodes.OK, issueObjs);
		});
	};

	/*******************************************************************************
	* Store issue in the database
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {Array}    sid            - SID of parent object
	* @param {string}   owner          - Owner of the issue
	* @param {JSON}     data           - Data describing the issue
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.storeIssue = function(account, project, sid, owner, data, callback) {
		dbConn.collCallback(account, project + "." + C.REPO_COLLECTION_ISSUES, false, function(err, coll) {
			if(err.value) {
				return callback(err);
			}

			if (!data[C.REPO_NODE_LABEL_ID]) {
				// TODO: Implement this using sequence counters
				coll.count(function(err, numIssues) {
					if (err) {
						return responseCodes.DB_ERROR(err);
					}

					data[C.REPO_NODE_LABEL_ISSUE_NUMBER]  = numIssues + 1;

					if (!data[C.REPO_NODE_LABEL_ISSUE_NAME]) {
						data[C.REPO_NODE_LABEL_ISSUE_NAME] = "Issue" + data[C.REPO_NODE_LABEL_ISSUE_NUMBER];
					}

					data[C.REPO_NODE_LABEL_ISSUE_OWNER] = owner;

					var newIssue = new RepoIssue(data);

					coll.insert(newIssue, function(err, count) {
						if (err) {
							return callback(responseCodes.DB_ERROR(err));
						}

						logger.logDebug("Updated " + count + " records.");

						var bson = {};
						bson[C.REPO_NODE_LABEL_ID] = newIssue.getID();
						bson[C.REPO_NODE_LABEL_ISSUE_NUMBER] = newIssue[C.REPO_NODE_LABEL_ISSUE_NUMBER];

						callback(responseCodes.OK, bson);
					});
				});
			} else {
				logger.logDebug("Updating issue " + data._id);

				data[C.REPO_NODE_LABEL_ID] = utils.stringToUUID(data[C.REPO_NODE_LABEL_ID]);

				var updateQuery = {};

				if (data[C.REPO_NODE_LABEL_ISSUE_COMMENT])
				{
					updateQuery.$push = {};
					updateQuery.$push[C.REPO_NODE_LABEL_ISSUE_COMMENTS] = {};
					updateQuery.$push[C.REPO_NODE_LABEL_ISSUE_COMMENTS][C.REPO_NODE_LABEL_ISSUE_OWNER] = owner;
					updateQuery.$push[C.REPO_NODE_LABEL_ISSUE_COMMENTS][C.REPO_NODE_LABEL_ISSUE_COMMENT] = data[C.REPO_NODE_LABEL_ISSUE_COMMENT];
				} else {
					updateQuery.$set = {};
					updateQuery.$set[C.REPO_NODE_LABEL_ISSUE_COMPLETE] = data[C.REPO_NODE_LABEL_ISSUE_COMPLETE];
				}

				var updateFilter = {};
				updateFilter[C.REPO_NODE_LABEL_ID] = data[C.REPO_NODE_LABEL_ID];

				coll.update(updateFilter, updateQuery, function(err, count) {
					if (err) {
						return callback(responseCodes.DB_ERROR(err));
					}

					logger.logDebug("Updated " + count + " records.");

					var bson = {};
					bson[C.REPO_NODE_LABEL_ID]           = utils.stringToUUID(data[C.REPO_NODE_LABEL_ID]);
					bson[C.REPO_NODE_LABEL_ISSUE_NUMBER] = data[C.REPO_NODE_LABEL_ISSUE_NUMBER];

					callback(responseCodes.OK, bson);
				});
			}
		});
	};


	/*******************************************************************************
	* Get metadata for an object with specific revision/sid or uid
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   branch         - Branch to query
	* @param {string}   revID          - Revision ID to query
	* @param {string}   sid            - SID of parent object
	* @param {string}   uid            - UID of parent object
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getMetadata = function(account, project, branch, revID, sid, uid, callback) {

		// If the uid is not specified then we are requesting a
		// specific object for a branch and revision
		if (!uid)
		{
			var filter = {};
			filter[C.REPO_NODE_LABEL_PARENTS] = utils.stringToUUID(sid);
			filter[C.REPO_NODE_LABEL_TYPE]    = C.REPO_NODE_TYPE_META;

			var projection = {};
			projection[C.REPO_NODE_LABEL_SHARED_ID] = 0;
			projection[C.REPO_NODE_LABEL_PATHS]     = 0;
			projection[C.REPO_NODE_LABEL_TYPE]      = 0;
			projection[C.REPO_NODE_LABEL_API]       = 0;
			projection[C.REPO_NODE_LABEL_PARENTS]   = 0;

			self.queryScene(account, project, branch, revID, filter, projection, function(err, fromStash, metadocs) {
				if (err.value) {
					return callback(err);
				}

				var metaObjects = utils.bulkDecode(RepoNodeMeta, metadocs);

				callback(responseCodes.OK, metaObjects);
			});
		} else {
			// In this case we want an object with a specific uid
			// first we find the revision that it belongs to
			var historyQuery = {};
			historyQuery[C.REPO_NODE_LABEL_CURRENT] = utils.stringToUUID(uid);

			var historyProjection = {};
			historyProjection[C.REPO_NODE_LABEL_ID] = 1;

			dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_HISTORY, historyQuery, historyProjection, function(err, revisions) {
				if (err.value) {
					return callback(err);
				}

				if (!revisions.length) {
					return callback(responseCodes.OBJECT_NOT_FOUND);
				}

				var revision = revisions[0];

				var filter = {};
				filter[C.REPO_NODE_LABEL_PARENTS] = revision[C.REPO_NODE_LABEL_SHARED_ID];
				filter[C.REPO_NODE_LABEL_TYPE]	  = C.REPO_NODE_TYPE_META;

				var projection = {};
				projection[C.REPO_NODE_LABEL_SHARED_ID] = 0;
				projection[C.REPO_NODE_LABEL_PATHS]     = 0;
				projection[C.REPO_NODE_LABEL_TYPE]      = 0;
				projection[C.REPO_NODE_LABEL_API]       = 0;
				projection[C.REPO_NODE_LABEL_PARENTS]   = 0;

				// TODO: This will query the history collection again, unnecessarily
				self.queryScene(account, project, null, revision, filter, projection, function(err, fromStash, metadocs) {
					if (err.value) {
						return callback(err);
					}

					var metaObjects = utils.bulkDecode(RepoNodeMeta, metadocs);

					callback(responseCodes.OK, metaObjects);
				});
			});
		}
	};


	/*******************************************************************************
	* SCENE FUNCTIONS
	*******************************************************************************/

	/*******************************************************************************
	* Replace GridFS files on a mesh append GridFS files from the database
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {boolean}  fromStash      - Whether to load from stash or not
	* @param {string}   uid            - UID of parent object
	* @param {bson}     mesh           - RepoMesh object
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.appendMeshFiles = function(account, project, fromStash, uid, mesh, callback)
	{
	        var gridfstypes = [
	            C.REPO_NODE_LABEL_VERTICES,
	            C.REPO_NODE_LABEL_FACES,
	            C.REPO_NODE_LABEL_NORMALS,
	            //C.REPO_NODE_LABEL_COLORS,
	            C.REPO_NODE_LABEL_UV_CHANNELS
	        ];

	        var subColl = fromStash ? C.REPO_COLLECTION_STASH : C.REPO_COLLECTION_SCENE;

	        // TODO: Make this more generic, get filename from field
	        async.each(gridfstypes, function (fstype, callback) {
	            dbConn.getGridFSFile(account, project + "." + subColl, uid + "_" + fstype, function(err, data)
	            {
	                if (!err.value) {
	                    mesh[fstype] = data;
	                }

	                callback();
	            });
	        }, function () {
	            return callback(responseCodes.OK, C.REPO_NODE_TYPE_MESH, uid, fromStash, RepoGraphScene.decode([mesh]));
	        });
	};


	/*******************************************************************************
	* Get Object from the database given a combination of revID/sid or uid
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   uid            - UUID of object
	* @param {string}   revID          - Revision ID
	* @param {string}   sid            - Shared ID
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getObject = function(account, project, uid, revID, sid, callback) {
		logger.logDebug("Requesting object (U, R, S) (" + uid + "," + revID + "," + sid + ")");

		var query = {};

		if (uid)
		{
			query[C.REPO_NODE_LABEL_ID] = utils.stringToUUID(uid);

			dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_REPO_STASH, query, {}, function(err, nodes) {
				if (err.value || !nodes.length)
				{
					// TODO: At this point we should generate the scene graph
					// There is no stash so just pass back the unoptimized scene graph

					dbConn.filterColl(account, project + "." + C.REPO_COLLECTION_SCENE, query, {}, function(err, nodes) {
						if (err.value) {
							return callback(err);
						}

						if (!nodes.length) {
							return callback(responseCodes.OBJECT_NOT_FOUND);
						}

						var node = nodes[0];

						var type = node[C.REPO_NODE_LABEL_TYPE];
						var uid  = utils.uuidToString(node[C.REPO_NODE_LABEL_ID]);

						if (type === C.REPO_NODE_TYPE_MESH)
						{
							self.appendMeshFiles(account, project, false, uid, node, callback);
						} else {
							return callback(responseCodes.OK, type, uid, false, RepoGraphScene.decode(nodes));
						}
					});
				} else {
					var node = nodes[0];

					var type = node[C.REPO_NODE_LABEL_TYPE];
					var uid  = utils.uuidToString(node[C.REPO_NODE_LABEL_ID]);

					// TODO: Make this more concrete
					// if a mesh load the vertices, indices, colors etc from GridFS
					if (type === C.REPO_NODE_TYPE_MESH)
					{
						self.appendMeshFiles(account, project, true, uid, node, callback);
					} else {
						return callback(responseCodes.OK, type, uid, true, RepoGraphScene.decode(nodes));
					}
				}
			});

		} else if (revID && sid) {
			query[C.REPO_NODE_LABEL_SHARED_ID] = utils.stringToUUID(sid);

			self.queryScene(account, project, revID, query, {}, function(err, fromStash, nodes) {
				if (err.value) {
					return callback(err);
				}

				if (!nodes.length) {
					return callback(responseCodes.OBJECT_NOT_FOUND);
				}

				var node = nodes[0];

				if (node[C.REPO_NODE_LABEL_TYPE] === C.REPO_NODE_TYPE_MESH)
				{
					self.getMeshFiles(account, project, fromStash, uid, node, callback);
				} else {
					return callback(responseCodes.OK, node[C.REPO_NODE_LABEL_TYPE], uid, fromStash, RepoGraphScene.decode(nodes));
				}
			});
		} else {
			return callback(responseCodes.RID_SID_OR_UID_NOT_SPECIFIED, null, null, null);
		}
	};

	/*******************************************************************************
	* Get Object from the database given a combination of revID/sid or uid
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   branch         - Branch to query
	* @param {string}   revID          - Revision ID
	* @param {string}   sid            - Shared ID
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getScene = function(account, project, branch, revision, full, callback) {
		var projection = {};

		if (!full)
		{
			projection[C.REPO_NODE_LABEL_VERTICES]    = 0;
			projection[C.REPO_NODE_LABEL_NORMALS]     = 0;
			projection[C.REPO_NODE_LABEL_FACES]       = 0;
			projection[C.REPO_NODE_LABEL_UV_CHANNELS] = 0;
		}
		
		self.queryScene(account, project, branch, revision, {}, projection, function(err, fromStash, coll) {
			callback(responseCodes.OK, RepoGraphScene.decode(coll));
		});
	};


	/*******************************************************************************
	* Get diff between two revisions, or the head of two branches
	*
	* @param {string}   account        - Account of scene to query
	* @param {string}   project        - Project of scene to query
	* @param {string}   branch         - Branch to query
	* @param {string}   revID          - Revision ID
	* @param {string}   otherbranch    - Other branch to query
	* @param {string}   otherrevID     - Other revision ID
	* @param {function} callback       - Callback function
	*******************************************************************************/
	this.getDiff = function(account, project, branch, revID, otherbranch, otherrevID, callback) {
		var historyQuery = {};

		if (revID !== null)
		{
			historyQuery[C.REPO_NODE_LABEL_ID] = utils.stringToUUID(revID);
		} else {
			var branch_id = null;

			if (branch === C.MASTER_BRANCH_NAME)
			{
				branch_id = C.MASTER_UUID;
			} else {
				branch_id = utils.stringToUUID(branch);
			}

			historyQuery[C.REPO_NODE_SHARED_ID] = branch_id;
		}

		// TODO: Here we compute the added, modified and deleted
		// should get it directly from the database really.

		/*
		var projection = {
			added: 1,
			modified: 1,
			deleted : 1
		};
		*/

		dbConn.getLatest(account, project + "." + C.REPO_COLLECTION_HISTORY, historyQuery, null, function(err, revisions)
		{
			if(err.value) {
				return callback(err);
			}

			if(!revisions.length)
			{
				return callback(responseCodes.BRANCH_NOT_FOUND);
			}

			var revision = revisions[0];

			var otherHistoryQuery = {};

			if (otherrevID !== null)
			{
				otherHistoryQuery[C.REPO_NODE_LABEL_ID] = utils.stringToUUID(otherrevID);
			} else {
				var branch_id = null;

				if (branch === C.MASTER_BRANCH_NAME)
				{
					branch_id = C.MASTER_UUID;
				} else {
					branch_id = utils.stringToUUID(otherbranch);
				}

				otherHistoryQuery[C.REPO_NODE_SHARED_ID] = branch_id;
			}

			dbConn.getLatest(account, project + "." + C.REPO_COLLECTION_HISTORY, otherHistoryQuery, null, function(err, otherrevisions)
			{
				if (err.value) {
					return callback(err);
				}

				if(!otherrevisions.length)
				{
					return callback(responseCodes.BRANCH_NOT_FOUND);
				}

				var bson = {};
				var otherrevision = otherrevisions[0];

				var historycurrent      = revision[C.REPO_NODE_LABEL_CURRENT];
				var otherhistorycurrent = otherrevision[C.REPO_NODE_LABEL_CURRENT];

				historycurrent      = utils.uuidsToStrings(historycurrent);
				otherhistorycurrent = utils.uuidsToStrings(otherhistorycurrent);

				bson[C.REPO_NODE_LABEL_ADDED_SHARED_IDS] = otherhistorycurrent.filter( function (elem)
					{
						return (historycurrent.indexOf(elem) === -1);
					}
				);

				bson[C.REPO_NODE_LABEL_DELETED_SHARED_IDS] = historycurrent.filter( function (elem)
					{
						return (otherhistorycurrent.indexOf(elem) === -1);
					}
				);

				// TODO: Compute the modified
				//if (doc["modified"])
				//	doc["modified"] = doc["modified"].map(function(uid) { return uuidToString(uid); });

				var fullUIDList = bson[C.REPO_NODE_LABEL_ADDED_SHARED_IDS].concat(bson[C.REPO_NODE_LABEL_DELETED_SHARED_IDS]);

				self.getUIDMap(account, project, fullUIDList, function (err, map) {
					if (err.value) {
						return callback(err);
					}

					bson[C.REPO_NODE_LABEL_ADDED_SHARED_IDS]   = bson[C.REPO_NODE_LABEL_ADDED_SHARED_IDS].map(function(elem) { return map[elem]; });
					bson[C.REPO_NODE_LABEL_DELETED_SHARED_IDS] = bson[C.REPO_NODE_LABEL_DELETED_SHARED_IDS].map(function(elem) { return map[elem]; });

					callback(responseCodes.OK, bson);
				});
			});
		});
	};
};

module.exports = DBInterface;