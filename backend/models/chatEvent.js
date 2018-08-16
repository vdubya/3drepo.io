/**
 *	Copyright (C) 2016 3D Repo Ltd
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

"use strict";
const Queue = require("../services/queue");

function insertEventQueue(event, emitter, account, model, extraKeys, data) {

	const msg = {
		event,
		emitter,
		account,
		model,
		extraKeys,
		data

	};

	return Queue.insertEventMessage(msg);
}

function newIssues(emitter, account, model, data) {
	return insertEventQueue("issueCreated", emitter, account, model, null, data);
}

function newComment(emitter, account, model, issueId, data) {
	return insertEventQueue("commentCreated", emitter, account, model, [issueId], data);
}

function commentChanged(emitter, account, model, issueId, data) {
	return insertEventQueue("commentUpdated", emitter, account, model, [issueId], data);
}

function commentDeleted(emitter, account, model, issueId, data) {
	return insertEventQueue("commentDeleted", emitter, account, model, [issueId], data);
}

function modelStatusChanged(emitter, account, model, data) {
	return insertEventQueue("modelStatusChanged", emitter, account, model, null, data);
}

function issueChanged(emitter, account, model, issueId, data) {
	return insertEventQueue("issueUpdated", emitter, account, model, null, data);
}

function newModel(emitter, account, data) {
	return insertEventQueue("modelCreated", emitter, account, null, null, data);
}

function newGroups(emitter, account, model, data) {
	return insertEventQueue("groupCreated", emitter, account, model, null, data);
}

function groupsDeleted(emitter, account, model, ids) {
	return insertEventQueue("groupDeleted", emitter, account, model, null, ids);
}

function groupChanged(emitter, account, model, data) {
	return insertEventQueue("groupUpdated", emitter, account, model, null, data);
}

module.exports = {
	newIssues,
	newComment,
	newGroups,
	commentChanged,
	commentDeleted,
	groupChanged,
	groupsDeleted,
	modelStatusChanged,
	issueChanged,
	newModel
};
