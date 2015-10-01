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

// Corresponds to repoNodeCamera in C++ definition of 3D RepO
var RepoNode   = require("./repoNode");
var RepoVector = require("./repo3DBasic").RepoVector;
var C          = require("../constants");

/*******************************************************************************
* Class that wraps the camera object
* @param {BSON} bson - Database BSON object
*******************************************************************************/
var RepoNodeCamera = function(bson) {
    "use strict";

    RepoNode.call(this, bson);

    this[C.REPO_NODE_LABEL_TYPE]   = C.REPO_NODE_TYPE_CAMERA;
 
    if (bson[C.REPO_NODE_LABEL_LOOK_AT]){
        this[C.REPO_NODE_LABEL_LOOK_AT] = new RepoVector(bson[C.REPO_NODE_LABEL_LOOK_AT]);
    }

    if (bson[C.REPO_NODE_LABEL_POSITION]){
        this[C.REPO_NODE_LABEL_POSITION] = new RepoVector(bson[C.REPO_NODE_LABEL_POSITION]);
    }

    if (bson[C.REPO_NODE_LABEL_UP]) {
        this[C.REPO_NODE_LABEL_UP] = new RepoVector(bson[C.REPO_NODE_LABEL_UP]);
    }
};

module.exports = RepoNodeCamera;