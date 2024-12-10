(function(ng){
	
	"use strict";

	ng.module('App').directive('resize', function ($window) {
	    return function (scope, element) {
	        var w = angular.element($window);
	        scope.getWindowDimensions = function () {
	            return {
	                'h': w.height(),
	                'w': w.width(),
					'screen_w' : screen.width,
					'screen_h' : screen.height,
					'pixel_ratio' : (window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth).toFixed(4)
	            };
	        };

	        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {

				// console.log("Resize Directive | Pixel Ratio " + newValue.pixel_ratio)
				// console.log("Resize Directive | Cabecera Height  " + angular.element('.cabecera').height() + " px")
				// console.log("Resize Directive | NavBarDark Height  " + angular.element('.navBarDark').height() + " px")

				// console.log("Resize Directive | Old Width Value " +  oldValue.w)
				// console.log("Resize Directive | Old Height Value " + oldValue.h)

				scope.windowWidth = newValue.w;
				scope.windowHeight = newValue.h;

				// console.log("Resize Directive | New Width Value " +  newValue.w)
				// console.log("Resize Directive | New Height Value " + newValue.h)

				scope.resize = function () {
					if(newValue.pixel_ratio === '1.2500' || newValue.pixel_ratio === '1.5000')
						return {'height': '91vh'};
					else
						return {'height': '75vh'}; //ok
				};

	            scope.resizeHeight = function (cutHeight) {

					// console.log("Resize Directive | resizeHeight Method")

					if(newValue.pixel_ratio === '1.2500')
						return {'height': '100vh'};
					else if(newValue.pixel_ratio === '1.5000')
						return {'height': '130vh'};
					else {
						if(newValue.pixel_ratio === '1.0000'
							&& cutHeight === 'app'
							&& angular.element('.cabecera').height()
							&& angular.element('.navBarDark').height())
							return {'height': `calc(100vh - ${angular.element('.cabecera').height() + angular.element('.navBarDark').height()}px)`};
						// else
						// 	return {'height': '85vh'};
					}
				};

				scope.resizeMaxHeight = function (cutHeight) {

					// console.log("Resize Directive | resizeMaxHeight Method")

					if(newValue.pixel_ratio === 1.25)
						return {'height': '95vh'};
					else
						return {'height': '75vh'};
	            };

				scope.resizeHeightDetalle = function () {

					// console.log("Resize Directive | resizeHeightDetalle Method")

					if(newValue.pixel_ratio === 1.25)
						return {'height': '95vh'};
					else
						return {'height': '90vh'};
				};

	            scope.resizeMitad = function () {
	            	return {'height': (newValue.h / 2 - 110)};
	            };
	            
	            scope.resizeMitadBoton = function () {
	            	return {'height': (newValue.h / 2 - 120)};
	            };
	            
	            scope.resizeHeightTable = function () {
					if(newValue.pixel_ratio === 1.25)
						return {'height': '95vh'};
					else
						return {'height': '90vh'};
	            };
	            
	            scope.resizeHeightButtom = function(){
	            	return {
	                    'height': (newValue.h - 200 - angular.element('.footerMargin .navbar').height()) + 'px'//,
	                    //'width': (newValue.w - 100) + 'px'
	                };
	            }
	
	        }, true);
	
	        w.bind('resize', function () {
	            scope.$apply();
	        });
	    }
	})
})(window.angular);