'use strict';

/* Services */
var REPOServices = angular.module('Services', []);

//get user info
REPOServices.factory('dataServices',['$http','$q',function($http, $q){
	return {
		query : function(url) {
			var deferred = $q.defer();
			$http({method: 'GET', url: 'data/'+url+'.json'}).
			success(function(data, status, headers, config){
				deferred.resolve(data);
			}).
			error(function(data, status, headers, config){
				deferred.reject(data);
			});
			return deferred.promise;
		} 
	};
}]);