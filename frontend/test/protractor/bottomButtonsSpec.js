(function () {
	"use strict";

	let compass;
	const config = require('../../../config/protractor/config.json');

	describe("Bottom buttons:", function () {
		browser.get('http://staging/');

		it("Clicking the compass toggles the visibility of the UI cards", function () {
			// Log in
			element(by.model('vm.user.username')).sendKeys(config.validUser.username);
			element(by.model('vm.user.password')).sendKeys(config.validUser.password);
			element(by.id('loginButton')).click();
			// Get (the first, i.e. user's) sample project and view it
			element.all(by.id('sample_project')).first().click();
			// Toggle off
			compass = element(by.tagName('compass'));
			compass.click();

		});
	});
}());