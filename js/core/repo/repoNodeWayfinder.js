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

var utils    = require("./utils.js");
var Vector   = require("./repo/repo3DBasic.js");
var C        = require("./constants");
var RepoNode = require("./repoNode.js");

var RepoWayfinderEntry = function(bson) {
	"use strict";

	this[C.REPO_NODE_LABEL_DIRECTION] = utils.coalesce(new Vector(bson[C.REPO_NODE_LABEL_DIRECTION]), new Vector(0,0,-1));
	this[C.REPO_NODE_LABEL_POSITION]  = utils.coalesce(new Vector(bson[C.REPO_NODE_LABEL_POSITION]), new Vector(0,0,0));

	/*******************************************************************************
	* Custom construction function
	* direction {repoVector} - Viewing direction for the record
	* position {repoVector}  - Position for the record
	* timestamp {number}     - Timestamp for the record
	*******************************************************************************/
	this.init = function(direction, position, timestamp) {
		this[C.REPO_NODE_LABEL_DIRECTION] = direction;
		this[C.REPO_NODE_LABEL_POSITION]  = position;
		this[C.REPO_NODE_LABEL_TIMESTAMP] = timestamp;
	};

	/*******************************************************************************
	* Return JSON representation of the vector
	* @returns {JSON} - Returns JSON representation of this
	*******************************************************************************/
	this.toJSON = function() {
		var bson = {};

		bson[C.REPO_NODE_LABEL_DIRECTION] = this[C.REPO_NODE_LABEL_DIRECTION].toJSON();
		bson[C.REPO_NODE_LABEL_POSITION]  = this[C.REPO_NODE_LABEL_POSITION].toJSON();

		return bson;
	};
};

/*******************************************************************************
* Class that wraps the wayfinder object
* @param {BSON} bson          - Database BSON object
*******************************************************************************/
var RepoWayfinder = function(bson) {
	"use strict";

	RepoNode.call(this, bson);

	// Timestamp
	this[C.REPO_NODE_LABEL_TIMESTAMP] = utils.coalesce(bson[C.REPO_NODE_LABEL_TIMESTAMP], new Date().getTime());

	this[C.REPO_NODE_LABEL_RECORDS] = [];

	for (let i = 0; i < bson[C.REPO_NODE_LABEL_RECORDS]; i++)
	{
		this[C.REPO_NODE_LABEL_RECORDS].push(
			new RepoWayfinderEntry(
				bson[C.REPO_NODE_LABEL_RECORDS][i]
			)
		);
	}
};

/*******************************************************************************
* Custom construction function
* username {string}  - Username for the wayfinding information
* sessionID {string} - Session ID associated with the wayfinding info
* timestamp {number} - Timestamp associated with the wayfinding info
*******************************************************************************/
RepoWayfinder.prototype.init = function(username, sessionID, timestamp)
{
	"use strict";
	
	this[C.REPO_NODE_LABEL_USER]      = username;
	this[C.REPO_NODE_LABEL_SESSION]   = sessionID;
	this[C.REPO_NODE_LABEL_TIMESTAMP] = timestamp;
};

/*******************************************************************************
* Add a wayfinding record to this object
* direction {repoVector} - Viewing direction for the record
* position {repoVector}  - Position direction for the reload
* timestamp {number}     - Timestamp for the record
*******************************************************************************/
RepoWayfinder.prototype.addRecord = function(direction, position, timestamp)
{
	"use strict";

	var newRecord = new RepoWayfinderEntry();

	newRecord.init(direction, position, timestamp);

	this[C.REPO_NODE_LABEL_RECORDS].push(newRecord);
};

/*******************************************************************************
* Return JSON representation of the vector
* @returns {JSON} - Returns JSON representation of this
*******************************************************************************/
RepoWayfinder.prototype.toJSON = function() {
	"use strict";

	var bson = {};
	
	bson[C.REPO_NODE_LABEL_ID]        = utils.uuidToString(this[C.REPO_NODE_LABEL_ID]);
	bson[C.REPO_NODE_LABEL_TIMESTAMP] = this[C.REPO_NODE_LABEL_TIMESTAMP];

	bson[C.REPO_NODE_LABEL_RECORDS]   = [];

	for (let i = 0; i < this[C.REPO_NODE_LABEL_RECORDS]; i++)
	{
		bson[C.REPO_NODE_LABEL_RECORDS].push(this[C.REPO_NODE_LABEL_RECORDS][i].toJSON());
	}
};

module.exports = RepoWayfinder;
