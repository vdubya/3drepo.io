(function () {
	"use strict";

	var text,
		signUpLink = element(by.id('loginSignUpLink')),
		messageInput,
		nameInput,
		emailInput,
		sendButton,
		message;

	describe("Contact:", function () {
		browser.get('http://staging/');

		it("Clicking the Get In Touch button on the pricing page should take the user to the contact page", function () {
			signUpLink.click();
			var contactButton = element(by.id('contactButton'));
			contactButton.click();
			element.all(by.tagName('contact')).then(function(items) {
				expect(items.length).toEqual(1);
			});
		});

		it('User can enter text in message input', function() {
			text = "hello";
			messageInput = element(by.model('vm.contact.information'));
			messageInput.sendKeys(text);
			expect(messageInput.getAttribute('value')).toEqual(text);
			sendButton = element(by.id('contactSendButton'));
			expect(sendButton.isEnabled()).toBe(false);
		});

		it('User can enter text in name input', function() {
			text = "hello";
			nameInput = element(by.model('vm.contact.name'));
			nameInput.sendKeys(text);
			expect(nameInput.getAttribute('value')).toEqual(text);
			expect(sendButton.isEnabled()).toBe(false);
		});

		it('User can enter text in email input', function() {
			text = "hello@world.com";
			emailInput = element(by.model('vm.contact.email'));
			emailInput.sendKeys(text);
			expect(emailInput.getAttribute('value')).toEqual(text);
		});

		it('Send button enabled only if all inputs have valid text', function() {
			expect(sendButton.isEnabled()).toBe(true);
		});
	});
}());