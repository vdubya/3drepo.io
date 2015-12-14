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

	var utils = require("./utils.js");

	function define(name, value) {
		Object.defineProperty(module.exports, name, {
			value: value,
			writable: false,
			enumerable: true,
			configurable: true
		});
	}


	//-----------------------------------------------------------------------------
	// Server constants
	define("DEFAULT_HTTP_PORT", 80);
	define("DEFAULT_HTTPS_PORT", 443);
	define("DEFAULT_MONGO_PORT", 27017);
	define("DEFAULT_DB_USERNAME", "username");
	define("DEFAULT_DB_PASSWORD", "password");
	define("LOCALHOST_IP", "127.0.0.1");

	//-----------------------------------------------------------------------------
	// Special database constants
	define("STRICT_MODE", true);
	define("NON_STRICT_MODE", false);
	define("MASTER_BRANCH_NAME", "master");
	define("HEAD_REVISION_NAME", "head");
	define("MASTER_BRANCH", "00000000-0000-0000-0000-000000000000");
	define("MASTER_UUID", utils.stringToUUID(module.exports.MASTER_BRANCH));

	//-----------------------------------------------------------------------------
	// Main collections (tables) in 3D Repo
	define("REPO_DATABASE_ADMIN", "admin");
	define("REPO_COLLECTION_SCENE", "scene");
	define("REPO_COLLECTION_HISTORY", "history");
	define("REPO_COLLECTION_ISSUES", "issues");
	define("REPO_COLLECTION_WAYFINDER", "wayfinder");
	define("REPO_COLLECTION_USERS", "system.users");
	define("REPO_COLLECTION_SETTINGS", "settings");
	define("REPO_COLLECTION_REPO_STASH", "stash.3drepo");
	define("REPO_COLLECTION_SRC_STASH", "stash.src");
	define("REPO_COLLECTION_JSON_STASH", "stash.json");
	define("REPO_COLLECTION_X3D_STASH", "stash.x3d");

	//-----------------------------------------------------------------------------
	// Special boolean flags
	define("GET_PUBLIC", true);
	define("GET_NON_PUBLIC", false);

	//-----------------------------------------------------------------------------
	// Database command strings
	define("DB_COMMAND_UPDATE_USER", "updateUser");

	//-----------------------------------------------------------------------------
	// User data
	define("REPO_USER_USER", "user");
	define("REPO_USER_DATABASE", "db");
	define("REPO_USER_DATA", "customData");
	define("REPO_USER_PROJECTS", "projects");
	define("REPO_USER_FIRST_NAME", "firstName");
	define("REPO_USER_LAST_NAME", "lastName");
	define("REPO_USER_EMAIL", "email");
	define("REPO_USER_AVATAR", "avatar");
	define("REPO_USER_PASSWORD", "pwd");

	define("REPO_USER_TYPE", "type");
	define("REPO_TYPE_GROUP", "group");
	define("REPO_TYPE_USER", "user");

	//-----------------------------------------------------------------------------
	// Project settings data
	define("REPO_SETTINGS_OWNER", "owner");
	define("REPO_SETTINGS_DESCRIPTION", "desc");
	define("REPO_SETTINGS_TYPE", "type");
	define("REPO_SETTINGS_PERMISSIONS", "permissions");
	define("REPO_SETTINGS_PROPERTIES", "properties");
	define("REPO_SETTINGS_GROUPS", "groups");
	define("REPO_SETTINGS_USERS", "users");
	define("REPO_SETTINGS_USERS_USER", "user");

	//-----------------------------------------------------------------------------
	// Node types
	define("REPO_NODE_LABEL_UNKNOWN", "unknown");
	define("REPO_NODE_TYPE_TRANSFORMATION", "transformation");
	define("REPO_NODE_TYPE_MESH", "mesh");
	define("REPO_NODE_TYPE_MATERIAL", "material");
	define("REPO_NODE_TYPE_TEXTURE", "texture");
	define("REPO_NODE_TYPE_CAMERA", "camera");
	define("REPO_NODE_TYPE_REVISION", "revision");
	define("REPO_NODE_TYPE_REF", "ref");
	define("REPO_NODE_TYPE_META", "meta");
	define("REPO_NODE_TYPE_MAP", "map");

	//-----------------------------------------------------------------------------
	// Shared fields
	define("REPO_NODE_LABEL_ID", "_id"); // TODO: remove all references to replace with UNIQUE_ID instead
	define("REPO_NODE_LABEL_UNIQUE_ID", "_id");
	define("REPO_NODE_LABEL_SHARED_ID", "shared_id");
	define("REPO_NODE_LABEL_REV_ID", "rev_id");
	define("REPO_NODE_LABEL_API", "api");
	define("REPO_NODE_LABEL_PATH", "paths"); // TODO: remove but make sure all references are fixed!
	define("REPO_NODE_LABEL_PATHS", "paths"); // fixed typo
	define("REPO_NODE_LABEL_TYPE", "type");
	define("REPO_NODE_LABEL_PARENTS", "parents");
	define("REPO_NODE_LABEL_NAME", "name");

	//-----------------------------------------------------------------------------
	// Transformation fields
	define("REPO_NODE_LABEL_MATRIX", "matrix");

	//-----------------------------------------------------------------------------
	// Wayfinder fields
	define("REPO_NODE_LABEL_USER", "user");
	define("REPO_NODE_LABEL_SESSION", "session");
	define("REPO_NODE_LABEL_DIRECTION", "dir");
	define("REPO_NODE_LABEL_RECORDS", "records");

	//-----------------------------------------------------------------------------
	// Mesh fields
	define("REPO_NODE_LABEL_VERTICES", "vertices");
	define("REPO_NODE_LABEL_VERTICES_COUNT", "vertices_count");
	define("REPO_NODE_LABEL_VERTICES_BYTE_COUNT", "vertices_byte_count");
	define("REPO_NODE_LABEL_NORMALS", "normals");
	define("REPO_NODE_LABEL_FACES", "faces");
	define("REPO_NODE_LABEL_FACES_COUNT", "faces_count");
	define("REPO_NODE_LABEL_FACES_BYTE_COUNT", "faces_byte_count");
	define("REPO_NODE_LABEL_UV_CHANNELS", "uv_channels");
	define("REPO_NODE_LABEL_UV_CHANNELS_COUNT", "uv_channels_count");
	define("REPO_NODE_LABEL_BOUNDING_BOX", "bounding_box");

	define("REPO_BOUNDING_BOX_MIN", 0);
	define("REPO_BOUNDING_BOX_MAX", 1);

	//-----------------------------------------------------------------------------
	// Texture fields
	define("REPO_NODE_LABEL_EXTENSION", "extension");

	//-----------------------------------------------------------------------------
	// Reference fields
	define("REPO_NODE_LABEL_OWNER", "owner");
	define("REPO_NODE_LABEL_PROJECT", "project");
	define("REPO_NODE_LABEL_RID", "_rid");
	define("REPO_NODE_LABEL_UNIQUE", "unique");

	//-----------------------------------------------------------------------------
	// Camera fields
	define("REPO_NODE_LABEL_LOOK_AT", "look_at");
	define("REPO_NODE_LABEL_POSITION", "position");
	define("REPO_NODE_LABEL_UP", "up");
	define("REPO_NODE_LABEL_FOV", "fov");
	define("REPO_NODE_LABEL_NEAR", "near");
	define("REPO_NODE_LABEL_FAR", "far");
	define("REPO_NODE_LABEL_ASPECT_RATIO", "aspect_ratio");

	//-----------------------------------------------------------------------------
	// Issue fields
	define("REPO_NODE_LABEL_ISSUE_DEADLINE", "deadline");
	define("REPO_NODE_LABEL_ISSUE_CREATED", "created");
	define("REPO_NODE_LABEL_ISSUE_OWNER", "owner");
	define("REPO_NODE_LABEL_ISSUE_NAME", "name");
	define("REPO_NODE_LABEL_ISSUE_NUMBER", "number");
	define("REPO_NODE_LABEL_ISSUE_POSITION", "position");
	define("REPO_NODE_LABEL_ISSUE_PARENT", "parent");
	define("REPO_NODE_LABEL_ISSUE_COMMENTS", "comments");
	define("REPO_NODE_LABEL_ISSUE_COMMENT", "comment");
	define("REPO_NODE_LABEL_ISSUE_COMPLETE", "complete");


	//-----------------------------------------------------------------------------
	// Material fields
	define("REPO_NODE_LABEL_AMBIENT", "ambient");
	define("REPO_NODE_LABEL_DIFFUSE", "diffuse");
	define("REPO_NODE_LABEL_SPECULAR", "specular");
	define("REPO_NODE_LABEL_EMISSIVE", "emissive");
	define("REPO_NODE_LABEL_OPACITY", "opacity");
	define("REPO_NODE_LABEL_SHININESS", "shininess");
	define("REPO_NODE_LABEL_SHININESS_STRENGTH", "shininess_strength");
	define("REPO_NODE_LABEL_WIREFRAME", "wireframe");
	define("REPO_NODE_LABEL_TWO_SIDED", "two_sided");

	//-----------------------------------------------------------------------------
	// Metadata fields
	define("REPO_NODE_LABEL_METADATA", "metadata");
	define("REPO_NODE_LABEL_METADATA_TYPE", "type");
	define("REPO_NODE_LABEL_METADATA_SUBTYPE", "subtype");

	define("REPO_NODE_SUBTYPE_README", "readme");

	//-----------------------------------------------------------------------------
	// Revision fields
	define("REPO_NODE_LABEL_AUTHOR", "author");
	define("REPO_NODE_LABEL_BRANCH", "branch");
	define("REPO_NODE_LABEL_CURRENT", "current");
	define("REPO_NODE_LABEL_CURRENT_UNIQUE_IDS", "current");
	define("REPO_NODE_LABEL_MESSAGE", "message");
	define("REPO_NODE_LABEL_TIMESTAMP", "timestamp");
	define("REPO_NODE_LABEL_ADDED_SHARED_IDS", "added");
	define("REPO_NODE_LABEL_DELETED_SHARED_IDS", "deleted");
	define("REPO_NODE_LABEL_MODIFIED_SHARED_IDS", "modified");
	define("REPO_NODE_LABEL_UNMODIFIED_SHARED_IDS", "unmodified");

	//-----------------------------------------------------------------------------
	// Merge map
	define("REPO_NODE_LABEL_MERGED_NODES", "merged_nodes");
	define("REPO_NODE_LABEL_VERTEX_MAP", "v_map");
	define("REPO_NODE_LABEL_TRIANGLE_MAP", "t_map");
	define("REPO_NODE_LABEL_MERGE_MAP_MESH_ID", "map_id");
	define("REPO_NODE_LABEL_MERGE_MAP_MATERIAL_ID", "mat_id");
	define("REPO_NODE_LABEL_MERGE_MAP_FROM", "from");
	define("REPO_NODE_LABEL_MERGE_MAP_TO", "to");
	define("REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM", "v_from");
	define("REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO", "v_to");
	define("REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM", "t_from");
	define("REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO", "t_to");
	define("REPO_NODE_LABEL_COMBINED_MAP", "m_map");
	define("REPO_NODE_LABEL_MERGE_MAP_OFFSET", "offset");

	//-----------------------------------------------------------------------------
	// X3DOM defines
	define("X3DOM_SRC_BYTE", 5120);
	define("X3DOM_SRC_UBYTE", 5121);
	define("X3DOM_SRC_SHORT", 5122);
	define("X3DOM_SRC_USHORT", 5123);
	define("X3DOM_SRC_INT", 5124);
	define("X3DOM_SRC_UINT", 5125);
	define("X3DOM_SRC_FLOAT", 5126);
	define("X3DOM_SRC_TRIANGLE", 4);

	//-----------------------------------------------------------------------------
	// Following fields are not stored in the repository,
	// they are only implied!
	// TODO: refactor name such as UNUSED_LABEL to distinguishe from DB fields!
	define("REPO_NODE_LABEL_CHILDREN", "children");
	define("REPO_NODE_LABEL_CAMERAS", "cameras");
	define("REPO_SCENE_LABEL_MATERIALS_COUNT", "materials_count");
	define("REPO_SCENE_LABEL_MESHES_COUNT", "meshes_count");
	define("REPO_SCENE_LABEL_TEXTURES_COUNT", "textures_count");
	define("REPO_SCENE_LABEL_CAMERAS_COUNT", "cameras_count");
	define("REPO_HISTORY_LABEL_REVISIONS_COUNT", "revisions_count");
	define("REPO_SCENE_LABEL_REF_COUNT", "ref_count");
	define("REPO_SCENE_LABEL_METAS_COUNT", "meta_count");
	define("REPO_SCENE_LABEL_MAPS_COUNT", "map_count");

	//-----------------------------------------------------------------------------
	//
	// SRC format output
	//
	//-----------------------------------------------------------------------------
	define("SRC_IDX_LIST", "idx_list");
	define("SRC_VERTEX_LIMIT", 65535);

	//-----------------------------------------------------------------------------
	//
	// API server constants
	//
	//-----------------------------------------------------------------------------

	define("REPO_REST_API_ACCOUNT", "account");
	define("REPO_REST_API_PROJECT", "project");
	define("REPO_REST_API_BRANCH", "branch");
	define("REPO_REST_API_ID", "id");
	define("REPO_REST_API_SID", "sid");
	define("REPO_REST_API_FORMAT", "format");

	define("REPO_SESSION_USER", "user");

	define("REQ_REPO", "repo");


	//-----------------------------------------------------------------------------
	//
	// MongoDB error codes
	//
	//-----------------------------------------------------------------------------
	define("MONGO_AUTH_FAILED", 18);

	//-----------------------------------------------------------------------------
	//
	// Logging levels
	//
	//-----------------------------------------------------------------------------
	define("LOG_TRACE", "trace");
	define("LOG_DEBUG", "debug");
	define("LOG_INFO", "info");
	define("LOG_WARN", "warn");
	define("LOG_ERROR", "error");
	define("LOG_SYSTEM", "system");

	Object.freeze(module.exports);

})();