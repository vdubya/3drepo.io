(function () {
	"use strict";

	var text,
		passwordForgotLink = element(by.id('loginPasswordForgotLink')),
		usernameInput = element(by.model('vm.username')),
		emailInput = element(by.model('vm.email')),
		requestButton = element(by.id('requestButton')),
		message = element(by.id('message')),
		config = require('../../../config/protractor/config.json');

	describe('Password forgot', function() {
		browser.get('http://staging/');

		it('User can enter text in username input', function() {
			passwordForgotLink.click();
			text = "hello";
			usernameInput.sendKeys(text);
			expect(usernameInput.getAttribute('value')).toEqual(text);
		});

		it('User can enter text in email input', function() {
			text = "hello@world.com";
			emailInput.sendKeys(text);
			expect(emailInput.getAttribute('value')).toEqual(text);
		});

		it('Button click should display error for no username/email', function() {
			doRequest();
			expect(message.getText()).toEqual("All fields must be filled");
		});

		it('Button click should display error for incorrect username/email', function() {
			doRequest("xyz", "awe@blah.com");
			expect(message.getText()).toEqual("Error with with one or more fields");
		});
	});

	function doRequest (username, password) {
		usernameInput.clear().then(function() {
			emailInput.clear().then(function() {
				usernameInput.sendKeys(username);
				emailInput.sendKeys(password);
				requestButton.click();
			});
		});
	}
}());