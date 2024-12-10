(function(ng){
	ng.module('App').directive('domain', function () {

		function validateDomain(val) {
			let valid = false;
			if(val) {
				if(typeof val == 'string') {
					if(val.lastIndexOf('.') != -1 && val.lastIndexOf('.') < (val.length - 1)) {
						valid = true;
					}
				}
			}
			return valid;
		}

	    return {
			require: 'ngModel',
			link: function(scope, elem, attr, ngModel) {
				if(ngModel) {
					ngModel.$parsers.push(function(inputVal) {
						// let valid = validateDomain(inputVal);
						// ngModel.$setValidity('domainValidation', valid);
						ngModel.$setValidity('domainValidation', validateDomain(inputVal));
						return inputVal;
					});
				}
			}
		};
	})
})(window.angular);