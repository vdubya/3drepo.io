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

// Corresponds to repoNodeTransformation in C++ definition of 3D Repo
var RepoNode       = require("./repoNode");
var RepoMatrix     = require("./repo3DBasic").RepoMatrix;
var C              = require("../constants");

/*******************************************************************************
 * RepoNodeTransformation object
 *
 * @param {BSON} bson - BSON representation of a RepoNodeTransformation
 *******************************************************************************/
var RepoNodeTransformation = function(bson)
{
	"use strict";
	RepoNode.call(this, bson);

    this[C.REPO_NODE_LABEL_TYPE]   = C.REPO_NODE_TYPE_TRANSFORMATION;
	this[C.REPO_NODE_LABEL_MATRIX] = new RepoMatrix(bson[C.REPO_NODE_LABEL_MATRIX]);
};

/*******************************************************************************
* Returns whether or not this transformation is root
* @returns {boolean}
*******************************************************************************/
RepoNodeTransformation.prototype.isRoot = function() 
{
	"use strict";

	return !this[C.REPO_NODE_LABEL_PARENTS].length;
};

module.exports = RepoNodeTransformation;