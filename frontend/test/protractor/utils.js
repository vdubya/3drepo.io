(function () {
	"use strict";

	const Utils = {
		openTabAndCheckForTag: function (tabPage, tag) {
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
	};

	module.exports = Utils;
}());
