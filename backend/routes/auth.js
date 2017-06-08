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

(function() {
	"use strict";
	var express = require("express");
	var router = express.Router({mergeParams: true});
	var responseCodes = require("../response_codes.js");
	var C = require("../constants");
	var config = require('../config');
	//var systemLogger    = require("../logger.js").systemLogger;
	var utils = require("../utils");
	var User = require("../models/user");
	var Mailer = require("../mailer/mailer");




	router.post("/login", login);
	router.post("/logout", logout);

	router.get("/login", checkLogin);

	router.post('/contact', contact);

	// function expireSession(req) {
	// 	if (req.session)
	// 	{
	// 		req.session.cookie.expires = new Date(0);
	// 		req.session.cookie.maxAge = 0;
	// 	}
	// }

	function createSession(place, req, res, next, user){
		req.session.regenerate(function(err) {
			if(err) {
				responseCodes.respond(place, responseCodes.EXTERNAL_ERROR(err), res, {username: user.username});
			} else {
				req[C.REQ_REPO].logger.logDebug("Authenticated user and signed token.");

				req.session[C.REPO_SESSION_USER] = user;
				req.session.cookie.domain        = config.cookie_domain;

				if (config.cookie.maxAge)
				{
					req.session.cookie.maxAge = config.cookie.maxAge;
				}

				responseCodes.respond(place, req, res, next, responseCodes.OK, {username: user.username, roles: user.roles});
			}
		});
	}

	function login(req, res, next){
		let responsePlace = utils.APIInfo(req);

		req[C.REQ_REPO].logger.logInfo("Authenticating user", { username: req.body.username});

		if(req.session.user){
			return responseCodes.respond(responsePlace, req, res, next, responseCodes.ALREADY_LOGGED_IN, responseCodes.ALREADY_LOGGED_IN);
		}

		User.authenticate(req[C.REQ_REPO].logger, req.body.username, req.body.password).then(user => {
			req[C.REQ_REPO].logger.logInfo("User is logged in", { username: req.body.username});
			createSession(responsePlace, req, res, next, {username: user.user, roles: user.roles});
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
		});
	}

	function checkLogin(req, res, next){
		if (!req.session || !req.session.user) {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.NOT_LOGGED_IN, {});
		} else {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {username: req.session.user.username});
		}
	}

	function logout(req, res, next){
		if(!req.session || !req.session.user){
			return responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.NOT_LOGGED_IN, {});
		}

		var username = req.session.user.username;

		req.session.destroy(function() {
			req[C.REQ_REPO].logger.logDebug("User has logged out.");
			//res.clearCookie("connect.sid", { domain: config.cookie.domain, path: "/" });
			responseCodes.respond("Logout POST", req, res, next, responseCodes.OK, {username: username});
		});
	}

	function contact(req, res, next){

		let responsePlace = utils.APIInfo(req);

		Mailer.sendContactEmail({
			email: req.body.email,
			name: req.body.name,
			information: req.body.information
		}).then(() => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { status: 'success'});
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || err, err.resCode ? {} : err);
		});

	}

	module.exports = router;
}());
