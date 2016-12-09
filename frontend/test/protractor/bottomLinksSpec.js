(function () {
	"use strict";

	const Utils = require('./utils');

	describe("Bottom links:", function () {
		browser.get('http://staging/');

		it("Clicking the contact link should open the contact page in a new tab", function () {
			Utils.openTabAndCheckForTag("contact", "contact");
		});

		it("Clicking the pricing link should open the contact page in a new tab", function () {
			Utils.openTabAndCheckForTag("pricing", "pricing");
		});

		it("Clicking the cookies link should open the cookies page in a new tab", function () {
			Utils.openTabAndCheckForTag("cookies", "cookies");
		});

		it("Clicking the privacy link should open the privacy page in a new tab", function () {
			Utils.openTabAndCheckForTag("privacy", "privacy");
		});

		it("Clicking the terms & conditions link should open the t&c page in a new tab", function () {
			Utils.openTabAndCheckForTag("terms", "terms");
		});
	});
}());