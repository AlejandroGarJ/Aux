(function(ng){
	ng.module('App').directive('amount', function () {

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
		
		function beautifyImporte (x, noDecimal) {
			if (typeof x === "string") {
	            if (isNaN(parseFloat(x)) === false) {
	                x = x.replace(",", ".");
	            }
	        }

	        if (x == undefined || x == '' || isNaN(x) === true) {
	            x = 0;
	        }

	        if (typeof x === 'string') {
	            x = parseFloat(x);
	        }
	        x = x.toFixed(2);

	        var parts = x.toString().split(".");
	        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	        
	        if (noDecimal == true) {
	        	return parts[0];
	        } else {
		        return parts.join(",");
	        }
		}

	    return {
			require: 'ngModel',
			link: function(scope, elem, attr, ngModel) {
				if(ngModel) {
					if (attr.ngDisabled != "true" && attr.ngDisabled != true && attr.disabled != true) {
						ngModel.$parsers.push(function(inputVal) {
							let valid = false;
							if(isNaN(inputVal)) {
								valid = false;
								if(formatAmount(inputVal) > 0)
									valid = true;
							} else {
								valid = true;
							}

							ngModel.$setValidity('numValidation', valid);
							return formatAmount(inputVal);
						});
					} else {
						ngModel.$formatters.push(function (modelValue) {
							var noDecimal = false;
							if (ngModel.$$attr && ngModel.$$attr.noDecimal != null) {
								noDecimal = true;
							}
		                    var retVal = beautifyImporte(modelValue, noDecimal);
		                    var isValid = !isNaN(modelValue);
		                    return retVal;
		                });
					}
				}
			}
		};
	})
})(window.angular);