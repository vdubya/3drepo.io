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

var _        = require("underscore");
var utils    = require("./utils.js");
var C        = require("./constants");

var RepoIssue = function(bson) {
	"use strict";

    // If a BSON is passed in then construct the object from it
    if (bson === null || bson === undefined)
    {
        bson = {};
    }

    this[C.REPO_NODE_LABEL_ID]        		 = utils.coalesce(bson[C.REPO_NODE_LABEL_ID], utils.generateUUID());
    this[C.REPO_NODE_LABEL_ID]               = utils.stringToUUID(this[C.REPO_NODE_LABEL_ID]);

    this[C.REPO_NODE_LABEL_ISSUE_CREATED]    = utils.coalesce(bson[C.REPO_NODE_LABEL_ISSUE_CREATED], (new Date()).getTime());
    
	if (bson[C.REPO_NODE_LABEL_ISSUE_OWNER])
	{
		this[C.REPO_NODE_LABEL_ISSUE_OWNER] = bson[C.REPO_NODE_LABEL_ISSUE_OWNER];
	}

	if (bson[C.REPO_NODE_LABEL_ISSUE_NAME])
	{
		this[C.REPO_NODE_LABEL_ISSUE_NAME] = bson[C.REPO_NODE_LABEL_ISSUE_NAME];
	}

	if (bson[C.REPO_NODE_LABEL_ISSUE_NUMBER])
	{
		this[C.REPO_NODE_LABEL_ISSUE_NUMBER] = bson[C.REPO_NODE_LABEL_ISSUE_NUMBER];
	}

	if (bson[C.REPO_NODE_LABEL_ISSUE_POSITION])
	{
		this[C.REPO_NODE_LABEL_ISSUE_POSITION] = bson[C.REPO_NODE_LABEL_POSITION];
	}

	if (bson[C.REPO_NODE_LABEL_ISSUE_PARENT])
	{
		this[C.REPO_NODE_LABEL_ISSUE_PARENT] = utils.uuidToString(bson[C.REPO_NODE_LABEL_ISSUE_PARENT]);
	}

	if (bson[C.REPO_NODE_LABEL_ISSUE_COMMENTS])	
	{
		this[C.REPO_NODE_LABEL_ISSUE_COMMENTS] = utils.uuidToString(bson[C.REPO_NODE_LABEL_ISSUE_COMMENTS]);
	}


setEnum("REPO_NODE_LABEL_ISSUE_CREATED", "created");

};

/*******************************************************************************
* Return JSON representation of issue for DB storage
* @returns {JSON} - Returns JSON representation of this
*******************************************************************************/
RepoIssue.prototype.toDB = function() {
	"use strict";
	var bson = _.clone(this);

	bson[C.REPO_NODE_LABEL_ID]           = utils.stringToUUID(bson[C.REPO_NODE_LABEL_ID]);
	bson[C.REPO_NODE_LABEL_ISSUE_PARENT] = utils.stringToUUID(bson[C.REPO_NODE_LABEL_ISSUE_PARENT]);

	return bson;
};

module.exports = RepoIssue;
