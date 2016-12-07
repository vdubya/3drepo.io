(function () {
	"use strict";

	var text,
		signUpLink = element(by.id('loginSignUpLink')),
		usernameInput,
		emailInput,
		passwordInput,
		signUpButton,
		message = element(by.id('message')),
		config = require('../../../config/protractor/config.json');

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
			var tcCheckBox = element(by.model('vm.newUser.tcAgreed'));
			tcCheckBox.click();
			expect(tcCheckBox.getAttribute('aria-checked')).toBe("true");
		});

		it('Clicking the Terms & Conditions link opens the T&Cs in a new tab', function() {
			openTabAndCheckForTag("terms", "terms");
		});

		it('Clicking the Privacy link opens the Privacy in a new tab', function() {
			openTabAndCheckForTag("privacy", "privacy");
		});

		it('Clicking the Cookies link opens the Cookies in a new tab', function() {
			openTabAndCheckForTag("cookies", "cookies");
		});

		it('Button click should show error for missing username', function() {
			clearInputs();
			text = "hello@world.com";
			emailInput = element(by.model('vm.newUser.email'));
			text = "hello";
			passwordInput = element(by.model('vm.newUser.password'));
			signUpButton = element(by.id('signUpButton'));
			signUpButton.click();
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

	function openTabAndCheckForTag (tabPage, tag) {
		var tcLink = element(by.className(tabPage));
		// This will open terms in a new tab
		tcLink.click();
		// Get all tabs
		browser.getAllWindowHandles().then(function (handles) {
			// Switch to new tab
			browser.switchTo().window(handles[1]).then(function () {
				element.all(by.tagName(tag)).then(function(items) {
					expect(items.length).toEqual(1);
					// Close new tab
					browser.driver.close();
					// Go to first tab
					browser.driver.switchTo().window(handles[0]);
				});
			});
		});
	}
}());