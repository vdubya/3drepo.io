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

var Queue = require('../services/queue');

function insertEventQueue(event, emitter, teamspace, model, extraKeys, data){
	'use strict';

	let msg = {
		event,
		emitter,
		teamspace,
		model,
		extraKeys,
		data

	};

	return Queue.insertEventMessage(msg);
}

function newIssues(emitter, teamspace, model, data){
	'use strict';
	return insertEventQueue('newIssues', emitter, teamspace, model, null, data);
}

function newComment(emitter, teamspace, model, issueId, data){
	'use strict';
	return insertEventQueue('newComment', emitter, teamspace, model, [issueId], data);
}

function commentChanged(emitter, teamspace, model, issueId, data){
	'use strict';
	return insertEventQueue('commentChanged', emitter, teamspace, model, [issueId], data);
}

function commentDeleted(emitter, teamspace, model, issueId, data){
	'use strict';
	return insertEventQueue('commentDeleted', emitter, teamspace, model, [issueId], data);
}


function modelStatusChanged(emitter, teamspace, model, data){
	'use strict';
	return insertEventQueue('modelStatusChanged', emitter, teamspace, model, null, data);
}

function issueChanged(emitter, teamspace, model, issueId, data){
	'use strict';

	//send event to single issue changed listener and any issues changed listener
	return Promise.all([
		insertEventQueue('issueChanged', emitter, teamspace, model, [issueId], data),
		insertEventQueue('issueChanged', emitter, teamspace, model, null, data)
	]);
}

function newModel(emitter, teamspace, data){
	'use strict';
	return insertEventQueue('newModel', emitter, teamspace, null, null, data);
}

module.exports = {
	newIssues,
	newComment,
	commentChanged,
	commentDeleted,
	modelStatusChanged,
	issueChanged,
	newModel
};
