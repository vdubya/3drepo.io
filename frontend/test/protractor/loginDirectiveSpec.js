(function () {
	"use strict";

	describe('login page', function() {
		browser.get('http://staging/');

		it('should log in', function() {
			login('france', 'france');
			element.all(by.css('#account')).then(function(items) {
				expect(items.length).toEqual(1);
			});
		});

		it('should not log in', function() {
			// Logout
			element(by.id('accountMenuButton')).click();
			element(by.id('logoutButton')).click();

			login('france', 'blah');
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
		element(by.model('vm.user.username')).sendKeys(username);
		element(by.model('vm.user.password')).sendKeys(password);
		element(by.id('loginButton')).click();
	}
}());
