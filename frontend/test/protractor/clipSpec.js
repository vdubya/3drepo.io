(function () {
	"use strict";

	let clipButton,
		slider,
		firstRadioButton,
		disableButton,
		clipPlane;
	const config = require('../../../config/protractor/config.json');

	describe("Clip:", function () {
		browser.get('http://staging/');

		it("Clipping plane should be enabled when card is first shown", function () {
			// Log in
			element(by.model('vm.user.username')).sendKeys(config.validUser.username);
			element(by.model('vm.user.password')).sendKeys(config.validUser.password);
			element(by.id('loginButton')).click();
			// Get (the first, i.e. user's) sample project and view it
			element.all(by.id('sample_project')).first().click();
			// Show the Clip card
			clipButton = element(by.id('Clip'));
			clipButton.click();
			// Expect the clip to be enabled
			slider = element(by.tagName('md-slider'));
			expect(slider.getAttribute('disabled')).toBe(null);
			firstRadioButton = element.all(by.tagName('md-radio-button')).first();
			expect(firstRadioButton.getAttribute('disabled')).toBe(null);
			// Expect clip plane in viewer
			element.all(by.tagName('clipplane')).then(function(items) {
				expect(items.length).toEqual(1);
				clipPlane = element(by.tagName('clipplane'));
			});
		});

		it("Clipping plane should disappear when card is hidden", function () {
			// Hide Clip card
			clipButton.click();
			// Expect no clip element in viewer
			element.all(by.tagName('clipplane')).then(function(items) {
				expect(items.length).toEqual(0);
			});
		});

		it("Disabling should disable all inputs", function () {
			// Show Clip card
			clipButton.click();
			// Disable
			disableButton = element(by.tagName('panel-card-option-visible'));
			disableButton.click();
			expect(slider.getAttribute('disabled')).toBe('true');
			expect(firstRadioButton.getAttribute('disabled')).toBe('true');
		});

		it("Clicking the axes buttons should position the clipping plane in the correct plane", function () {
			// Enable
			disableButton.click();
			// Assume on X axis
			clipPlane.getAttribute('plane').then(function (value) {
				expect(value.indexOf("-1 0 0")).toBe(0);
			});
			// Y axis
			element.all(by.tagName('md-radio-button')).then(function(items) {
				items[1].click();
				clipPlane.getAttribute('plane').then(function (value) {
					expect(value.indexOf("0 0 -1")).toBe(0);
				});
				// Z axis
				items[2].click();
				clipPlane.getAttribute('plane').then(function (value) {
					expect(value.indexOf("0 -1 0")).toBe(0);
				});
			});
		});
	});
}());