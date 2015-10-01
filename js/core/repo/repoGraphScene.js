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

// Corresponds to repoGraphScene in C++ definition of 3D Repo

var utils = require("../utils");
var C     = require("./constants");
var logger = require("./logger").logger;

var RepoNodeMesh           = require("./repoNodeMesh");
var RepoNodeTransformation = require("./repoNodeTransformation");
var RepoNodeMaterial       = require("./repoNodeMaterial");
var RepoNodeCamera         = require("./repoNodeCamera");
var RepoNodeMeta           = require("./repoNodeMeta");
var RepoNodeReference      = require("./repoNodeReference");

// Documentation
// http://mongodb.github.com/node-mongodb-native/contents.html

/**
 * Converts a given array of bson elements into a scene object.
 *
 * @param {Array} bsonArray
 * @param {Array} gridfsfiles
 */
var RepoGraphScene = function(bsonArray, gridfsfiles) {
	"use strict";

	gridfsfiles = typeof(gridfsfiles) === "undefined" ? {} : gridfsfiles;

	// return variable
	var scene = {};
	scene[C.REPO_SCENE_LABEL_MESHES_COUNT]    = 0;
	scene[C.REPO_SCENE_LABEL_MATERIALS_COUNT] = 0;
	scene[C.REPO_SCENE_LABEL_TEXTURES_COUNT]  = 0;
	scene[C.REPO_SCENE_LABEL_CAMERAS_COUNT]   = 0;
	scene[C.REPO_SCENE_LABEL_REF_COUNT]       = 0;
	scene[C.REPO_SCENE_LABEL_META_COUNT]      = 0;
	scene[C.REPO_SCENE_LABEL_MAPS_COUNT]      = 0;

	// Sort documents into categories (dictionaries of {id : bson} pairs)
	// UUID is a binary object of subtype 3 (old) or 4 (new)
	// see http://mongodb.github.com/node-mongodb-native/api-bson-generated/binary.html
	scene.transformations = {};
	scene.meshes          = {};
	scene.materials       = {};
	scene.textures        = {};
	scene.cameras         = {};
	scene.refs            = {};
	scene.metas           = {};
	scene.maps            = {};

	// dictionary of {shared_id : bson}
	scene.all             = {};

	if (bsonArray) {
		// Separate out all the nodes, meshes, materials and textures and
		// find the single root node
		for (let i = 0; i < bsonArray.length; ++i) {

			var bson = bsonArray[i];

			if (!bson[C.REPO_NODE_LABEL_SHARED_ID]) {
				logger.log("error","Shared UUID not found!");
			} else {
				var bsonID = utils.uuidToString(bson[C.REPO_NODE_LABEL_ID]);

				switch(bson[C.REPO_NODE_LABEL_TYPE]) {
					case C.REPO_NODE_TYPE_TRANSFORMATION :
						scene.transformations[bsonID] = new RepoNodeTransformation(bson);
						if (scene.transformations[bsonID].isRoot()) {
							scene.rootNode = scene.transformations[bsonID];
						}
						break;
					case C.REPO_NODE_TYPE_MESH :
						scene.meshes[bsonID] = new RepoNodeMesh(bson);
						scene[C.REPO_SCENE_LABEL_MESHES_COUNT]++;
						break;
					case C.REPO_NODE_TYPE_MATERIAL :
						scene.materials[bsonID] = new RepoNodeMaterial(bson);
						scene[C.REPO_SCENE_LABEL_MATERIALS_COUNT]++;
						break;
					case C.REPO_NODE_TYPE_TEXTURE :
						scene.textures[bsonID] = new RepoNodeTexture(bson);
						scene[C.REPO_SCENE_LABEL_TEXTURES_COUNT]++;
						break;
					case C.REPO_NODE_TYPE_CAMERA :
						scene.cameras[bsonID]  = new RepoNodeCamera(bson);
						scene[C.REPO_SCENE_LABEL_CAMERAS_COUNT]++;
						break;
					case C.REPO_NODE_TYPE_REF:
						scene.refs[bsonID]    = new RepoNodeReference(bson);
						scene[C.REPO_SCENE_LABEL_REF_COUNT]++;
						break;
					case C.REPO_NODE_TYPE_META:
						scene.metas[bsonID]   = new RepoNodeMeta(bson);
						scene[C.REPO_SCENE_LABEL_METAS_COUNT]++;
						break;
					case C.REPO_NODE_TYPE_MAP:
						scene.maps[bsonID]     = new RepoNodeMap(bson);
						scene[C.REPO_SCENE_LABEL_MAPS_COUNT]++;
						break;
					default :
						logger.log("error","Unsupported node type found: " + bson[C.REPO_NODE_LABEL_TYPE]);
				}

				let sid  = utils.uuidToString(bson[C.REPO_NODE_SHARED_ID]);
				scene.all[sid] = bson;
			}
		}
	}

	//---------------------------------------------------------------------
	// Propagate information about children from parental links
	// CAREFUL: under normal circumstances JavaScript is pass-by-value
	// unless you update the fields in place (using dot notation) or pass objects.
	// Hence children will be propagated to bson entries in array "all" as well as "meshes" etc.
	for (let sid in scene.all) {
		if (scene.all.hasOwnProperty(sid))
		{
			var parents = scene.all[sid][C.REPO_NODE_LABEL_PARENTS];

			for (let i = 0; i < parents.length; ++i) {
				var parentSID = utils.uuidToString(parents[i]);
				scene.all[parentSID].addChild(scene.all[sid]);
			}
		}
	}
};

module.exports = RepoGraphScene;

/*
/*******************************************************************************
* Given an array of BSON objects and a Type return a map of JS Objects
* @returns {Object} - Map of the objects
*******************************************************************************/
module.exports.bulkDecode = function(Type, bsons)
{
	"use strict";

	var results = {};

	for (let i = 0; i < bsons.length; i++)
	{
		var id = utils.uuidToString(bsons[i][C.REPO_NODE_LABEL_ID]);

		// If this object has a valid ID then 
		// try to construct it
		if (id) {
			results[id] =  new Type(bsons[i]);
		}
	}

	return results;
};
