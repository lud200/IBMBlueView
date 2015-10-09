var filtesr = angular.module("filter", []);

filtesr.filter('shortdate', function(){
	return function(input){
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		if(input){
			var data = new Date(input);
			var month = data.getMonth();
			var year = data.getDate();
			var hours = data.getHours();
			var mins = data.getMinutes();
			var ampm = hours >= 12 ? 'PM' : 'AM';
			hours = hours % 12;
			hours = hours ? hours : 12;
			return months[month] + ' ' + year + ',' + ' ' + hours + ':' + (mins < 10 ? '0'+mins : mins) + ' ' + ampm;
		}else{
			return '';	
		}
	}
})