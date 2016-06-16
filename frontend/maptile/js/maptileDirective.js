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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("maptile", maptile);

	function maptile() {
		return {
			restrict: "EA",
			templateUrl: "maptile.html",
			scope: {
				show: "=",
				visible: "=",
				onContentHeightRequest: "&"
			},
			controller: MaptileCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	MaptileCtrl.$inject = ["$scope", "$timeout", "EventService", "$http"];

	function MaptileCtrl($scope, $timeout, EventService, $http) {
		var vm = this;
		vm.meta = {};
		/*
		 * Init
		 */
		 vm.maptilesource = 'os';
		/*
		 * Watch for show/hide of card
		 */
		$scope.$watch("vm.show", function (newValue) {

		});

		/*
		 * Toggle the clipping plane
		 */
		$scope.$watch("vm.visible", function (newValue) {

		});

		/**
		 * Toggle the closed status of an issue
		 */
		vm.changeMapTile = function() {
			EventService.send(EventService.EVENT.VIEWER.CHANGE_MAP_TILE_SOURCE, vm.maptilesource);
		};
	}
}());
