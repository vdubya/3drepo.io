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
        .controller('NewTreeCtrl', NewTreeCtrl);

    NewTreeCtrl.$inject = ["$scope", "$timeout", "NewTreeService"];

    function NewTreeCtrl ($scope, $timeout, NewTreeService) {
        var nt = this,
            promise = null;
        nt.showView = false;
        nt.search = null;
        nt.showSearchingIcon = true;
        nt.showDataIndicator = false;
        nt.nodes = [];
        nt.placeholderText = "Loading...";

        promise = NewTreeService.init();
        promise.then(function(data) {
            nt.showChildren = true;
            nt.allNodes = [];
            nt.allNodes.push(data);
            nt.nodes = nt.allNodes;
            nt.showSearchingIcon = false;
            nt.showDataIndicator = true;
            nt.placeholderText = "Search";
        });

        $scope.$watch("nt.searchText", function (newValue) {
            if (angular.isDefined(newValue)) {
                if (nt.search !== null) {
                    $timeout.cancel(nt.search);
                }
                nt.search = $timeout(function() {
                    if (newValue === "") {
                        nt.showSearchingIcon = false;
                        nt.showChildren = true;
                        nt.nodes = nt.allNodes;
                    }
                    else {
                        nt.showSearchingIcon = true;
                        promise = NewTreeService.search(newValue);
                        promise.then(function(json) {
                            nt.showChildren = false;
                            nt.nodes = json.data;
                            nt.showSearchingIcon = false;
                            nt.showView = (nt.nodes.length > 0);
                        });
                    }
                }, 500);
            }
        });

        nt.mouseEnter = function () {
            nt.showView = true;
            nt.showDataIndicator = false;
        };

        nt.mouseLeave = function () {
            nt.showView = false;
            nt.showDataIndicator = (nt.nodes.length > 0);
        };

        function getElementsStartsWithId (id) {
            var children = document.body.getElementsByTagName('*'),
                elements = [],
                child,
                i = 0,
                length = 0;
            console.log(children);

            for (i = 0, length = children.length; i < length; i += 1) {
                child = children[i];
                if (child.id.search(id) !== -1) {
                    elements.push(child);
                }
            }
            return elements;
        }

        nt.find = function () {
            //var root = angular.element(document.querySelector("#scenetree"));
            var elements = getElementsStartsWithId("cenetree");
            console.log(elements);
        };
    }
}());
