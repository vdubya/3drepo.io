var assert = require("assert");

var _ = require("underscore");

var C = require("../js/core/constants.js");
var utils = require("../js/core/utils.js");

// Test all the Repo Javascript Objects
describe("RepoObjects", function() {
	"use strict";

	var RepoNode               = require("../js/core/repo/repoNode.js");
	var RepoNodeTransformation = require("../js/core/repo/repoNodeTransformation.js");
	var RepoNodeCamera         = require("../js/core/repo/repoNodeCamera.js");
	var RepoNodeMeta           = require("../js/core/repo/repoNodeMeta.js");
	var RepoNodeMaterial       = require("../js/core/repo/repoNodeMaterial.js");

	// Create a dummy node object
	var baseBSON = {};
	baseBSON[C.REPO_NODE_LABEL_ID]        = utils.generateUUID();
	baseBSON[C.REPO_NODE_LABEL_SHARED_ID] = utils.generateUUID();
	baseBSON[C.REPO_NODE_LABEL_NAME]      = "Test Name";
	baseBSON[C.REPO_NODE_LABEL_API]       = 1;
	baseBSON[C.REPO_NODE_LABEL_TYPE]      = C.REPO_NODE_TYPE_UNKNOWN;
	baseBSON[C.REPO_NODE_LABEL_PARENTS]   = [];
	baseBSON[C.REPO_NODE_LABEL_PATHS]     = [];

	describe("RepoNode", function() {
		it("Test RepoNode import/export", function(done) {
			var testNode = new RepoNode(baseBSON);

			assert.equal(JSON.stringify(testNode), JSON.stringify(baseBSON));
			done();	
		});
	});

	describe("RepoNodeTransformation", function () {
		it("Test RepoNodeTransformation import/export", function(done) {
			var bson = _.clone(baseBSON);
			bson[C.REPO_NODE_LABEL_TYPE]   = C.REPO_NODE_TYPE_TRANSFORMATION;
			bson[C.REPO_NODE_LABEL_MATRIX] = [[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]];

			var testNode = new RepoNodeTransformation(bson);
			assert.equal(JSON.stringify(testNode), JSON.stringify(bson));

			done();	
		});
	});

	describe("RepoNodeCamera", function () {
		it("Test RepoNodeCamera import/export", function(done) {
			var bson = _.clone(baseBSON);
			bson[C.REPO_NODE_LABEL_TYPE]         = C.REPO_NODE_TYPE_CAMERA;
			bson[C.REPO_NODE_LABEL_LOOK_AT]      = [0,0,0];
			bson[C.REPO_NODE_LABEL_POSITION]     = [0,0,10];
			bson[C.REPO_NODE_LABEL_UP]           = [0,1,0];
			bson[C.REPO_NODE_LABEL_FOV]          = 45.0;
			bson[C.REPO_NODE_LABEL_NEAR]         = 0.01;
			bson[C.REPO_NODE_LABEL_FAR]          = 1000.0;
			bson[C.REPO_NODE_LABEL_ASPECT_RATIO] = 1.0;

			var testNode = new RepoNodeCamera(bson);

			assert.equal(JSON.stringify(testNode), JSON.stringify(bson));
			done();	
		});
	});

	describe("RepoNodeMaterial", function () {
		it("Test RepoNodeMaterial import/export", function(done) {
			var bson = _.clone(baseBSON);
			bson[C.REPO_NODE_LABEL_TYPE]     = C.REPO_NODE_TYPE_MATERIAL;
			bson[C.REPO_NODE_LABEL_DIFFUSE]  = [0.5,0.5,0.5];
			bson[C.REPO_NODE_LABEL_AMBIENT]  = [0.5,0.5,0.5];
			bson[C.REPO_NODE_LABEL_SPECULAR] = [0.5,0.5,0.5];
			bson[C.REPO_NODE_LABEL_EMISSIVE] = [0.5,0.5,0.5];

			var testNode = new RepoNodeMaterial(bson);

			assert.equal(JSON.stringify(testNode), JSON.stringify(bson));
			done();	
		});
	});

	describe("RepoNodeMeta", function () {
		it("Test RepoNodeMeta import/export", function(done) {

			var bson = _.clone(baseBSON);
			bson[C.REPO_NODE_LABEL_TYPE]     = C.REPO_NODE_TYPE_META;
			bson[C.REPO_NODE_LABEL_METADATA] = {
				"test" : "data"
			};

			var testNode = new RepoNodeMeta(bson);

			assert.equal(JSON.stringify(testNode), JSON.stringify(bson));
			done();	
		});
	});
});
