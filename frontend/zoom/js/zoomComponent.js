/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the zoom of the GNU Affero General Public License as
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

(function () {
	"use strict";

	angular.module("3drepo")
		.component(
			"zoom",
			{
				templateUrl: "zoom.html",
				controller: ZoomCtrl,
				bindings: {
					text: "@"
				}
			}
		);


	ZoomCtrl.$inject = ["$q", "EventService"];

	function ZoomCtrl ($q, EventService) {
		var viewpointPromise = $q.defer(),
			initViewpoint;

		/*
		 * Init
		 */
		this.zoom = 0;
		this.minZoom = -50;
		this.maxZoom = 50;

		EventService.send(EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT, {promise: viewpointPromise});
		viewpointPromise.promise.then(function (viewpoint) {
			console.log("viewpointPromise", viewpoint);
			initViewpoint = viewpoint;
		});

		this.zoomChange = function () {
			console.log(this.zoom);
			EventService.send(EventService.EVENT.VIEWER.SET_CAMERA, {
				position : [
					initViewpoint.position[0],
					initViewpoint.position[1],
					initViewpoint.position[2] + this.zoom
				],
				view_dir : initViewpoint.view_dir,
				up: initViewpoint.up
			});
		};
	}
}());
