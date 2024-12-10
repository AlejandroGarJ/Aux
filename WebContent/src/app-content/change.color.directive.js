(function(ng){
    "use strict";
	ng.module('App').directive('changeColor', function () {
	    return {
            scope: {
                id: '=changeColor'
            },
			link: function(scope, element, attrs) {
                scope.$watch('id', function(newValue, oldValue) {
                    if (newValue) {
                        if (newValue === 21) {
                            element.css('color', '#c466ef');
                        } else if (newValue === 22) {
                            element.css('color', '#59c2c9');
                        } else if (newValue === 23){
                            element.css('color', '#eac344');
                        }
                    }
                });
            }
        };
	})
})(window.angular);