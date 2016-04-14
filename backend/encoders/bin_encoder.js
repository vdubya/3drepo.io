/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) a/exitny later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var logIface = require("../logger.js");
var C = require("../constants.js");
var uuidToString = require("../db/db_interface.js").uuidToString;
var responseCodes = require("../response_codes.js");
var utils = require("../utils.js");
var dbInterface = require("../db/db_interface.js");
var config = require("app-config").config;
var url = require("url");

// Set up REST routing calls
exports.route = function (router) {
    router.get("bin", "/:account/:project/:uid", function (req, res, params, err_callback) {
        //The Repo IO server has no capability of generating gltf binary files on the fly.
        //So this is going to call the stash and see if we have a stashed gltf in the database
        //if not, just return a NOT_FOUND

		var bytes = params.query.bytes;

		if (bytes)
		{
			var stashCollection = params.project + "." + C.REPO_COLLECTION_STASH + ".gltf";
			var urlParts = url.parse(req.url);

			bytes = JSON.parse(bytes);

			dbInterface(req[C.REQ_REPO].logger).getGridFSBytes(params.account, stashCollection, urlParts.pathname, bytes, err_callback);
		} else {
			dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, req.url, "gltf", function (callback) {
				err_callback(responseCodes.FILE_DOESNT_EXIST);
			}, err_callback);
		}
    });
};


