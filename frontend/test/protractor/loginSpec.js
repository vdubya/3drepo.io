(function () {
	"use strict";

	var text,
		usernameInput = element(by.model('vm.user.username')),
		passwordInput = element(by.model('vm.user.password')),
		passwordForgotLink = element(by.id('loginPasswordForgotLink')),
		signUpLink = element(by.id('loginSignUpLink')),
		versionNumber = element(by.id('loginVersion')),
		config = require('../../../config/protractor/config.json');

	describe('Login', function() {
		browser.get('http://staging/');

		it('Can enter text in username input', function() {
			text = "hello";
			usernameInput.sendKeys(text);
			expect(usernameInput.getAttribute('value')).toEqual(text);
		});

		it('Can enter text in password input', function() {
			text = "hello";
			passwordInput.sendKeys(text);
			expect(passwordInput.getAttribute('value')).toEqual(text);
		});

		it('Login button click enters user with valid username/password', function() {
			login(config.validUser.username, config.validUser.username, "loginButton");
			element.all(by.css('#account')).then(function(items) {
				expect(items.length).toEqual(1);
			});
		});

		it('Login button click displays error with invalid username/password', function() {
			logout();
			login(config.invalidUser.username, config.invalidUser.password, "loginButton");
			element.all(by.css('#account')).then(function(items) {
				expect(items.length).toEqual(0);
			});
		});

		it('Enter key is equivalent to login button click', function() {
			login(config.validUser.username, config.validUser.password, "enterKey");
			element.all(by.css('#account')).then(function(items) {
				expect(items.length).toEqual(1);
			});
		});

		it('Clicking "Forgot password" link should take user to password reset page', function() {
			logout();
			passwordForgotLink.click();
			expect(element(by.tagName('password-forgot')));
		});

		it('Clicking the "Sign up" link should take the user to the pricing page', function() {
			browser.navigate().back();
			signUpLink.click();
			expect(element(by.tagName('pricing')));
		});

		it('Version number is correct', function() {
			browser.navigate().back();
			expect(versionNumber.getText()).toEqual("Version: " + config.versionNumber);
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

	function login (username, password, type) {
		usernameInput.clear().then(function() {
			passwordInput.clear().then(function() {
				usernameInput.sendKeys(username);
				passwordInput.sendKeys(password);
				if (type === "loginButton") {
					element(by.id('loginButton')).click();
				}
				else if (type === "enterKey") {
					browser.actions().sendKeys(protractor.Key.ENTER).perform();
				}
			});
		});
	}

	function logout () {
		element(by.id('accountMenuButton')).click();
		element(by.id('logoutButton')).click();
	}
}());
