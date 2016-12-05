(function () {
	"use strict";

	var text,
		usernameInput = element(by.model('vm.user.username')),
		passwordInput = element(by.model('vm.user.password')),
		config = require('../../../config/protractor/config.json');

	describe('login page', function() {
		browser.get('http://staging/');

		it('should allow text input in username field', function() {
			text = "hello";
			usernameInput.sendKeys(text);
			expect(usernameInput.getAttribute('value')).toEqual(text);
		});

		it('should allow text input in password field', function() {
			text = "hello";
			passwordInput.sendKeys(text);
			expect(passwordInput.getAttribute('value')).toEqual(text);
		});

		it('should log in', function() {
			login(config.validUser.username, config.validUser.username);
			element.all(by.css('#account')).then(function(items) {
				expect(items.length).toEqual(1);
			});
		});

		it('should not log in', function() {
			// Logout
			element(by.id('accountMenuButton')).click();
			element(by.id('logoutButton')).click();

			login(config.invalidUser.username, config.invalidUser.password);
			element.all(by.css('#account')).then(function(items) {
				expect(items.length).toEqual(0);
			});
		});

		/* Stuff
		 var EC = protractor.ExpectedConditions;
		 var e = element(by.id('accountMenuButton'));
		 var isClickable = EC.elementToBeClickable(e);
		 browser.wait(isClickable, 5000);
		 e.click();

		 browser.pause();
		 expect(browser.getTitle()).toEqual('3D Repo | Online BIM collaboration platform');
		 */
	});

	function login (username, password) {
		usernameInput.clear().then(function() {
			passwordInput.clear().then(function() {
				usernameInput.sendKeys(username);
				passwordInput.sendKeys(password);
				element(by.id('loginButton')).click();
			});
		});
	}
}());
