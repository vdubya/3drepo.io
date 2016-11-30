(function () {
	"use strict";

	describe('Directive: LoginDirective', function() {
		var element, controller;

		beforeEach(module('3drepo'));

		beforeEach(module("templates"));

		beforeEach(inject(function($compile, $rootScope) {
			element = $compile('<login></login>')($rootScope);
			$rootScope.$digest();
			controller = element.controller("login");
		}));

		it('does something', function() {
			console.log(controller);
			controller.user = {
				username: "blah"
			};
			controller.login();
			expect(true).toBe(true);
		});
	});
}());
