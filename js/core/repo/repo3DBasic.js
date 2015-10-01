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

var _      = require("underscore");
var C      = require("../constants");
var mathjs = require("mathjs");

/*******************************************************************************
 * Vector class
 *
 * @param {number} x - X component
 * @param {number} y - Y component
 * @param {number} z - Z component
 *******************************************************************************/
var RepoVector = function(x,y,z)
{
	"use strict";

	var self = this;
	var vector = mathjs.zeros(4);

	// If an array is passed in
	if (_.isArray(x))
	{
		vector = mathjs.matrix([x[0], x[1], x[2], 0]);
	} else {
		vector = mathjs.matrix([
			x ? x : 0,
			y ? y : 0,
			z ? z : 0,
			0]);
	}

	/*******************************************************************************
	* Get the internal vector
	* @returns {vector} - Vector
	*******************************************************************************/
	this.getVector = function() 
	{
		return vector;
	};

	/*******************************************************************************
	* Get the X component of the vector
	* @returns {number} - The X component
	*******************************************************************************/
	this.getX = function()
	{
		return vector[0];
	};

	/*******************************************************************************
	* Get the Y component of the vector
	* @returns {number} - The Y component
	*******************************************************************************/
	this.getY = function()
	{
		return vector[1];
	};

	/*******************************************************************************
	* Get the Z component of the vector
	* @returns {number} - The Z component
	*******************************************************************************/
	this.getZ = function()
	{
		return vector[2];
	};

	/*******************************************************************************
	* Get the W component of the vector
	* @returns {number} - The Z component
	*******************************************************************************/
	this.getW = function()
	{
		return vector[3];
	};

	/*******************************************************************************
	* Add another vector to this one and return
	* @returns {Vertex} sum - Summation of the two
	*******************************************************************************/
	this.add = function(other)	
	{
		return new RepoVector(
			other.getX() + self.getX(),
			other.getY() + self.getY(),
			other.getZ() + self.getZ()
		);
	};

	/*******************************************************************************
	* Take another vector from this one and return
	* @returns {Vertex} sum - Summation of the two
	*******************************************************************************/
	this.subtract = function(other)
	{
		return new RepoVector(
			self.getX() - other.getX(),
			self.getY() - other.getY(),
			self.getZ() - other.getZ()
		);
	};

	this.scale = function(scale) 
	{
		return new RepoVector(
			self.getX() * scale,
			self.getY() * scale,
			self.getZ() * scale
		);
	};

	/*******************************************************************************
	* Perform cross product with other vector
	* @returns {RepoVector} - Cross product vector
	*******************************************************************************/
	this.crossProduct = function(other){
		return new RepoVector(
			self.getY() * other.getZ() - self.getZ() * other.getY(),
			self.getZ() * other.getX() - self.getX() * other.getZ(),
			self.getX() * other.getY() - self.getY() * other.getX()
		);
	};

	/*******************************************************************************
	* Return a normalized vesrion of this vector
	* @returns {RepoVector} - Normalized vector
	*******************************************************************************/
	this.normalized = function() {
		var length = self.length();

		return new RepoVector(
			self.getX() / length,
			self.getY() / length,
			self.getZ() / length
		);
	};

	this.length = function() {
		return Math.sqrt(self.getX() * self.getX() +
			self.getY() * self.getY() + 
			self.getZ() * self.getZ());
	};

	/*******************************************************************************
	* Return JSON representation of the vector
	* @returns {JSON} - Returns JSON representation of this
	*******************************************************************************/
	this.toJSON = function()
	{
		return vector._data.slice(0,3);
	};

	/*******************************************************************************
	* Return string representation of vector
	* @returns {string} - Returns string representation of this
	*******************************************************************************/
	this.toString = function() 
	{
		return self.toJSON().join(",");
	};
};

/*******************************************************************************
 * Bounding box class
 *
 * @param {Array} bson - Array of min/max arrays
 *******************************************************************************/
var RepoBoundingBox = function(bson)
{
	"use strict";

	if (bson)
	{
		this.init(
			new RepoVector(bson[0]),
			new RepoVector(bson[1])
			);
	} else {
		this.init(
			new RepoVector(-1,-1,-1),
			new RepoVector(1,1,1)
		);
	}

	/*******************************************************************************
	* Custom construction function
	* min {RepoVector} - Minimum point on the bounding box
	* max {RepoVector} - Maximum point on the bounding box
	*******************************************************************************/
	this.init = function(min, max)
	{
		this.min    = min;
		this.max    = max;

		this.center = this.min.add(this.max).scale(0.5);
		this.size   = this.max.subtract(this.min);
	};

	/*******************************************************************************
	* Return JSON representation of the vector
	* @returns {JSON} - Returns JSON representation of this
	*******************************************************************************/
	this.toJSON = function()
	{
		var bson = [];

		bson[C.REPO_BOUNDING_BOX_MIN] = this.min.toJSON();
		bson[C.REPO_BOUNDING_BOX_MAX] = this.max.toJSON();

		return bson;
	};
};

/*******************************************************************************
 * Matrix class
 *
 * @param {Array} mat - Array of arrays for 4x4 matrix
 *******************************************************************************/
var RepoMatrix = function(matarray)
{
	"use strict";
	var mat = mathjs.matrix(matarray);

	/*******************************************************************************
	* Custom construction function from look at vectors
	* right {RepoVector}    - Right vector
	* forward {RepoVector}  - Forward vector
	* up {RepoVector}       - Up vector
	* position {repoVecotr} - Position vector
	*******************************************************************************/
	this.initLookAt = function(right, forward, up, position)
	{
		mat = mathjs.matrix([
			[right[0], right[1], right[2], 0], 
			[up[0], up[1], up[2], 0], 
			[forward[0], forward[1], forward[2], 0], 
			[position[0], position[1], position[2], 1]
		]);
	};

	/*******************************************************************************
	* Return clone of this matrix
	* @returns {RepoMatrix} 
	*******************************************************************************/
	this.clone = function()
	{
		return new RepoMatrix(mat.clone());
	};

	/*******************************************************************************
	* Get column from matrix
	* @param {number} column - Column to slice out
	* @returns {RepoVector} 
	*******************************************************************************/
	this.getColumn = function(column)
	{
		return new RepoVector(mathjs.subset(mat, mathjs.index(column,[0,3]))._data[0]);
	};

	/*******************************************************************************
	* Transform vector by matrix
	* @param {RepoVector} vector - Vector to transform
	*
	*******************************************************************************/
	this.transform = function(vector)
	{
		return new RepoVector(mat.multiply(vector.getVector())._data);
	};

	/*******************************************************************************
	* Return transposed matrix
	* position {
	*******************************************************************************/
	this.transpose = function()
	{
		return new RepoMatrix(mat.transpose());
	};

	/*******************************************************************************
	* Return JSON representation of the vector
	* @returns {JSON} - Returns JSON representation of this
	*******************************************************************************/
	this.toJSON = function()
	{
		return mat._data;
	};
};

/*******************************************************************************
 * Quaternion class
 *
 * @param {number} x - X component
 * @param {number} y - Y component
 * @param {number} z - Z component
 * @param {number} w - W component
 *******************************************************************************/
var RepoQuaternion = function(x,y,z,w)
{
	"use strict";
	var self = this;

	this.initLookAt = function(up, forward)
	{
		forward = forward.normalize();
		up = up.normalize();

		var right = forward.crossProduct(up);
		up = right.crossProduct(forward);

		w = Math.sqrt(1 + right.getX() + up.getY() + forward.getZ()) * 0.5;
		var recip = 1 / (4 * w);

		x = (forward.getY() - up.getZ()) * recip;
		y = (right.getZ() - forward.getY()) * recip;
		z = (up.getX() - right.getY()) * recip;
	};

	/*******************************************************************************
	* Return JSON representation of the vector
	* @returns {JSON} - Returns JSON representation of this
	*******************************************************************************/
	this.toJSON = function()
	{
		return [x,y,w,z];
	};

	/*******************************************************************************
	* Return string representation of vector
	* @returns {string} - Returns string representation of this
	*******************************************************************************/
	this.toString = function() 
	{
		return self.toJSON().join(",");
	};
};

/*******************************************************************************
 * Axis angle class
 *
 * @param {number} x - X component
 * @param {number} y - Y component
 * @param {number} z - Z component
 * @param {number} a - A component
 *******************************************************************************/
var RepoAxisAngle = function(x,y,z,a)
{
	"use strict";
	var self = this;

	/*******************************************************************************
	* Custom construction function
	* @param {RepoMatrix} mat - Input matrix
	*******************************************************************************/
	this.initMatrix = function(mat) {

		var tmpMat = mat.clone();
		tmpMat = tmpMat.transpose();

		var right   = mat.getColumn(0).normalize();
		var up      = mat.getColumn(1).normalize();
		var forward = mat.getColumn(2).normalize();

		var eps = 0.0001;

		var o = up.getX() - right.getY();
		var b = forward.getX() - right.getZ();
		var c = forward.getY() - up.getZ();
		var tr = right.getX() + up.getY() + forward.getZ();

		if ((Math.abs(o) < eps) && (Math.abs(b) < eps) && (Math.abs(c) < eps))
		{
			var d = up.getX() + right.getY();
			var e = forward.getX() + right.getZ();
			var f = forward.getY() + up.getZ();

			if (!((Math.abs(d) < eps) && (Math.abs(e) < eps) && (Math.abs(f) < eps) && (Math.abs(tr - 3) < eps)))
			{
				a = Math.PI;

				var xx = (right[0] + 1) / 2;
				var yy = (up[1] + 1) / 2;
				var zz = (forward[2] + 1) / 2;

				var xy = d / 4;
				var xz = e / 4;
				var yz = f / 4;

				if (((xx - yy) > eps) && ((xx - zz) > eps)) {
					if (xx < eps) {
						x = 0; y = Math.SQRT1_2; z = Math.SQRT1_2;
					} else {
						x = Math.sqrt(xx); y = xy/x; z = xz / x;
					}
				} else if ((yy - zz) > eps) {
					if (yy < eps) {
						x = Math.SQRT1_2; y = 0; z = Math.SQRT1_2;
					} else {
						y = Math.sqrt(yy); x = xy / y; z = yz / y;
					}
				} else {
					if (zz < eps) {
						x = Math.SQRT1_2; y = Math.SQRT1_2; z = 0;
					} else {
						z = Math.sqrt(zz); x = xz / z; y = yz / z;
					}
				}
			}
		} else {
			var s = Math.sqrt(o * o + b * b + c * c);

			if (s < eps) {
				s = 1;
			}

			x = -c / s;
			y = b / s;
			z = -o / s;

			a = Math.acos((tr - 1) / 2);
		}
	};

	/*******************************************************************************
	* Return JSON representation of the vector
	* @returns {JSON} - Returns JSON representation of this
	*******************************************************************************/
	this.toJSON = function()
	{
		return [x,y,z,a];
	};

	/*******************************************************************************
	* Return string representation of vector
	* @returns {string} - Returns string representation of this
	*******************************************************************************/
	this.toString = function() 
	{
		return self.toJSON().join(",");
	};
};

module.exports.RepoVector      = RepoVector;
module.exports.RepoBoundingBox = RepoBoundingBox;
module.exports.RepoMatrix      = RepoMatrix;
module.exports.RepoAxisAngle   = RepoAxisAngle;
module.exports.RepoQuaternion  = RepoQuaternion;
