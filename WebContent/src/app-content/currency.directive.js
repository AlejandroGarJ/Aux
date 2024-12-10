(function(ng){
	ng.module('App').directive('currencyCiber', function () {
	    return {
			require: 'ngModel',
			link: function (scope, element, attr, ngModelCtrl) {
				const pattern = /[^0-9.,]*/g;
				function fromUser(text) {
					if (!text)
						return text;

					let transformedInput = text.replace(pattern, '');
					const endWithComma = transformedInput.endsWith(',');

					transformedInput = transformedInput.replaceAll('.', '').replace(',', '.');

					const parts = transformedInput.split('.');
                    let formattedValue;

                    if (parts.length > 1) {
                        // Conserve the decimals as user typed, specially to keep trailing zeros
                        formattedValue = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(parts[0]) + ',' + parts[1];
                    } else {
                        formattedValue = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(parts[0]);
                    }

					if (endWithComma) {
						formattedValue += ',';
					}

					if (formattedValue !== text) {
						ngModelCtrl.$setViewValue(endWithComma === true ? formattedValue.concat(',') : formattedValue);
						ngModelCtrl.$render();
					}
					return endWithComma === true ? formattedValue.concat(',') : formattedValue;
				}
				ngModelCtrl.$parsers.push(fromUser);
			}
		};
	})
})(window.angular);