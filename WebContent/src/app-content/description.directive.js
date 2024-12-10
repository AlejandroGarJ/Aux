(function(ng){
	ng.module('App').directive('description', function () {

		function formatAmount(val) {
			var amount = 0;
			
			if (val !== null && val !== "" && val !== undefined) {
				if (typeof val == "string") {
					if (val.includes(",") && val.includes(".")) {
						val = val.replaceAll(".", "");
						val = val.replaceAll(",", ".");
						//20.000,50 -> 20000.5
					} else if (val.includes(",") && !val.includes(".")) {
						val = val.replaceAll(",", ".");
						//20000,50 -> 20000.5
					} else if (val.includes(".") && !val.includes(",")) {
						var amountSplit = val.split(".");
						if (amountSplit[amountSplit.length - 1] != null && amountSplit[amountSplit.length - 1].length > 2) {
							val = val.replaceAll(".", "");
							//20.000 -> 20000
						}
					}
					
					amount = parseFloat(val);
					
					if (isNaN(amount)) {
						amount = 0;
					}
				} else {
					amount = val;
				}
			}
			
			return amount;
		}

	    return {
			require: 'ngModel',
			link: function(scope, elem, attr, ngModel) {
				if(ngModel) {
					ngModel.$parsers.push(function(inputVal) {
						let valid = false;
						if(isNaN(inputVal)) {
							valid = true;
							if(formatAmount(inputVal) > 0)
								valid = false;
							if(inputVal.match(/[aA-zZ]/g))
								valid = true;
						} else {
							valid = false;
						}

						ngModel.$setValidity('descValidation', valid);
						return inputVal;
					});
				}
			}
		};
	})
})(window.angular);