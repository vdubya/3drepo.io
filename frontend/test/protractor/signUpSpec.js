(function () {
	"use strict";

	var text,
		signUpLink = element(by.id('loginSignUpLink')),
		usernameInput,
		emailInput,
		passwordInput,
		tcCheckBox,
		signUpButton,
		message;

	const Utils = require('./utils');

	describe('Sign up:', function() {
		browser.get('http://staging/');

		it('Clicking sign up button in the Basic card takes user to sign up page', function() {
			signUpLink.click();
			var basicSignUpButton = element(by.id('basicSignUpButton'));
			basicSignUpButton.click();
			element.all(by.tagName('sign-up')).then(function(items) {
				expect(items.length).toEqual(1);
			});
		});

		it('Clicking sign up button in the Advanced card takes user to sign up page', function() {
			browser.navigate().back();
			var advancedSignUpButton = element(by.id('advancedSignUpButton'));
			advancedSignUpButton.click();
			element.all(by.tagName('sign-up')).then(function(items) {
				expect(items.length).toEqual(1);
			});
		});

		it('User can enter text in username input', function() {
			text = "hello";
			usernameInput = element(by.model('vm.newUser.username'));
			usernameInput.sendKeys(text);
			expect(usernameInput.getAttribute('value')).toEqual(text);
		});

		it('User can enter text in email input', function() {
			text = "hello@world.com";
			emailInput = element(by.model('vm.newUser.email'));
			emailInput.sendKeys(text);
			expect(emailInput.getAttribute('value')).toEqual(text);
		});

		it('User can enter text in password input', function() {
			text = "hello";
			passwordInput = element(by.model('vm.newUser.password'));
			passwordInput.sendKeys(text);
			expect(passwordInput.getAttribute('value')).toEqual(text);
		});

		it('User can click the Terms & Conditions checkbox', function() {
			tcCheckBox = element(by.model('vm.newUser.tcAgreed'));
			tcCheckBox.click();
			expect(tcCheckBox.getAttribute('aria-checked')).toBe("true");
		});

		it('Clicking the Terms & Conditions link opens the T&Cs in a new tab', function() {
			Utils.openTabAndCheckForTag("terms", "terms");
		});

		it('Clicking the Privacy link opens the Privacy in a new tab', function() {
			Utils.openTabAndCheckForTag("privacy", "privacy");
		});

		it('Clicking the Cookies link opens the Cookies in a new tab', function() {
			Utils.openTabAndCheckForTag("cookies", "cookies");
		});

		it('Button click should show error for missing username', function() {
			clearInputs();
			text = "hello@world.com";
			emailInput.sendKeys(text);
			text = "hello";
			passwordInput.sendKeys(text);
			message = element(by.className('registerError'));
			signUpButton = element(by.id('signUpButton'));
			signUpButton.click();
			expect(message.getText()).toEqual("Username not allowed");

		});

		it('Button click should show error for missing email', function() {
			clearInputs();
			text = "hello";
			usernameInput.sendKeys(text);
			text = "hello";
			passwordInput.sendKeys(text);
			signUpButton.click();
			expect(message.getText()).toEqual("Invalid email address");

		});

		it('Button click should show error for missing password', function() {
			clearInputs();
			text = "hello";
			usernameInput.sendKeys(text);
			text = "hello@world.com";
			emailInput.sendKeys(text);
			signUpButton.click();
			expect(message.getText()).toEqual("Password is missing");

		});

		it('Button click should show error for unchecked checkbox', function() {
			text = "hello";
			passwordInput.sendKeys(text);
			tcCheckBox.click(); // Clear previous check
			signUpButton.click();
			expect(message.getText()).toEqual("You must agree to the terms and conditions");
		});

		it('Clicking the pricing link should open the pricing page in a new tab', function() {
			Utils.openTabAndCheckForTag("pricing", "pricing");
		});

		it('Clicking the login link should open the pricing page in a new tab', function() {
			element(by.className("login")).click();
			element.all(by.tagName("login")).then(function(items) {
				expect(items.length).toEqual(1);
			});
		});
	});

	function clearInputs () {
		usernameInput.clear().then(function() {
			emailInput.clear().then(function() {
				passwordInput.clear();
			});
		});
	}

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