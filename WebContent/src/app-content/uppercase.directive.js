(function(ng){
	ng.module('App').directive('uppercase', function () {
	    return {
			require: 'ngModel',
			link: function(scope, elem, attr, ngModel) {
				if(ngModel) {
					ngModel.$parsers.push(function(inputVal) {
						return inputVal ? inputVal.toUpperCase() : "";
					});
					// elem.css("text-transform", "uppercase");
				}
			}
		};
	})
})(window.angular);