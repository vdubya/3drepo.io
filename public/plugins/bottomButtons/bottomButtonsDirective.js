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

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("bottomButtons", bottomButtons);

    function bottomButtons () {
        return {
            restrict: 'E',
            templateUrl: 'bottomButtons.html',
            scope: {},
            controller: BottomButtonsCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    BottomButtonsCtrl.$inject = ["$scope", "EventService", "ViewerService"];

    function BottomButtonsCtrl ($scope, EventService, ViewerService) {
        var vm = this,
            defaultViewer = ViewerService.defaultViewer;
        vm.showButtons = true;
        vm.fullScreen = false;
		vm.showViewingOptionButtons = false;

		vm.toggleElements = function () {
            EventService.send(EventService.EVENT.TOGGLE_ELEMENTS);
            vm.showButtons = !vm.showButtons;
        };

        var turntable = function () {
            defaultViewer.setNavMode("TURNTABLE");
        };

        var helicopter = function () {
            defaultViewer.setNavMode("HELICOPTER");
        };

        var walk = function () {
            defaultViewer.setNavMode("WALK");
        };

		var toggleViewingOptionButtons = function () {
			vm.showViewingOptionButtons = !vm.showViewingOptionButtons;
		};

        var home = function () {
            defaultViewer.showAll();
        };

        var toggleHelp = function () {
            EventService.send(EventService.EVENT.TOGGLE_HELP);
        };

        var enterFullScreen = function () {
            defaultViewer.switchFullScreen(null);
            vm.fullScreen = true;
        };

        var exitFullScreen = function() {
            if (!document.webkitIsFullScreen && !document.msFullscreenElement && !document.mozFullScreen && vm.fullScreen) {
                defaultViewer.switchFullScreen(null);
                vm.fullScreen = false;
            }
        };
        document.addEventListener('webkitfullscreenchange', exitFullScreen, false);
        document.addEventListener('mozfullscreenchange', exitFullScreen, false);
        document.addEventListener('fullscreenchange', exitFullScreen, false);
        document.addEventListener('MSFullscreenChange', exitFullScreen, false);

		var showQRCodeReader = function () {
			EventService.send(EventService.EVENT.SHOW_QR_CODE_READER);
		};

		var enterOculusDisplay = function () {
			ViewerService.switchVR();
		};

        vm.leftButtons = [];
		vm.leftButtons.push({label: "Home", icon: "fa-home", click: home});
        vm.leftButtons.push({label: "Turntable", icon: "fa-mouse-pointer", click: turntable});
        vm.leftButtons.push({label: "Helicopter", icon: "fa-arrows", click: helicopter});
        vm.leftButtons.push({label: "Walk", icon: "fa-child", click: toggleViewingOptionButtons});

        vm.rightButtons = [];
        vm.rightButtons.push({label: "Help", icon: "fa-question", click: toggleHelp});
        vm.rightButtons.push({label: "Full screen", icon: "fa-arrows-alt", click: enterFullScreen});
		vm.rightButtons.push({label: "QR code", icon: "fa-qrcode", click: showQRCodeReader});
		vm.rightButtons.push({label: "Oculus", icon: "fa-simplybuilt", click: enterOculusDisplay});

		vm.viewingOptionButtons = [
			{label: "Helicopter", icon: "fa-arrows", click: helicopter},
			{label: "Turntable", icon: "fa-mouse-pointer", click: turntable}
		];
    }
}());
