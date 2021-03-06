/**
 *  Copyright (C) 2018 3D Repo Ltd
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

"use strict";

const express = require("express");
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");
const C = require("../constants");
const responseCodes = require("../response_codes.js");
const Viewpoint = require("../models/viewpoint");
const utils = require("../utils");
const systemLogger = require("../logger.js").systemLogger;

router.get("/viewpoints/", middlewares.issue.canView, listViewpoints);
router.get("/viewpoints/:uid", middlewares.issue.canView, findViewpoint);
router.put("/viewpoints/:uid", middlewares.issue.canCreate, updateViewpoint);
router.post("/viewpoints/", middlewares.issue.canCreate, createViewpoint);
router.delete("/viewpoints/:uid", middlewares.issue.canCreate, deleteViewpoint);
router.get("/viewpoints/:uid/thumbnail.png", middlewares.issue.canView, getViewpointThumbnail);

const getDbColOptions = function(req){
	return {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};
};

function listViewpoints(req, res, next){

	const dbCol = getDbColOptions(req);
	let place = utils.APIInfo(req);

	Viewpoint.listViewpoints(dbCol, req.query)
		.then(viewpoints => {

			responseCodes.respond(place, req, res, next, responseCodes.OK, viewpoints);

		}).catch(err => {

			systemLogger.logError(err.stack);
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);

		});
}

function findViewpoint(req, res, next){

	const dbCol = getDbColOptions(req);
	let place = utils.APIInfo(req);

	Viewpoint.findByUID(dbCol, req.params.uid)
		.then(view => {
			if(!view){
				return Promise.reject({resCode: responseCodes.VIEW_NOT_FOUND});
			} else {
				view._id = utils.uuidToString(view._id);
				return Promise.resolve(view);
			}
		}).then(view => {
			responseCodes.respond(place, req, res, next, responseCodes.OK, view);
		}).catch(err => {
			systemLogger.logError(err.stack);
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
}

function createViewpoint(req, res, next){

	let place = utils.APIInfo(req);

	Viewpoint.createViewpoint(getDbColOptions(req), req.body)
		.then(view => {
			responseCodes.respond(place, req, res, next, responseCodes.OK, view);
		}).catch(err => {
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
}

function deleteViewpoint(req, res, next){

	let place = utils.APIInfo(req);

	Viewpoint.deleteViewpoint(getDbColOptions(req), req.params.uid).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, { "status": "success"});
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function updateViewpoint(req, res, next){

	const dbCol = getDbColOptions(req);
	let place = utils.APIInfo(req);

	Viewpoint.findByUID(dbCol, req.params.uid)
		.then(view => {
			if(!view){
				return Promise.reject({resCode: responseCodes.VIEW_NOT_FOUND});
			} else {
				return Viewpoint.updateAttrs(dbCol, utils.stringToUUID(req.params.uid), req.body);
			}
		}).then(view => {
			responseCodes.respond(place, req, res, next, responseCodes.OK, view);
		}).catch(err => {
			systemLogger.logError(err.stack);
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
}

function getViewpointThumbnail(req, res, next){

	let place = utils.APIInfo(req);
	let dbCol = {account: req.params.account, model: req.params.model};

	Viewpoint.getThumbnail(dbCol, req.params.uid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

module.exports = router;
