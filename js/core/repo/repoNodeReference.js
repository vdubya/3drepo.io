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

// Corresponds to repoNodeMeta in C++ definition of 3D Repo
var RepoNode = require("./repoNode.js");
var C        = require("../constants");

/*******************************************************************************
* Class that wraps the reference object
* @param {BSON} bson - Database BSON object
*******************************************************************************/
var RepoNodeReference = function(bson) {
    "use strict";
    
    RepoNode.call(this, bson);

    this[C.REPO_NODE_LABEL_TYPE] = C.REPO_NODE_TYPE_REF;
};

RepoNodeMeta.prototype = Object.create(RepoNode.prototype);
module.exports = RepoNodeMeta;