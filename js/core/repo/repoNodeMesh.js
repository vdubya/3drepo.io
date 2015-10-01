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

// Corresponds to repoNodeMesh in C++ definition of 3D Repo
var utils = require("./utils.js");
var RepoBoundingBox = require("./repo3DBasic.js").RepoBoundingBox;
var RepoNode = require("./repoNode.js");
var C = require("./constants");


/*******************************************************************************
* Given a RepoNode append GridFS files from the database
*
* @param {string}   account        - Account of scene to query
* @param {string}   project        - Project of scene to query
* @param {boolean}  fromStash      - Whether to load from stash or not
* @param {string}   revID          - Revision ID to query
* @param {string}   sid            - SID of parent object
* @param {string}   uid            - UID of parent object
* @param {function} callback       - Callback function
*******************************************************************************/
var appendMeshFiles = function(account, project, fromStash, uid, obj, callback)
{
        var gridfstypes = [
            C.REPO_NODE_LABEL_VERTICES,
            C.REPO_NODE_LABEL_FACES,
            C.REPO_NODE_LABEL_NORMALS,
            //C.REPO_NODE_LABEL_COLORS,
            C.REPO_NODE_LABEL_UV_CHANNELS
        ];

        var numTasks = gridfstypes.length;
        var subColl = fromStash ? C.REPO_COLLECTION_STASH : C.REPO_COLLECTION_SCENE;

        // TODO: Make this more generic, get filename from field
        async.each(gridfstypes, function (fstype, callback) {
            dbConn.getGridFSFile(account, project + "." + subColl, uid + "_" + fstype, function(err, data)
            {
                if (!err["value"])
                    obj[fstype] = data;

                callback();
            });
        }, function (err) {
            return callback(responseCodes.OK, "mesh", uid, fromStash, repoGraphScene.decode([obj]));
        });
};


/*******************************************************************************
* Class that wraps the mesh object
* @param {BSON} bson - Database BSON object
*******************************************************************************/
var RepoNodeMesh = function(bson) {
    "use strict";
    RepoNode.call(this, bson);

    this[C.REPO_NODE_LABEL_TYPE] = C.REPO_NODE_TYPE_MESH;

    // Parse and recombine the MultiPart map
    if (bson[C.REPO_NODE_LABEL_COMBINED_MAP])
    {
        // TODO: Here we have multiple maps, including ones that
        // are no originally ours, let"s hope we never have an example
        // of this.
        var myUUID = this.getID();
        
        if (myUUID in bson[C.REPO_NODE_LABEL_COMBINED_MAP])
        {
            bson[C.REPO_NODE_LABEL_COMBINED_MAP] = bson[C.REPO_NODE_LABEL_COMBINED_MAP][myUUID];

            for(var i = 0; i < bson[C.REPO_NODE_LABEL_COMBINED_MAP].length; i++)
            {
                bson[C.REPO_NODE_LABEL_COMBINED_MAP][i][C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID] =
                    utils.uuidToString(bson[C.REPO_NODE_LABEL_COMBINED_MAP][i][C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID]);

                bson[C.REPO_NODE_LABEL_COMBINED_MAP][i][C.REPO_NODE_LABEL_MERGE_MAP_MATERIAL_ID] =
                    utils.uuidToString(bson[C.REPO_NODE_LABEL_COMBINED_MAP][i][C.REPO_NODE_LABEL_MERGE_MAP_MATERIAL_ID]);

                bson[C.REPO_NODE_LABEL_COMBINED_MAP][i][C.REPO_NODE_LABEL_MERGE_MAP_OFFSET] =
                    bson[C.REPO_NODE_LABEL_COMBINED_MAP][i][C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM];
            }
        }

        delete bson[C.REPO_NODE_LABEL_COMBINED_MAP][myUUID];
    }

    this.bbox = new RepoBoundingBox(bson[C.REPO_NODE_LABEL_BOUNDING_BOX]);

    /**
     * Extracts the mesh's bounding box
     * @returns {repoBoundingBox}
     */
    this.getBoundingBox = function() {
        return this.bbox;
    };
};

RepoNodeMesh.prototype = Object.create(RepoNode.prototype);
module.exports = RepoNodeMesh;