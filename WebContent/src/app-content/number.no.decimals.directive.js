(function(ng){
	ng.module('App').directive('noDecimals', function () {
	    return {
			require: 'ngModel',
			link: function (scope, element, attr, ngModelCtrl) {
				const pattern = /[^0-9.]*/g;

				function fromUser(text) {
					if (!text)
						return text;

					let transformedInput = text.replace(pattern, '');
					transformedInput = transformedInput.replaceAll('.', '')
					transformedInput = transformedInput.trim();

					const formattedValue = new Intl.NumberFormat('de-DE').format(transformedInput);

					if (formattedValue !== text) {
						ngModelCtrl.$setViewValue(formattedValue);
						ngModelCtrl.$render();
					}
					return formattedValue;
				}
				ngModelCtrl.$parsers.push(fromUser);
			}
		};
	})
})(window.angular);