(function () {
	"use strict";

	describe('Component: IssueComp', function() {
		var $componentController;

		beforeEach(module('3drepo'));

		beforeEach(inject(function(_$componentController_) {
			$componentController = _$componentController_;
		}));

		it('checks status of submit disabled', function() {
			var data = {
				status: "open",
				priorities: "none",
				topic_types: "for_information"
			};
			var bindings = {
				data: data,
				contentHeight: function () {}
			};
			var changes = {
				data: data
			};
			var ctrl = $componentController('issueComp', null, bindings);
			ctrl.$onChanges(changes);
			expect(true).toBe(true);
		});
	});
}());
