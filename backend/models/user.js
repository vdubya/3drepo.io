/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var mongoose = require("mongoose");
var ModelFactory = require('./factory/modelFactory');
var responseCodes = require('../response_codes.js');
var _ = require('lodash');
var DB = require('../db/db');
var crypto = require('crypto');
var utils = require("../utils");
var History = require('./history');
var Role = require('./role');

var systemLogger = require("../logger.js").systemLogger;

var Subscription = require('./subscription');
var config = require('../config');


var ModelSetting = require('./modelSetting');
var C = require('../constants');
var userBilling = require("./userBilling");
var job = require('./job');
var permissionTemplate = require('./permissionTemplate');
var teamspacePermission = require('./teamspacePermission');
var Project = require('./project');

var schema = mongoose.Schema({
	_id : String,
	user: String,
	//db: String,
	customData: {
		firstName: String,
		lastName: String,
		email: String,
		inactive: Boolean,
		resetPasswordToken: {
			expiredAt: Date,
			token: String
		},
		emailVerifyToken: {
			expiredAt: Date,
			token: String
		},
		billing: { 
			type: userBilling, 
			default: userBilling,
			get: function(billing){
				if(billing){
					billing._parent = this;
				}
				return billing;
			}

		},
		avatar: Object,
		lastLoginAt: Date,
		jobs: {
			type: [job.schema],
			get: function(jobs){
				return job.methods.init(this, jobs);
			}
		},
		permissionTemplates: {
			type: [permissionTemplate.schema],
			get: function(permissionTemplates){
				return permissionTemplate.methods.init(this, permissionTemplates);
			}
		},
		//teamspace level permissions
		permissions: {
			type: [teamspacePermission.schema],
			get: function(permissions){
				return teamspacePermission.methods.init(this, permissions);
			}
		},
		// fields to speed up listing all projects and models the user has access to
		models: [{
			_id: false,
			teamspace: String,
			model: String
		}]
	},
	roles: [{}]
});

schema.statics.historyChunksStats = function(dbName){
	'use strict';

	return ModelFactory.db.db(dbName).listCollections().toArray().then(collections => {

		let historyChunks = _.filter(collections, collection => collection.name.endsWith('.history.chunks'));
		let promises = [];

		historyChunks.forEach(collection => {
			promises.push(ModelFactory.db.db(dbName).collection(collection.name).stats());
		});

		return Promise.all(promises);

	});

};

schema.statics.authenticate = function(logger, username, password){
	'use strict';

	let authDB = DB(logger).getAuthDB();

	if(!username || !password){
		return Promise.reject({ resCode: responseCodes.INCORRECT_USERNAME_OR_PASSWORD });
	}

	return authDB.authenticate(username, password).then(() => {
		return this.findByUserName(username);
	}).then(user => {
		if(user.customData && user.customData.inactive) {
			return Promise.reject({resCode: responseCodes.USER_NOT_VERIFIED});
		}

		if(!user.customData){
			user.customData = {};
		}
		
		user.customData.lastLoginAt = new Date();
		return user.save();

	}).catch( err => {
		return Promise.reject(err.resCode ? err : {resCode: utils.mongoErrorToResCode(err)});
	});
};


// schema.statics.filterRoles = function(roles, database){
// 	return  database ? _.filter(users, { 'db': database }) : roles;
// };

schema.statics.findByUserName = function(user){
	return this.findOne({teamspace: 'admin'}, { user });
};

schema.statics.findByEmail = function(email){
	return this.findOne({teamspace: 'admin'}, { 'customData.email': email });
};

schema.statics.findByPaypalPaymentToken = function(token){
	return this.findOne({teamspace: 'admin'}, { 'customData.billing.paypalPaymentToken': token });
};

schema.statics.isEmailTaken = function(email, exceptUser){
	'use strict';

	let query = { 'customData.email': email};

	if(exceptUser){
		query = { 'customData.email': email, 'user': { '$ne': exceptUser }};
	}

	return this.count({teamspace: 'admin'}, query);
};


schema.statics.findUserByBillingId = function(billingAgreementId){
	return this.findOne({teamspace: 'admin'}, { 'customData.billing.billingAgreementId': billingAgreementId });
};


schema.statics.updatePassword = function(logger, username, oldPassword, token, newPassword){
	'use strict';

	if(!((oldPassword || token) && newPassword)){
		return Promise.reject({ resCode: responseCodes.INVALID_INPUTS_TO_PASSWORD_UPDATE});
	}

	var checkUser;
	var user;

	if(oldPassword){
		
		if(oldPassword === newPassword){
			return Promise.reject(responseCodes.NEW_OLD_PASSWORD_SAME);
		}

		checkUser = this.authenticate(logger, username, oldPassword);
	} else if (token){

		checkUser = this.findByUserName(username).then(_user => {

			user = _user;

			var tokenData = user.customData.resetPasswordToken;
			if(tokenData && tokenData.token === token && tokenData.expiredAt > new Date()){
				return Promise.resolve();
			} else {
				return Promise.reject({ resCode: responseCodes.TOKEN_INVALID });
			}
		});
	}

	return checkUser.then(() => {

		let updateUserCmd = {
			'updateUser' : username,
			'pwd': newPassword
		 };

		 return ModelFactory.db.admin().command(updateUserCmd);

	}).then(() => {

		if(user){
			user.customData.resetPasswordToken = undefined;
			return user.save().then(() => Promise.resolve());
		}

		return Promise.resolve();

	}).catch( err => {
		return Promise.reject(err.resCode ? err : {resCode: utils.mongoErrorToResCode(err)});
	});

};

schema.statics.usernameRegExp = /^[a-zA-Z][\w]{1,19}$/;

schema.statics.createUser = function(logger, username, password, customData, tokenExpiryTime){
	'use strict';
	let adminDB = ModelFactory.db.admin();

	let cleanedCustomData = {};
	let emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

	if(config.auth.allowPlusSignInEmail){
		emailRegex = /^([+a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
	}

	if(customData && (!customData.email || !customData.email.match(emailRegex))){
		return Promise.reject({ resCode: responseCodes.SIGN_UP_INVALID_EMAIL });
	}


	if(!username || !this.usernameRegExp.test(username)){
		return Promise.reject({ resCode: responseCodes.INVALID_USERNAME});
	}

	['firstName', 'lastName', 'email'].forEach(key => {
		if (customData && customData[key]){
			cleanedCustomData[key] = customData[key];
		}
	});

	let billingInfo = {};

	['firstName', 'lastName', 'phoneNo', 'countryCode', 'jobTitle', 'company'].forEach(key => {
		if (customData && customData[key]){
			billingInfo[key] = customData[key];
		}
	});

	//cleanedCustomData.billing = {};

	var expiryAt = new Date();
	expiryAt.setHours(expiryAt.getHours() + tokenExpiryTime);

	cleanedCustomData.inactive = true;

	//default permission
	cleanedCustomData.permissions = [{
		user: username,
		permissions: [C.PERM_TEAMSPACE_ADMIN]
	}];

	//default templates
	cleanedCustomData.permissionTemplates = [
		{
			_id: C.VIEWER_TEMPLATE,
			permissions: C.VIEWER_TEMPLATE_PERMISSIONS
		},
		{
			_id: C.COMMENTER_TEMPLATE,
			permissions: C.COMMENTER_TEMPLATE_PERMISSIONS
		},
		{
			_id: C.COLLABORATOR_TEMPLATE,
			permissions: C.COLLABORATOR_TEMPLATE_PERMISSIONS
		}
	];

	if(customData){
		cleanedCustomData.emailVerifyToken = {
			token: crypto.randomBytes(64).toString('hex'),
			expiredAt: expiryAt
		};
	}


	return this.isEmailTaken(customData.email).then(count => {

		if(count === 0){

			return adminDB.addUser(username, password, {customData: cleanedCustomData, roles: []}).then( () => {
				return Promise.resolve(cleanedCustomData.emailVerifyToken);
			}).catch(err => {
				return Promise.reject({resCode : utils.mongoErrorToResCode(err)});
			});

		} else {
			return Promise.reject({resCode: responseCodes.EMAIL_EXISTS });
		}

	}).then(() => {
		return this.findByUserName(username);
	}).then(user => {
		user.customData.billing.billingInfo.changeBillingAddress(billingInfo);
		return user.save();
	}).then(() => {
		return Promise.resolve(cleanedCustomData.emailVerifyToken);
	});
};

schema.statics.verify = function(username, token, options){
	'use strict';

	options = options || {};

	let allowRepeatedVerify = options.allowRepeatedVerify;
	let skipImportToyModel = options.skipImportToyModel;
	let skipCreateBasicPlan = options.skipCreateBasicPlan;

	let user;

	return this.findByUserName(username).then(_user => {
		
		user = _user;

		var tokenData = user && user.customData && user.customData.emailVerifyToken;

		if(!user){

			return Promise.reject({ resCode: responseCodes.TOKEN_INVALID});

		} else if(!user.customData.inactive && !allowRepeatedVerify){

			return Promise.reject({ resCode: responseCodes.ALREADY_VERIFIED});

		} else if(tokenData.token === token && tokenData.expiredAt > new Date()){


			user.customData.inactive = undefined;
			user.customData.emailVerifyToken = undefined;
			return user.save();


		} else {
			return Promise.reject({ resCode: responseCodes.TOKEN_INVALID});
		}

	}).then(user => {

		if(!skipImportToyModel){

			//import toy model
			var ModelHelper = require('./helper/model');

			ModelHelper.importToyModel(username).catch(err => {
				systemLogger.logError('Failed to import toy model', { err : err && err.stack ? err.stack : err});
			});
		}

		if(!skipCreateBasicPlan){
			//basic quota
			return user.createSubscription(Subscription.getBasicPlan().plan, user.user, true, null).then(() => user);
		}

		return Promise.resolve();

	}).then(() => {

		return Role.createRole(username, null, C.ADMIN_TEMPLATE);

	}).then(role => {

		return Role.grantRolesToUser(username, [role]);
	});
};



schema.methods.getAvatar = function(){
	return this.customData && this.customData.avatar || null;
};

schema.methods.updateInfo = function(updateObj){
	'use strict';

	let updateableFields = [ 'firstName', 'lastName', 'email' ];

	this.customData = this.customData || {};

	updateableFields.forEach(field => {
		if(updateObj.hasOwnProperty(field)){
			this.customData[field] = updateObj[field];
		}
	});

	return User.isEmailTaken(this.customData.email, this.user).then(count => {
		if(count === 0){
			return this.save();
		} else {
			return Promise.reject({ resCode: responseCodes.EMAIL_EXISTS });
		}
	});
};

schema.statics.getForgotPasswordToken = function(username, email, tokenExpiryTime){

	var expiryAt = new Date();
	expiryAt.setHours(expiryAt.getHours() + tokenExpiryTime);

	var resetPasswordToken = {
		token: crypto.randomBytes(64).toString('hex'),
		expiredAt: expiryAt
	};

	return this.findByUserName(username).then(user => {

		if(!user){
			return Promise.reject(responseCodes.USER_EMAIL_NOT_MATCH);
		}

		if(user.customData.email !== email){
			return Promise.reject({ resCode: responseCodes.USER_EMAIL_NOT_MATCH});
		}

		user.customData.resetPasswordToken = resetPasswordToken;

		return user.save();

	}).then(() => {
		return Promise.resolve(resetPasswordToken);
	});


};

schema.statics.grantRoleToUser = function(username, db, role){
	'use strict';

	return this.findByUserName(username).then(user => {

		let dup = false;
		user.roles.forEach(_role => {
			if(_role.role === role && _role.db === db){
				dup = true;
			}
		});

		if(!dup){
			user.roles.push({ role, db});

			let grantRoleCmd = {
				grantRolesToUser: username,
				roles: user.roles
			};

			return ModelFactory.db.admin().command(grantRoleCmd);
		}

		return Promise.resolve();

	});
};

schema.statics.revokeRolesFromUser = function(username, db, role){
	'use strict';

	let cmd = {
		revokeRolesFromUser: username,
		roles: [{ role, db }]
	};

	return ModelFactory.db.admin().command(cmd);
};

function _fillInModelDetails(teamspaceName, setting, permissions){
	'use strict';

	//console.log('permissions', permissions)
	const ModelHelper = require('./helper/model');

	let model = {
		federate: setting.federate,
		permissions: permissions,
		model: setting._id,
		name: setting.name,
		status: setting.status,
		project: setting.project
	};

	return History.findByBranch({teamspace: teamspaceName, model: model.model}, C.MASTER_BRANCH_NAME).then(history => {

		if(history){
			model.timestamp = history.timestamp;
		} else {
			model.timestamp = null;
		}

		if(setting.federate){
		
			//list all sub models of a fed model
			return ModelHelper.listSubModels(teamspaceName, model.model, C.MASTER_BRANCH_NAME).then(subModels => {
				model.subModels = subModels;
			}).then(() => model);

		}

		return model;
	});

}
//list all models in a teamspace
function _getAllModels(teamspaceName, permissions){
	'use strict';

	let models = [];
	let fedModels = [];

	return ModelSetting.find({teamspace: teamspaceName}).then(settings => {

		let promises = [];

		settings.forEach(setting => {
			promises.push(
				_fillInModelDetails(teamspaceName, setting, permissions).then(model => {
					setting.federate ? fedModels.push(model) : models.push(model);
				})
			);
		});

		return Promise.all(promises).then(() => {
			// fill in sub model name
			fedModels.forEach(fedModel => {
				fedModel.subModels.forEach(subModel => {
					const model = models.find(m => m.model === subModel.model);
					if(model){
						subModel.name = model.name;
					}
				});
			});

		}).then(() => { return {models, fedModels}; });
	});
}

// find projects and put models into project
function _addProjects(teamspace){
	'use strict';

	return Project.find({teamspace: teamspace.teamspace}, {}).then(projects => {

		projects.forEach((project, i) => {
		
			project = project.toObject();
			project.models = [];

			projects[i] = project;

			const findModel = (x, currModel, index, models) => {
				if(currModel.project === project.name){
					project.models.push(currModel);
					models.splice(index, 1);
				}
			};

			teamspace.models.reduceRight(findModel, 0);
			teamspace.fedModels.reduceRight(findModel, 0);

			//project.models = _.compact(project.models);

		});

		teamspace.projects = projects;
	});
}


function _findModelDetails(dbUserCache, username, model){
	'use strict';

	let getUser;
	let dbUser;

	if(dbUserCache[model.teamspace]){
		getUser = Promise.resolve(dbUserCache[model.teamspace]);
	} else {
		getUser = User.findByUserName(model.teamspace).then(user => {
			dbUserCache[model.teamspace] = user;
			return dbUserCache[model.teamspace];
		});
	}

	return getUser.then(_user => {
		dbUser = _user;
		return ModelSetting.findById({teamspace: model.teamspace}, model.model);

	}).then(setting => {

		let permissions = [];

		if(!setting){
			setting = { _id: model.model };
		} else {
			const template = setting.findPermissionByUser(username);
			
			if (template){
				permissions = dbUser.customData.permissionTemplates.findById(template.permission).permissions;
			}
		}

		return {setting, permissions};
	});
}

function _calSpace(user){
	'use strict';

	let quota = user.customData.billing.subscriptions.getSubscriptionLimits();

	return User.historyChunksStats(user.user).then(stats => {

		if(stats && quota.spaceLimit > 0){
			let totalSize = 0;
			stats.forEach(stat => {
				totalSize += stat.size;
			});

			quota.spaceUsed = totalSize;
		} else if(quota) {
			quota.spaceUsed = 0;
		}

		return quota;
	});

}

function _sortTeamspacesAndModels(teamspaces){
	'use strict';

	teamspaces.forEach(teamspace => {
		teamspace.models.sort((a, b) => {
			if(a.timestamp < b.timestamp){
				return 1;
			} else if (a.timestamp > b.timestamp){
				return -1;
			} else {
				return 0;
			}
		});
	});

	teamspaces.sort((a, b) => {
		if (a.teamspace.toLowerCase() < b.teamspace.toLowerCase()){
			return -1;
		} else if (a.teamspace.toLowerCase() > b.teamspace.toLowerCase()) {
			return 1;
		} else {
			return 0;
		}
	});
}

schema.methods.listTeamspaces = function(){
	'use strict';

	let teamspaces = [];

	// team space level permission
	return User.findTeamspacesUserHasAccess(this.user).then(dbUsers => {

		let addTeamspacePromises = [];

		dbUsers.forEach(user => {
			
			let teamspace = {
				teamspace: user.user,
				models: [],
				fedModels: [],
				isAdmin: true,
				permissions: user.toObject().customData.permissions[0].permissions
			};

			teamspaces.push(teamspace);

			addTeamspacePromises.push(
				// list all models under this teamspace as they have full access
				_getAllModels(teamspace.teamspace, C.MODEL_PERM_LIST).then(data => {
					teamspace.models = data.models;
					teamspace.fedModels = data.fedModels;
				}),
				// add space usage stat info into teamspace object
				_calSpace(user).then(quota => teamspace.quota = quota)
			);
			
		});

		return Promise.all(addTeamspacePromises);

	// model level permission
	}).then(() => {

		//find all models (and therefore its team space but with limited access) user has access to
		let dbUserCache = {};
		let addModelPromises = [];

		this.customData.models.forEach(model => {

			const findModel = teamspaces.find(teamspace => {
				return teamspace.models.find(_model => _model.model === model.model) || 
				teamspace.fedModels.find(_model => _model.model === model.model);
			});

			//add project to list if not covered previously
			if(!findModel){

				let teamspace = teamspaces.find(teamspace => teamspace.teamspace === model.teamspace);
				
				if(!teamspace){
					teamspace = {teamspace: model.teamspace, models: [], fedModels: []};
					teamspaces.push(teamspace);
				}

				addModelPromises.push(
					_findModelDetails(dbUserCache, this.user, { 
						teamspace: model.teamspace, model: model.model 
					}).then(data => {
						//console.log('data', JSON.stringify(data, null ,2))
						return _fillInModelDetails(teamspace.teamspace, data.setting, data.permissions);
					}).then(_model => {
						//push result to teamspace object
						_model.federate ? teamspace.fedModels.push(_model) : teamspace.models.push(_model);
					})
				);
			}

		});

		return Promise.all(addModelPromises);

	//add projects and put models into projects for each teamspace
	}).then(() => {

		//sorting models
		_sortTeamspacesAndModels(teamspaces);

		// own acconut always ranks top of the list
		let myTeamspaceIndex = teamspaces.findIndex(teamspace => teamspace.teamspace === this.user);
		if(myTeamspaceIndex > -1){
			let myTeamspace = teamspaces[myTeamspaceIndex];
			teamspaces.splice(myTeamspaceIndex, 1);
			teamspaces.unshift(myTeamspace);
		}

		return Promise.all(teamspaces.map(teamspace => _addProjects(teamspace)))
			.then(() => teamspaces);

	});

};

schema.methods.buySubscriptions = function(plans, billingUser, billingAddress){
	"use strict";

	let billingAgreement;

	plans = plans || [];
	//console.log(this.customData);
	
	return this.customData.billing.buySubscriptions(plans, this.user, billingUser, billingAddress).then(_billingAgreement => {
		
		billingAgreement = _billingAgreement;
		return this.save();

	}).then(() => {
		return Promise.resolve(billingAgreement || {});
	});
};

schema.statics.findTeamspacesUserHasAccess = function(user){
	//find all team spaces (teamspaces) user has access to
	return User.find( 
		{teamspace: 'admin'},
		{ 'customData.permissions': { 
			$elemMatch: {
				user: user, 
				permissions: { '$in': [C.PERM_CREATE_PROJECT, C.PERM_TEAMSPACE_ADMIN] }
			}
		}},
		{ 'customData.permissions.$' : 1, 'user': 1, 'customData.billing': 1}
	);
};

schema.statics.activateSubscription = function(billingAgreementId, paymentInfo, raw){
	'use strict';


	let dbUser;

	return this.findUserByBillingId(billingAgreementId).then(user => {

		dbUser = user;

		if(!dbUser){
			return Promise.reject({ message: `No users found with billingAgreementId ${billingAgreementId}`});
		}

		return dbUser.customData.billing.activateSubscriptions(dbUser.user, paymentInfo, raw);

	}).then(() => {
		return dbUser.save();
	}).then(() => {
		return Promise.resolve({subscriptions: dbUser.customData.billing.subscriptions, teamspace: dbUser, payment: paymentInfo});
	});

};

schema.methods.executeBillingAgreement = function(){
	'use strict';
	return this.customData.billing.executeBillingAgreement(this.user).then(() => {
		return this.save();
	});
};

schema.methods.removeAssignedSubscriptionFromUser = function(id, cascadeRemove){
	'use strict';

	return this.customData.billing.subscriptions.removeAssignedSubscriptionFromUser(id, this.user, cascadeRemove).then(subscription => {
		return this.save().then(() => subscription);
	});

};

schema.methods.assignSubscriptionToUser = function(id, userData){
	'use strict';

	return this.customData.billing.subscriptions.assignSubscriptionToUser(id, userData).then(subscription => {
		return this.save().then(() => subscription);
	});
};

schema.methods.updateAssignDetail = function(id, data){
	'use strict';

	return this.customData.billing.subscriptions.updateAssignDetail(id, data).then(subscription => {
		return this.save().then(() => subscription);
	});
};

schema.methods.createSubscription = function(plan, billingUser, active, expiredAt){
	'use strict';

	//console.log('create sub', plan, this.user, billingUser);
	this.customData.billing.billingUser = billingUser;
	//console.log(' this.customData.billing.subscriptions',  this.customData.billing.subscriptions);
	let subscription = this.customData.billing.subscriptions.addSubscription(plan, active, expiredAt);
	//this.markModified('customData.billing');
	//console.log(this.user, this.customData.billing.billingUser, subscription)
	return this.save().then(() => {
		return Promise.resolve(subscription);
	});

};

// remove model record for models list
schema.statics.removeModel = function(user, teamspace, model){
	'use strict';

	return User.update( {teamspace: 'admin'}, {user}, {
		$pull: { 
			'customData.models' : {
				teamspace: teamspace,
				model: model
			} 
		} 
	});
};

schema.statics.removeModelFromAllUser = function(teamspace, model){
	'use strict';

	return User.update( {teamspace: 'admin'}, {
		'customData.models':{
			'$elemMatch':{
				teamspace: teamspace,
				model: model
			}
		}
	}, {
		$pull: { 
			'customData.models' : {
				teamspace: teamspace,
				model: model
			} 
		} 
	}, {'multi': true});
};

var User = ModelFactory.createClass(
	'User',
	schema,
	() => {
		return 'system.users';
	}
);

module.exports = User;
