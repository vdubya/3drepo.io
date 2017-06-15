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

(() => {
	"use strict";

	const mongoose = require('mongoose');
	const ModelFactory = require('./factory/modelFactory');
	const RoleTemplates = require('./role_templates');
	const responseCodes = require("../response_codes");

	const schema = mongoose.Schema({
		_id : String,
		role: String,
		privileges: {},
		roles: []
	});

	schema.statics.createStandardRoles = function (teamspace, model) {
		let rolePromises = [];

		RoleTemplates.modelRoleTemplateLists.forEach(role =>
			{
				rolePromises.push(this.createRole(teamspace, model, role));
			}
		);

		return Promise.all(rolePromises);
	};

	schema.statics.createRole = function (teamspace, model, role) {
		
		let roleId = `${teamspace}.${model}.${role}`;
		
		if(!model){
			roleId = `${teamspace}.${role}`;
		}
		
		return Role.findByRoleID(roleId).then(roleFound => {
			if(roleFound){
				roleFound = roleFound.toObject();
				return { role: roleFound.role, db: roleFound.db};
			} else {
				return RoleTemplates.createRoleFromTemplate(teamspace, model, role);
			}
		});
	};

	schema.statics.dropRole = function (teamspace, role) {
		let dropRoleCmd = {
			'dropRole' : role
		};

		return this.findByRoleID(`${teamspace}.${role}`).then(role => {
			if(!role){
				return Promise.resolve();
			} else {
				return ModelFactory.db.db(teamspace).command(dropRoleCmd);
			}
		});
		
	};

	schema.statics.grantRolesToUser = function (username, roles) {
		
		let grantRoleCmd = {
			grantRolesToUser: username,
			roles: roles
		};
		
		return ModelFactory.db.admin().command(grantRoleCmd);
	};

	schema.statics.grantModelRoleToUser = function (username, teamspace, model, role) {
		
		// lazily create the role from template if the role is not found

		if(RoleTemplates.modelRoleTemplateLists.indexOf(role) === -1){
			return Promise.reject(responseCodes.INVALID_ROLE_TEMPLATE);
		}

		return this.createRole(teamspace, model, role).then(() => {

			let grantRoleCmd = {
				grantRolesToUser: username,
				roles: [{
					db: teamspace,
					role: `${model}.${role}`
				}]
			};
			
			return ModelFactory.db.admin().command(grantRoleCmd);
		});

	};

	schema.statics.findByRoleID = function(id){
		return this.findOne({ teamspace: 'admin'}, { _id: id});
	};

	schema.statics.revokeRolesFromUser = function(username, roles){

		let cmd = {
			revokeRolesFromUser: username,
			roles: roles
		};

		return ModelFactory.db.admin().command(cmd);
	};

	var Role = ModelFactory.createClass(
		'Role', 
		schema, 
		() => {
			return 'system.roles';
		}
	);

	module.exports = Role;

})();