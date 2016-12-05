(function () {
	"use strict";

	describe('Directive: LoginDirective', function() {
		var element,
			controller,
			$scope,
			data,
			eventService;

		beforeEach(module('3drepo'));

		beforeEach(module("templates"));

		beforeEach(inject(function($compile, $rootScope, EventService) {
			eventService = EventService;
			element = $compile('<login></login>')($rootScope.$new());
			$rootScope.$digest();
			controller = element.controller("login");
			$scope = element.isolateScope() || element.scope();
		}));

		it('login error code status 500', inject(function($timeout) {
			data = {error: {place: "POST", status: 500}};
			doLoginError(data, $timeout);
			expect($scope.vm.errorMessage).toEqual("There is currently a problem with the system. Please try again later.");
		}));

		it('login error code value 61', inject(function($timeout) {
			data = {error: {place: "POST", value: 61}};
			doLoginError(data, $timeout);
			expect($scope.vm.errorMessage).toEqual("Please click on the link in the verify email sent to your account");
		}));

		function doLoginError (data, $timeout) {
			eventService.send(eventService.EVENT.USER_LOGGED_IN, data);
			$scope.$digest();
			$timeout.flush();
		}
	});
}());
