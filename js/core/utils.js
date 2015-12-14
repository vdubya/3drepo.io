/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(() => {
	"use strict";

	const nodeuuid = require("node-uuid");
	const mongo    = require("mongodb");

	const Utils = function() {};

	/*******************************************************************************
	* Convert a string to a UUID
	* @param {string} uuid - String representation of a UUID
	* @returns {Buffer} binuuid - Binary representation of a UUID
	*******************************************************************************/
	Utils.prototype.stringToUUID = function(uuid) {
		const bytes = nodeuuid.parse(uuid);
		let buf		= new Buffer(bytes);

		return mongo.Binary(buf, 3);
	};

	/*******************************************************************************
	* Convert a binary representation of an UUID to a string
	* @param {Buffer} binuuid - Binary representation of a UUID
	* @returns {string} uuid - String representation of a UUID
	*******************************************************************************/
	Utils.prototype.uuidToString = function(binuuid) {
		return nodeuuid.unparse(binuuid.buffer);
	};

	/*******************************************************************************
	* Convert a set of strings to binary representation
	* @param {Array} uuids - String representation of a UUID
	* @returns {Buffer} binuuids - Binary representation of a UUID
	*******************************************************************************/
	Utils.prototype.stringsToUUIDs = function(uuids) {
		const self = this;

		return uuids.map(function(uuid) {
			return self.stringToUUID(uuid);
		});
	};

	/*******************************************************************************
	* Convert a binary representation of an UUID to a string
	* @param {Buffer} binuuid - Binary representation of a UUID
	* @returns {string} uuid - String representation of a UUID
	*******************************************************************************/
	Utils.prototype.uuidsToStrings = function(binuuids) {
		const self = this;

		return binuuids.map(function(binuuid) {
			return self.uuidToString(binuuid);
		});
	};

	/*******************************************************************************
	* Generate a random UUID
	* @returns {Buffer} - Binary representation of a UUID
	*******************************************************************************/
	Utils.prototype.generateUUID = function() {
		return this.stringToUUID(nodeuuid.v4());
	};

	/*******************************************************************************
	  * Coalesce function
	  * @param {Object} variable - variable to coalesce
	  * @param {Object} value - value to return if object is null or undefined
	  *******************************************************************************/
	Utils.prototype.coalesce = function(variable, value)
	{
		if (variable === null || variable === undefined) {
			return value;
		} else {
			return variable;
		}
	};

	/*******************************************************************************
	* Given an array of BSON objects and a Type return a map of JS Objects
	* @returns {Object} - Map of the objects
	*******************************************************************************/
	Utils.prototype.bulkDecode = function(Type, bsons)
	{
		const results = {};

		for (let i = 0; i < bsons.length; i++)
		{
			const obj = new Type(bsons[i]);
			results[obj.getID()] = obj;
		}

		return results;
	};

	/*******************************************************************************
	 * Expects a byte array where each offset bytes are integers.
	 * Faces are stored as [n_0, i_{0,0}, i_{0,2}... , n_1, i{1,0}, i{1,1}...]
	 *
	 * @param {Object} facesBinaryObject
	 * @param {Object} offset // 4 for 4 bytes in integer32
	 * @param {boolean} isLittleEndian
	 *******************************************************************************/
	Utils.prototype.toFaceArray = function(facesBinaryObject, offset, isLittleEndian) {
		const facesArray = [];

		// return variable, array of arrays of face indices
		const byteBuffer = this.toDataView(facesBinaryObject);

		// You do not know the number of faces up front as each can
		// have a different number of indices (ie triangle, polygon etc).
		let index = 0;
		while (index < facesBinaryObject.position) {
			// true for little Endianness
			const numberOfIndices = byteBuffer.getInt32(index, isLittleEndian);
			const lastFaceIndex = index + (numberOfIndices + 1) * offset;

			const face = [];

			for (index += offset; index < lastFaceIndex; index += offset) {
				face.push(byteBuffer.getInt32(index, isLittleEndian));
			}

			facesArray.push(face);
		}

		return facesArray;
	};

	/*******************************************************************************
	 * Transforms a byte object of aiVector3D (3 floats) into an array of vectors [x,y,z]
	 *
	 * @param {Object} binaryObject
	 * @param {boolean} isLittleEndian
	 * @return {Float32Array}
	 *******************************************************************************/
	Utils.prototype.toFloat32Array = function(binaryObject, isLittleEndian) {
		const result = new Float32Array(binaryObject.position / Float32Array.BYTES_PER_ELEMENT);
		// array of floats [x,y,z ...], return variable
		const byteBuffer = this.toDataView(binaryObject);

		let count = 0, floatValue = 0;
		for (let i = 0; i < binaryObject.position; i += Float32Array.BYTES_PER_ELEMENT) {
			floatValue = byteBuffer.getFloat32(i, isLittleEndian);
			result[count++] = floatValue;
		}

		return result;
	};


	/*******************************************************************************
	 * Returns an array of arrays of uv channels, where each channel
	 * has 2 floats per vertex (there is vertices count pairs)
	 *
	 * @param {Object} binaryObject
	 * @param {number} channelsCount Number of channels, 1 for now
	 * @param {boolean} isLittleEndian True or false
	 * @return {Array.<Float32Array>}
	 *******************************************************************************/
	Utils.prototype.toUVChannelsArray = function(binaryObject, channelsCount, isLittleEndian) {
		const uvChannelsArray = new Array(channelsCount);

		const byteBuffer = this.toDataView(binaryObject);
		const channelBytesCount = binaryObject.position / channelsCount;

		for (let i = 0; i < channelsCount; ++i) {
			const channel = new Float32Array(channelBytesCount / Float32Array.BYTES_PER_ELEMENT);
			const offset = i * channelBytesCount;

			let count = 0, floatValue;

			for (let j = 0; j < channelBytesCount; j += Float32Array.BYTES_PER_ELEMENT) {
				floatValue = byteBuffer.getFloat32(offset + j, isLittleEndian);
				channel[count++] = floatValue;
			}
			uvChannelsArray[i] = channel;
		}
		return uvChannelsArray;
	};

	/*******************************************************************************
	 * Returns a DataView out of a given BSON binary object (BinDataGeneral).
	 * See also: http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/
	 *
	 * @param {BinDataGeneral} binary object
	 *******************************************************************************/
	Utils.prototype.toDataView = function(binaryObject) {
		return new DataView(this.toArrayBuffer(binaryObject.buffer));
	};

	/*******************************************************************************
	 * Returns an ArrayBuffer from a binary buffer. This can
	 * be used to create a DataView from it.
	 * See: http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
	 *
	 * @param {Buffer} binary buffer
	 *******************************************************************************/
	Utils.prototype.toArrayBuffer = function(binaryBuffer) {

		const arrayBuffer = new ArrayBuffer(binaryBuffer.length);
		const view = new Uint8Array(arrayBuffer);

		for (let i = 0; i < binaryBuffer.length; ++i) {
			view[i] = binaryBuffer[i];
		}

		return arrayBuffer;
	};

	module.exports = new Utils();

})();
