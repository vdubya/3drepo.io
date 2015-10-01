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
var utils = require("./utils.js");

function setEnum(name, value) {
	"use strict";
	
    Object.defineProperty(module.exports, name, {
        value:      value,
        enumerable: true
    });
}

//-----------------------------------------------------------------------------
//
// New API
//
//-----------------------------------------------------------------------------

// Main collections (tables) in 3D Repo
setEnum("REPO_DATABASE_ADMIN", "admin");
setEnum("REPO_COLLECTION_SCENE", "scene");
setEnum("REPO_COLLECTION_HISTORY", "history");
setEnum("REPO_COLLECTION_ISSUES", "issues");
setEnum("REPO_COLLECTION_WAYFINDER", "wayfinder");
setEnum("REPO_COLLECTION_USERS", "system.users");
setEnum("REPO_COLLECTION_SETTINGS", "settings");
setEnum("REPO_COLLECTION_REPO_STASH", "stash.3drepo");

//-----------------------------------------------------------------------------
// Special database constants
setEnum("STRICT_MODE", true);
setEnum("NON_STRICT_MODE", false);
setEnum("MASTER_BRANCH_NAME", "master");
setEnum("HEAD_REVISION_NAME", "head");
setEnum("MASTER_UUID", utils.stringToUUID("00000000-0000-0000-0000-000000000000"));

//-----------------------------------------------------------------------------
// Special boolean flags
setEnum("GET_PUBLIC", true);
setEnum("GET_NON_PUBLIC", true);

//-----------------------------------------------------------------------------
// Database command strings
setEnum("DB_COMMAND_UPDATE_USER", "updateUser");

//-----------------------------------------------------------------------------
// Permissions data
setEnum("REPO_PERM_OWNER", 0);
setEnum("REPO_PERM_GROUP", 1);
setEnum("REPO_PERM_PUBLIC", 2);

setEnum("REPO_READ_BIT", 4);
setEnum("REPO_WRITE_BIT", 2);
setEnum("REPO_EXECUTE_BIT", 1);

//-----------------------------------------------------------------------------
// User data
setEnum("REPO_USER_USER", "user");
setEnum("REPO_USER_DATABASE", "db");
setEnum("REPO_USER_DATA", "customData");
setEnum("REPO_USER_PROJECTS", "projects");
setEnum("REPO_USER_FIRST_NAME", "firstName");
setEnum("REPO_USER_LAST_NAME", "lastName");
setEnum("REPO_USER_EMAIL", "email");
setEnum("REPO_USER_AVATAR", "avatar");
setEnum("REPO_USER_PASSWORD", "pwd");

setEnum("REPO_USER_TYPE", "type");
setEnum("REPO_TYPE_GROUP", "group");
setEnum("REPO_TYPE_USER", "user");

//-----------------------------------------------------------------------------
// Project settings data
setEnum("REPO_SETTINGS_OWNER", "owner");
setEnum("REPO_SETTINGS_DESCRIPTION", "desc");
setEnum("REPO_SETTINGS_TYPE", "type");
setEnum("REPO_SETTINGS_PERMISSIONS", "permissions");
setEnum("REPO_SETTINGS_PROPERTIES", "properties");
setEnum("REPO_SETTINGS_GROUPS", "groups");
setEnum("REPO_SETTINGS_USERS", "users");
setEnum("REPO_SETTINGS_USERS_USER", "user");

//-----------------------------------------------------------------------------
// Node types
setEnum("REPO_NODE_TYPE_UNKNOWN", "unknown");
setEnum("REPO_NODE_TYPE_TRANSFORMATION", "transformation");
setEnum("REPO_NODE_TYPE_MESH", "mesh");
setEnum("REPO_NODE_TYPE_MATERIAL", "material");
setEnum("REPO_NODE_TYPE_TEXTURE", "texture");
setEnum("REPO_NODE_TYPE_CAMERA", "camera");
setEnum("REPO_NODE_TYPE_REVISION", "revision");
setEnum("REPO_NODE_TYPE_REF", "ref");
setEnum("REPO_NODE_TYPE_META", "meta");
setEnum("REPO_NODE_TYPE_MAP", "map");

//-----------------------------------------------------------------------------
// Shared fields
setEnum("REPO_NODE_LABEL_ID", "_id"); // TODO: remove all references to replace with UNIQUE_ID instead
setEnum("REPO_NODE_LABEL_UNIQUE_ID", "_id");
setEnum("REPO_NODE_LABEL_SHARED_ID", "shared_id");
setEnum("REPO_NODE_LABEL_REV_ID", "rev_id");
setEnum("REPO_NODE_LABEL_API", "api");
setEnum("REPO_NODE_LABEL_PATH", "paths"); // TODO: remove but make sure all references are fixed!
setEnum("REPO_NODE_LABEL_PATHS", "paths"); // fixed typo
setEnum("REPO_NODE_LABEL_TYPE", "type");
setEnum("REPO_NODE_LABEL_PARENTS", "parents");
setEnum("REPO_NODE_LABEL_NAME", "name");

//-----------------------------------------------------------------------------
// Transformation fields
setEnum("REPO_NODE_LABEL_MATRIX", "matrix");

//-----------------------------------------------------------------------------
// Wayfinder fields
setEnum("REPO_NODE_LABEL_USER", "user");
setEnum("REPO_NODE_LABEL_SESSION", "session");
setEnum("REPO_NODE_LABEL_DIRECTION", "dir");
setEnum("REPO_NODE_LABEL_RECORDS", "records");

//-----------------------------------------------------------------------------
// Mesh fields
setEnum("REPO_NODE_LABEL_VERTICES", "vertices");
setEnum("REPO_NODE_LABEL_VERTICES_COUNT", "vertices_count");
setEnum("REPO_NODE_LABEL_VERTICES_BYTE_COUNT", "vertices_byte_count");
setEnum("REPO_NODE_LABEL_NORMALS", "normals");
setEnum("REPO_NODE_LABEL_FACES", "faces");
setEnum("REPO_NODE_LABEL_FACES_COUNT", "faces_count");
setEnum("REPO_NODE_LABEL_FACES_BYTE_COUNT", "faces_byte_count");
setEnum("REPO_NODE_LABEL_UV_CHANNELS", "uv_channels");
setEnum("REPO_NODE_LABEL_UV_CHANNELS_COUNT", "uv_channels_count");
setEnum("REPO_NODE_LABEL_BOUNDING_BOX", "bounding_box");

setEnum("REPO_BOUNDING_BOX_MIN", 0);
setEnum("REPO_BOUNDING_BOX_MAX", 1);

//-----------------------------------------------------------------------------
// Texture fields
setEnum("REPO_NODE_LABEL_EXTENSION", "extension");

//-----------------------------------------------------------------------------
// Reference fields
setEnum("REPO_NODE_LABEL_OWNER", "owner");
setEnum("REPO_NODE_LABEL_PROJECT", "project");
setEnum("REPO_NODE_LABEL_RID", "_rid");
setEnum("REPO_NODE_LABEL_UNIQUE", "unique");

//-----------------------------------------------------------------------------
// Camera fields
setEnum("REPO_NODE_LABEL_LOOK_AT", "look_at");
setEnum("REPO_NODE_LABEL_POSITION", "position");
setEnum("REPO_NODE_LABEL_UP", "up");
setEnum("REPO_NODE_LABEL_FOV", "fov");
setEnum("REPO_NODE_LABEL_NEAR", "near");
setEnum("REPO_NODE_LABEL_FAR", "far");
setEnum("REPO_NODE_LABEL_ASPECT_RATIO", "aspect_ratio");

//-----------------------------------------------------------------------------
// Issue fields
setEnum("REPO_NODE_LABEL_ISSUE_DEADLINE", "deadline");
setEnum("REPO_NODE_LABEL_ISSUE_CREATED", "created");
setEnum("REPO_NODE_LABEL_ISSUE_OWNER", "owner");
setEnum("REPO_NODE_LABEL_ISSUE_NAME", "name");
setEnum("REPO_NODE_LABEL_ISSUE_NUMBER", "number");
setEnum("REPO_NODE_LABEL_ISSUE_POSITION", "position");
setEnum("REPO_NODE_LABEL_ISSUE_PARENT", "parent");
setEnum("REPO_NODE_LABEL_ISSUE_COMMENTS", "comments");
setEnum("REPO_NODE_LABEL_ISSUE_COMMENT", "comment");
setEnum("REPO_NODE_LABEL_ISSUE_COMPLETE", "complete");


//-----------------------------------------------------------------------------
// Material fields
setEnum("REPO_NODE_LABEL_AMBIENT", "ambient");
setEnum("REPO_NODE_LABEL_DIFFUSE", "diffuse");
setEnum("REPO_NODE_LABEL_SPECULAR", "specular");
setEnum("REPO_NODE_LABEL_EMISSIVE", "emissive");
setEnum("REPO_NODE_LABEL_OPACITY", "opacity");
setEnum("REPO_NODE_LABEL_SHININESS", "shininess");
setEnum("REPO_NODE_LABEL_SHININESS_STRENGTH", "shininess_strength");
setEnum("REPO_NODE_LABEL_WIREFRAME", "wireframe");
setEnum("REPO_NODE_LABEL_TWO_SIDED", "two_sided");

//-----------------------------------------------------------------------------
// Metadata fields
setEnum("REPO_NODE_LABEL_METADATA", "metadata");
setEnum("REPO_NODE_LABEL_METADATA_TYPE", "type");
setEnum("REPO_NODE_LABEL_METADATA_SUBTYPE", "subtype");

setEnum("REPO_NODE_SUBTYPE_README", "readme");

//-----------------------------------------------------------------------------
// Revision fields
setEnum("REPO_NODE_LABEL_AUTHOR", "author");
setEnum("REPO_NODE_LABEL_CURRENT", "current");
setEnum("REPO_NODE_LABEL_CURRENT_UNIQUE_IDS", "current");
setEnum("REPO_NODE_LABEL_MESSAGE", "message");
setEnum("REPO_NODE_LABEL_TIMESTAMP", "timestamp");
setEnum("REPO_NODE_LABEL_ADDED_SHARED_IDS", "added");
setEnum("REPO_NODE_LABEL_DELETED_SHARED_IDS", "deleted");
setEnum("REPO_NODE_LABEL_MODIFIED_SHARED_IDS", "modified");
setEnum("REPO_NODE_LABEL_UNMODIFIED_SHARED_IDS", "unmodified");

//-----------------------------------------------------------------------------
// Merge map
setEnum("REPO_NODE_LABEL_MERGED_NODES", "merged_nodes");
setEnum("REPO_NODE_LABEL_VERTEX_MAP", "v_map");
setEnum("REPO_NODE_LABEL_TRIANGLE_MAP", "t_map");
setEnum("REPO_NODE_LABEL_MERGE_MAP_MESH_ID", "map_id");
setEnum("REPO_NODE_LABEL_MERGE_MAP_MATERIAL_ID", "mat_id");
setEnum("REPO_NODE_LABEL_MERGE_MAP_FROM", "from");
setEnum("REPO_NODE_LABEL_MERGE_MAP_TO", "to");
setEnum("REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM", "v_from");
setEnum("REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO", "v_to");
setEnum("REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM", "t_from");
setEnum("REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO", "t_to");
setEnum("REPO_NODE_LABEL_COMBINED_MAP", "m_map");
setEnum("REPO_NODE_LABEL_MERGE_MAP_OFFSET", "offset");

//-----------------------------------------------------------------------------
// X3DOM defines
setEnum("X3DOM_SRC_BYTE", 5120);
setEnum("X3DOM_SRC_UBYTE", 5121);
setEnum("X3DOM_SRC_SHORT", 5122);
setEnum("X3DOM_SRC_USHORT", 5123);
setEnum("X3DOM_SRC_INT", 5124);
setEnum("X3DOM_SRC_UINT", 5125);
setEnum("X3DOM_SRC_FLOAT", 5126);
setEnum("X3DOM_SRC_TRIANGLE", 4);

//-----------------------------------------------------------------------------
// Following fields are not stored in the repository,
// they are only implied!
// TODO: refactor name such as UNUSED_LABEL to distinguishe from DB fields!
setEnum("REPO_NODE_LABEL_CHILDREN", "children");
setEnum("REPO_NODE_LABEL_CAMERAS", "cameras");
setEnum("REPO_SCENE_LABEL_MATERIALS_COUNT", "materials_count");
setEnum("REPO_SCENE_LABEL_MESHES_COUNT", "meshes_count");
setEnum("REPO_SCENE_LABEL_TEXTURES_COUNT", "textures_count");
setEnum("REPO_SCENE_LABEL_CAMERAS_COUNT", "cameras_count");
setEnum("REPO_HISTORY_LABEL_REVISIONS_COUNT", "revisions_count");
setEnum("REPO_SCENE_LABEL_REF_COUNT", "ref_count");
setEnum("REPO_SCENE_LABEL_METAS_COUNT", "meta_count");
setEnum("REPO_SCENE_LABEL_MAPS_COUNT", "map_count");
setEnum("REPO_SCENE_LABEL_ALL_NODES", "all");
