var directives = angular.module("directives", []);
/*enter press*/
directives.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

/*upload file*/
directives.directive('uploadImage', [function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var reader = new FileReader();
            reader.onload = function (e) {
                scope.candidate.image = e.target.result;
                scope.$apply();
            };

            elem.on('change', function() {
                reader.readAsDataURL(elem[0].files[0]);
            });
        }
    };
}]);

directives.directive('sameHeight', function ($window, $timeout) {
	var sameHeight = {
		restrict: 'A',
		groups: {},
		link: function (scope, element, attrs) {
			$timeout(getHighest); // make sure angular has proceeded the binding
			angular.element($window).bind('resize', getHighest);

			function getHighest() {
				if (!sameHeight.groups[attrs.sameHeight]) { // if not exists then create the group
					sameHeight.groups[attrs.sameHeight] = {
						height: 0,
						elems:[]
					};
				}
				sameHeight.groups[attrs.sameHeight].elems.push(element);
				element.css('height', ''); // make sure we capture the origin height
				if (sameHeight.groups[attrs.sameHeight].height < element.outerHeight()) {
					sameHeight.groups[attrs.sameHeight].height = element.outerHeight();
				}
				
				if(scope.$last){ // reinit the max height
					var iMax = 0;
				   	angular.forEach(sameHeight.groups[attrs.sameHeight].elems, function(elem){
						iMax = Math.max(iMax,elem.height());
					});
					angular.forEach(sameHeight.groups[attrs.sameHeight].elems, function(elem){
						elem.css('height', iMax);
					});
					sameHeight.groups[attrs.sameHeight].height = 0;
					sameHeight.groups[attrs.sameHeight].elems = [];
				}
			}
		}
	};
	return sameHeight;
});
