'use strict';

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

const request = require('supertest');
const expect = require('chai').expect;
const app = require("../../services/api.js").createApp(
	{ session: require('express-session')({ secret: 'testing'}) }
);
const log_iface = require("../../logger.js");
const systemLogger = log_iface.systemLogger;
const responseCodes = require("../../response_codes.js");
const async = require('async');
const _ = require('lodash');


describe('New URL structure', function () {

	let server;
	let agent;
	let username = 'newroute';
	let password = 'newroute';
	let modelName = 'modelA';
	let modelId = '5f28f37f-58b9-40ec-9a31-f178523be31f';
	let project = 'project1';

	before(function(done){
		server = app.listen(8080, function () {
			console.log('API test server is listening on port 8080!');

			agent = request.agent(server);
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				done(err);
			});

		});
	});


	after(function(done){
		server.close(function(){
			console.log('API test server is closed');
			done();
		});
	});

	it('should able to get model by id', function(done){

		agent.get(`/teamspaces/${username}/models/${modelId}.json`)
		.expect(200, function(err, res){
			expect(err).to.be.null
			expect(res.body.name).to.equal(modelName);
			done();
		});
	
	});

	it('should able to get model by name and project', function(done){

		agent.get(`/teamspaces/${username}/projects/${project}/models/${modelName}.json`)
		.expect(200, function(err, res){
			expect(err).to.be.null
			expect(res.body.name).to.equal(modelName);
			done();
		});
	
	});


});
