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

var utils      = require("../utils");
var C          = require("../constants");

/*******************************************************************************
 * RepoNode object
 *
 * @param {BSON} bson - BSON representation of a RepoNode
 *******************************************************************************/
var RepoNode = function(bson) {
    "use strict";

    // If a BSON is passed in then construct the object from it
    if (bson === null || bson === undefined)
    {
        bson = {};
    }

    // Standard ID
    this[C.REPO_NODE_LABEL_ID]        = utils.coalesce(bson[C.REPO_NODE_LABEL_ID], utils.generateUUID());
    this[C.REPO_NODE_LABEL_SHARED_ID] = utils.coalesce(bson[C.REPO_NODE_LABEL_SHARED_ID], utils.generateUUID());

    this[C.REPO_NODE_LABEL_NAME]      = utils.coalesce(bson[C.REPO_NODE_LABEL_NAME], "");

    this[C.REPO_NODE_LABEL_API]       = utils.coalesce(bson[C.REPO_NODE_LABEL_API], 1);

    this[C.REPO_NODE_LABEL_TYPE]      = C.REPO_NODE_TYPE_UNKNOWN;
    this[C.REPO_NODE_LABEL_PARENTS]   = utils.coalesce(bson[C.REPO_NODE_LABEL_PARENTS], []);
    this[C.REPO_NODE_LABEL_PATHS]     = utils.coalesce(bson[C.REPO_NODE_LABEL_PATHS], []);

    // Convert all UUIDs to strings
    this[C.REPO_NODE_LABEL_ID]        = utils.stringToUUID(this[C.REPO_NODE_LABEL_ID]);
    this[C.REPO_NODE_LABEL_SHARED_ID] = utils.stringToUUID(this[C.REPO_NODE_LABEL_SHARED_ID]);
    this[C.REPO_NODE_LABEL_PARENTS]   = utils.stringsToUUIDs(this[C.REPO_NODE_LABEL_PARENTS]);
    this[C.REPO_NODE_LABEL_PATHS]     = utils.stringsToUUIDs(this[C.REPO_NODE_LABEL_PATHS]);

    var children                     = [];

    /*******************************************************************************
    * Add a child of this node
    * @param {RepoNode} child - Child node to add
    *******************************************************************************/
    this.addChild = function(child) {
        children.push(child);
    };

    /*******************************************************************************
    * Get a list of children
    * @return {Array} - Array of child nodes
    *******************************************************************************/
    this.getChildren = function() {
        return children;
    };


    // Copy across other properties that may be on BSON
    for(var bsonAttr in bson)
    {
        if (bson.hasOwnProperty(bsonAttr))
        {
            if(!this.hasOwnProperty(bsonAttr))
            {
                this[bsonAttr] = bson[bsonAttr];
            }
        }
    }
};

/*******************************************************************************
* Get object ID
* @returns {string}
*******************************************************************************/
RepoNode.prototype.getID = function() {
    "use strict";

    return this[C.REPO_NODE_LABEL_ID];
};

/*******************************************************************************
* Get object ID as a string
* @returns {uuid}
*******************************************************************************/
RepoNode.prototype.getRawUUID = function() {
    "use strict";

    return utils.stringToUUID(this[C.REPO_NODE_LABEL_ID]);
};

module.exports = RepoNode;
