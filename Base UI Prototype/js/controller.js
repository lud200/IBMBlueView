'use strict';

/*slider auto play duration (ms)*/
var sliderAutoPlay = true;
var sliderInterval = 3000;

/* Controller */
var controllers = angular.module('controllers',['Services']);

//dashboard Controller
controllers.controller("mainCtrl",
    function($scope,dataServices,$timeout,$location,$filter,$cookies){

        /*page type*/
        $scope.page="";
        /*user type*/
        $scope.pageTitle='';
		
        $scope.role = '';

        /*popup*/
        $scope.popup = '';
        $scope.sidebar = '';
        $scope.sidebarType = '';
        /*users*/
        $scope.users = '';
        $scope.selectedUser = '';
        $scope.selectedUserPw = '';
        $scope.selectedNotification = [];

        $scope.sortBy =[];
        $scope.sortByOpt ='name';
        $scope.sortByOptTemp ='name';
        $scope.sortOption = false;
        $scope.sortOptionTemp = false;
        $scope.sortTitle = '';

        $scope.filterOptions = [];
        $scope.filter = [];
        $scope.filterTitle = '';
        $scope.filterSearchResults = '';


        /*header actions*/
        $scope.headerAction = {
            "menu":false,
            "search":false,
            "action":false,
            "back":false,
            "searchInput":false
        };


        /*get network item*/
        var promise = dataServices.query('users');
        promise.then(function(data) {
            $scope.users = data;
			$.each($scope.users,function(index,elem){
				elem.loggedIn = false;
			});
			if($cookies.get('role') === 'interviewer'){ 
				$scope.selectedUser = $scope.users[1];
				$scope.users[1].loggedIn = true;
			}else{
				$scope.selectedUser = $scope.users[0];	
				$scope.users[0].loggedIn = true;	
			}
        }, function(data) {});
		
		$scope.$watch('role',function(newValue,oldVaule){
			if($scope.users){
				$.each($scope.users,function(index,elem){
					elem.loggedIn = false;
				});
				if($cookies.get('role') === 'interviewer'){
					$scope.selectedUser = $scope.users[1];
					$scope.users[1].loggedIn = true;
				}else{
					$scope.selectedUser = $scope.users[0];	
					$scope.users[0].loggedIn = true;
				}
			}
		});

        /*showUsers*/
        $scope.showUsers = function(){
            $scope.popup = "user";
            $scope.tempUser = null;
        };

        /*logOut*/
        $scope.logOut = function(){
            $scope.popup = "";
            $location.path('/login');
        };

        /*hide popup*/
        $scope.hidePopup = function(){
            $scope.popup = "";
        };
		
		/* Submit popup */
		$scope.submitPopup = function(){
			$scope.selectedNotification.candidate.descError = true;
			if($scope.selectedNotification.candidate.desc){
				$scope.selectedNotification.candidate.descError = false;
				$scope.popup = "";
			}
		}

        /*hide Sidebar*/
        $scope.hideSidebar = function(){
            $timeout(function(){$scope.sidebar = "";},200);
            $scope.sidebarType = '';
        };

        /*hide Sidebar*/
        $scope.resetFilter = function(){
            angular.forEach($scope.filterOptions,function(opt){
                $scope.filter[opt].val='';
            })
        };

        /*selectUser*/
        $scope.selectUser = function(user){
            $scope.tempUser = user;
            $scope.selectedUserPw = '';
        };

        /*signIn*/
        $scope.signIn = function(user,selectedUserPw){
            if(selectedUserPw === ''){
                return;
            }
            $scope.selectedUser = user;
            $scope.popup = '';
        };

        /*get transform*/
        $scope.getTransform = function(progress,factor){
            return {'transform': 'rotate('+progress*factor+'deg)', '-webkit-transform': 'rotate('+progress*factor+'deg)'}
        };

        /*setSortBy*/
        $scope.setSortBy = function(opt){
            angular.forEach($scope.sortBy,function(val){
                val.select= false;
            });
            opt.select = true;
            $scope.sortByOptTemp =opt.type;
        };

        /*setSortOption*/
        $scope.setSortOption = function(bool){
            $scope.sortOptionTemp =bool;
        };

        /*setSortOption*/
        $scope.getStatus = function(){
            var empty = true;
            angular.forEach($scope.filterOptions, function(val){
                if($scope.filter[val].options.length !== 0){
                    empty = false
                }
            });
            return empty?'disable':''
        };

        /*set page scroll to top*/
        $scope.$on('$stateChangeSuccess', function(next, current) {
            $timeout(function(){
                $('.view-frame').scrollTop(0);
                $(document).scrollTop(0)
            },100);
            $scope.isMenuOpen = false;
        });


        /*show Filter Options*/
        $scope.showFilterOptions = function(opt,event){
            $scope.opt = opt;
			if(opt !== 'date'){
				promise = dataServices.query(opt+'-filter-option');
				promise.then(function(data) {
					$scope.filterSearchResults = data;
				}, function(data) {});
	
				var offset = $(event.currentTarget).offset();
				$timeout(function(){
					$(".filter-search-options").css({top:offset.top+34,display:'block'})
				},100)
			}
        };

        /*addFilerValue*/
        $scope.addFilerValue = function(result){
            if($scope.filter[$scope.opt].options.indexOf(result)<0){
                $scope.filter[$scope.opt].options.push(result);
                $scope.filter[$scope.opt].val = '';
            }
        };

        /*removeFilterOption*/
        $scope.removeFilterOption = function(filterOption,opt){
            if($scope.filter[opt].options.indexOf(filterOption)>-1){
                var index = $scope.filter[opt].options.indexOf(filterOption);
                $scope.filter[opt].options.splice(index,1);
            }
        };

        /*applySortOption*/
        $scope.applySortOption = function(){
            $scope.sortByOpt = $scope.sortByOptTemp;
            $scope.sortOption = $scope.sortOptionTemp;
            $scope.hideSidebar();
        }
    }
);

//dashboard Controller
controllers.controller("loginCtrl",
    function($scope, dataServices, $location, $filter, $cookies){

        /*set banner*/
        $scope.$parent.page = "login";
        $scope.error = false;
		$scope.$parent.popup = '';

        /*Login form*/
        $scope.loginForm = {
            intranetId:'',
            pw:''
        };
		
		var promise;
        /*get regions*/
        promise = dataServices.query('secure');
        promise.then(function(data) {
            $scope.secure = data;
        }, function(data) {});

        /*next check*/
        $scope.login = function(loginForm){
            $scope.error = false;
            if(!loginForm.intranetId || !loginForm.pw){
				$scope.error = true;
            }else{
				var secure = $filter('filter')($scope.secure,{'name': loginForm.intranetId,'password': loginForm.pw},true);
				if(secure.length){
					if(secure[0].role === 'interviewer'){
						$cookies.put('role', 'interviewer');
						$scope.$parent.role = 'interviewer';
						$location.path('/interviewerDashboard');
					}else{
						$cookies.put('role', 'hr');
						$scope.$parent.role = 'hr';
						$location.path('/dashboard');
					}
				}else{
					$scope.error = true;	
				}
            }
        };
    }
);

//dashboard Controller
controllers.controller("dashboardCtrl",
    function($scope, dataServices,$timeout) {

        /*set banner*/
        $scope.$parent.page = "dashboard";
        $scope.$parent.pageTitle = "dashboard";
        $scope.search = false;
        $scope.notifications = [];
        $scope.searchResults = [];
        $scope.innerPopup = '';
        $scope.searchText = {
            "text":''
        };

        /*filter*/
        $scope.filter={
            "decline":true,
            "accept":true,
            "completed":true
        };

        /*sort options*/
        $scope.$parent.sortBy =[
            {
                "name": "Candidate name",
                "type": "candidate.name",
                "select": true
            },
            {
                "name": "Interviewer name",
                "type": "interviewer.name",
                "select": false
            },
            {
                "name": "Date/ Time",
                "type": "time",
                "select": false
            }
        ];

        $scope.$parent.sortTitle = 'Sort Notifications';
        $scope.$parent.sortOptionTemp = false;
        $scope.$parent.sortByOpt ='candidate.name';


        var promise;
        /*get notifications*/
        promise = dataServices.query('notifications');
        promise.then(function(data) {
            $scope.notifications = data;
        }, function(data) {});


        /*showSearch*/
        $scope.showSearch = function(user){
            $scope.search = true;
        };
        /*cancelSearch*/
        $scope.cancelSearch = function(){
            $scope.search = false;
            $scope.innerPopup = '';
        };
        /*clearSearchText*/
        $scope.clearSearchText = function(){
            $scope.searchText.text = '';
            $timeout(function(){
                $scope.innerPopup = '';
            },100)
        };

        /*doSearch*/
        $scope.doSearch = function(searchText){
            if(searchText !== ''){
                $scope.innerPopup = 'userSearch';

                /*get network item*/
                promise = dataServices.query('search-results');
                promise.then(function(data) {
                    $scope.searchResults = data;
                }, function(data) {});

            }else{
                $scope.innerPopup = '';
            }
        };

        /*selectSearch*/
        $scope.selectSearch = function(user){
            $scope.searchText.text = user.name;
            $timeout(function(){
                $scope.innerPopup = '';
            },100)
        };

        /*toggleFilterOption*/
        $scope.toggleFilterOption = function(filter,option){
            filter[option] = !filter[option]
        };
        /*get transform*/
        $scope.getTransform = function(progress,factor){
            if(progress===0){
                return ''
            }else{
                return {'transform': 'rotate('+progress*factor+'deg)', '-webkit-transform': 'rotate('+progress*factor+'deg)'}
            }
        };
        /*showReason*/
        $scope.showReason = function(notification){
            notification.actions = false;
            $scope.$parent.selectedNotification = notification;
            $scope.$parent.popup = 'reason';
        };
        /*deleteNotification*/
        $scope.deleteNotification = function(notification){
            var index = $scope.notifications.indexOf(notification);
            if (index > -1) {
                $scope.notifications.splice(index, 1);
            }
        };

        /*show sort sideBar*/
        $scope.showSortSidebar = function(){
            $timeout(function(){$scope.$parent.sidebarType = 'sidebar-right';},100);
            $scope.$parent.sidebar = 'sort';
        };

        /*toggleAction*/
        $scope.toggleAction = function(item){
            if(item.actions){
                item.actions = false;
            }else{
                angular.forEach($scope.notifications,function(val){
                    val.actions = false;
                });
                item.actions = true;
            }
        };

        /*hidePopup*/
        $scope.hideInnerPopup = function(){
            $scope.innerPopup ='';
        };

    }
);

//new Candidates Controller
controllers.controller("newCandidatesCtrl",
    function($scope, dataServices,$timeout) {

        /*set banner*/
        $scope.$parent.page = "newCandidates";
        $scope.$parent.pageTitle = "new Candidate";
        $scope.innerPopup = "";
        $scope.popupStyle = {};
        $scope.regions = [];
        $scope.locations = [];
        $scope.competency = [];
        $scope.interviewers = [];
        $scope.selectedInterviewers = [];

        $scope.showAddInterviewers = true;
        $scope.pageUrl = '';
        $scope.schduleTime='';

        $scope.candidate={
            image : "i/photo.png",
            name:"",
            region:"",
            location:"",
            competency:[],
            resume:{}
        };

        /*sort options*/
        $scope.$parent.sortBy =[
            {
                "name": "Interviewer name",
                "type": "name",
                "select": true
            },
            {
                "name": "No of Interviews",
                "type": "interviews",
                "select": false
            }
        ];

        $scope.$parent.sortTitle = 'Sort Interviews';
        $scope.$parent.sortOptionTemp = false;
        $scope.$parent.sortByOpt ='name';

        $scope.$parent.filterTitle = "Filter Candidates";
        $scope.$parent.filterOptions = ["name","location","region","competency"];
        $scope.$parent.filter = {
            name:{
                val:'',
                placeholder:'Enter Interviewer Name',
                options:[]
            },
            region:{
                val:'',
                placeholder:'Enter Region',
                options:[]
            },
            location:{
                val:'',
                placeholder:'Location',
                options:[]
            },
            competency:{
                val:'',
                placeholder:'Competency',
                options:[]
            }
        };

        /*calendar date*/
        $scope.dt = new Date();


        var promise;
        /*get regions*/
        promise = dataServices.query('regions');
        promise.then(function(data) {
            $scope.regions = data;
        }, function(data) {});

        /*get locations*/
        promise = dataServices.query('locations');
        promise.then(function(data) {
            $scope.locations = data;
        }, function(data) {});

        /*get competency*/
        promise = dataServices.query('competency');
        promise.then(function(data) {
            $scope.competency = data;
        }, function(data) {});

        /*get interviewers*/
        promise = dataServices.query('interviewers');
        promise.then(function(data) {
            $scope.interviewers = data;
        }, function(data) {});

        /*get interviewers*/
        promise = dataServices.query('time-schedule');
        promise.then(function(data) {
            $scope.timeSchedule = data;
        }, function(data) {});


        /*showPopup*/
        $scope.showPopup = function(event,type){
            if(type==='locations'&& $scope.candidate.region ===''){
                return false;
            }
            var offset = $(event.currentTarget).offset();
            $scope.popupStyle = {left: offset.left - 112, top : offset.top -270};
            $scope.innerPopup =type;
        };

        /*hidePopup*/
        $scope.hideInnerPopup = function(){
            $scope.innerPopup ='';
        };

        /*setVal*/
        $scope.setVal = function(obj, val,name){
            obj[name] = val;
            $scope.innerPopup ='';
        };

        /*addCompetency*/
        $scope.addCompetency = function(){
            $scope.innerPopup = "competency";
            $scope.competencyFilter = '';
        };

        /*addCompetency*/
        $scope.removeResume = function(){
            $scope.candidate.resume={};
        };

        /*toggleCompetency*/
        $scope.toggleCompetency = function(competence){
            competence.select = !competence.select;
            if(competence.sub){
                angular.forEach(competence.sub,function(val){
                    val.select = competence.select;
                })
            }
        };
        /*toggleSubCompetency*/
        $scope.toggleSubCompetency = function(competence,subCompetence){
            subCompetence.select = !subCompetence.select;
            if(subCompetence.select ){
                competence.select = true;
                angular.forEach(competence.sub,function(val){
                    if(!val.select){
                        competence.select = false;
                        return false;
                    }
                })
            }else{
                competence.select = false;
            }
        };

        /*setCompetency*/
        $scope.setCompetency = function(){
            $scope.candidate.competency = [];
            angular.forEach($scope.competency,function(val){
                if(val.select){
                    $scope.candidate.competency.push(val.name);
                }else if(val.sub){
                    angular.forEach(val.sub,function(sub){
                        if(sub.select){
                            $scope.candidate.competency.push(sub.name);
                        }
                    })
                }
            });
            $scope.hideInnerPopup();
        };

        /*remove Competency*/
        $scope.removeCompetency = function(competence){
            var index = $scope.candidate.competency.indexOf(competence);
            if (index >= 0) {
                $scope.candidate.competency.splice(index, 1);
            }
            angular.forEach($scope.competency,function(val){
                if(val.name === competence){
                    val.select = false;
                    if(val.sub){
                        angular.forEach(val.sub,function(sub){
                            sub.select =false;
                            return false;
                        })
                    }
                    return false;
                }
                if(val.sub){
                    angular.forEach(val.sub, function (subVal) {
                        if (subVal.name === competence) {
                            subVal.select = false;
                            return false;
                        }
                    })
                }
            });
        };

        /*getCompetencyStyle*/
        $scope.getCompetencyStyle = function(){
            var offsetIcon = $('#competenceAdd').offset();
            //var offsetPopup = $('.competency-popup').offset();
            var popupHeight = $('.competency-popup').outerHeight();
            var windowHeight = $(window).height();
            var left = $(window).width()/2-30;
            var top = (windowHeight-popupHeight)/2;

            if(popupHeight+top < offsetIcon.top + 50){
                top = offsetIcon.top - popupHeight/2;
                if(top+popupHeight>windowHeight){
                    top = windowHeight-popupHeight;
                }
            }


            return {left:left,top: top}
        };

        /*getCompetencyArrowStyle*/
        $scope.getCompetencyArrowStyle = function(){
            var offsetIcon = $('#competenceAdd').offset();
            var offsetPopup = $('.competency-popup').offset();

            return {top: offsetIcon.top-offsetPopup.top+14}
        };

        /*changeResume*/
        $scope.changeResume = function(file){
            console.log(file);
        };

        /*addInterviewers*/
        $scope.addInterviewers = function(){
            $scope.showAddInterviewers = true;
            $scope.pageUrl = 'partials/SelectInterviewers.html';

        };

        /*cancelAddInterviewers*/
        $scope.cancelAddInterviewers = function(){
            $scope.showAddInterviewers = false;
            $scope.pageUrl = '';
            $scope.selectedInterviewers =[];
            angular.forEach($scope.interviewers,function(interviewer){
                interviewer.select = false;
            })
        };

        /*show sort sideBar*/
        $scope.showSortSidebar = function(){
            $timeout(function(){$scope.$parent.sidebarType = 'sidebar-right';},100);
            $scope.$parent.sidebar = 'sort';
        };

        /*show sort sideBar*/
        $scope.showFilterSidebar = function(){
            $timeout(function(){$scope.$parent.sidebarType = 'sidebar-right';},100);
            $scope.$parent.sidebar = 'filter';
        };

        /*SelectInterviews*/
        $scope.selectInterviews = function(interviewer){
            interviewer.select = !interviewer.select;
            if(interviewer.select){
                $scope.selectedInterviewers.push(interviewer);
            }else{
                var index = $scope.selectedInterviewers.indexOf(interviewer);
                if (index > -1) {
                    $scope.selectedInterviewers.splice(index, 1);
                }
            }
        };

        /*timeSchedule*/
        $scope.scheduleTime = function(){
            if($scope.selectedInterviewers.length>0){
                $scope.pageUrl = 'partials/TimeSelect.html'
            }
        };
        /*timeSchedule*/
        $scope.addTime = function(time){
            $scope.schduleTime = time;
        };
        /*timeSchedule*/
        $scope.removeTime = function(){
            $scope.schduleTime = '';
        };
        /*timeSchedule*/
        $scope.submitInterviewers = function(){
            if($scope.schduleTime !== ''){
                $scope.showAddInterviewers = false;
                $scope.pageUrl = '';
                angular.forEach($scope.selectedInterviewers,function(interviewer){
                    interviewer.scheduledDate = $scope.dt;
                    interviewer.scheduledTime = $scope.schduleTime;
                })
            }
        };
        /*deleteInterviewer*/
        $scope.deleteInterviewer = function(interviewer){
            var index = $scope.selectedInterviewers.indexOf(interviewer);
            if (index > -1) {
                $scope.selectedInterviewers.splice(index, 1);
            }
            angular.forEach($scope.interviewers,function(val){
                if(val===interviewer){
                    val.select =false;
                }
            })
        };

    }
);

//Candidates Controller
controllers.controller("candidatesCtrl",
    function($scope, dataServices,$timeout) {

        /*set banner*/
        $scope.$parent.page = "candidates";
        $scope.$parent.pageTitle = "Candidates";

        $scope.innerPopup = '';
        $scope.candidates = [];

        $scope.searchText = {
            "text":''
        };


        /*sort options*/
        $scope.$parent.sortBy =[
            {
                "name": "Name",
                "type": "name",
                "select": true
            },
            {
                "name": "Region",
                "type": "region",
                "select": false
            },
            {
                "name": "Location",
                "type": "location",
                "select": false
            },
            {
                "name": "Competency",
                "type": "competency",
                "select": false
            }
        ];

        $scope.$parent.sortTitle = 'Sort Candidates';
        $scope.$parent.sortOptionTemp = false;
        $scope.$parent.sortByOpt ='name';

        $scope.$parent.filterTitle = "Filter Candidates";
        $scope.$parent.filterOptions = ["name","region","location","competency"];
        $scope.$parent.filter = {
            name:{
                val:'',
                placeholder:'Enter Candidate Name',
                options:[]
            },
            region:{
                val:'',
                placeholder:'Enter Region',
                options:[]
            },
            location:{
                val:'',
                placeholder:'Enter Location',
                options:[]
            },
            competency:{
                val:'',
                placeholder:'Enter Competency',
                options:[]
            }
        };


        var promise;

        /*get interviewers*/
        promise = dataServices.query('candidates');
        promise.then(function(data) {
            $scope.candidates = data;
        }, function(data) {});


        /*show sort sideBar*/
        $scope.showSortSidebar = function(){
            $timeout(function(){$scope.$parent.sidebarType = 'sidebar-right';},100);
            $scope.$parent.sidebar = 'sort';
        };

        /*show sort sideBar*/
        $scope.showFilterSidebar = function(){
            $timeout(function(){$scope.$parent.sidebarType = 'sidebar-right';},100);
            $scope.$parent.sidebar = 'filter';
        };
        /*showSearch*/
        $scope.showSearch = function(user){
            $scope.search = true;
        };
        /*cancelSearch*/
        $scope.cancelSearch = function(){
            $scope.search = false;
            $scope.innerPopup = '';
        };
        /*clearSearchText*/
        $scope.clearSearchText = function(){
            $scope.searchText.text = '';
            $timeout(function(){
                $scope.innerPopup = '';
            },100)
        };

        /*doSearch*/
        $scope.doSearch = function(searchText){
            if(searchText !== ''){
                $scope.innerPopup = 'userSearch';

                /*get network item*/
                promise = dataServices.query('search-results');
                promise.then(function(data) {
                    $scope.searchResults = data;
                }, function(data) {});

            }else{
                $scope.innerPopup = '';
            }
        };

        /*selectSearch*/
        $scope.selectSearch = function(user){
            $scope.searchText.text = user.name;
            $timeout(function(){
                $scope.innerPopup = '';
            },100)
        };

        /*get transform*/
        $scope.getTransform = function(interviews,factor){
                var completed = 0;
                angular.forEach(interviews,function(interview){
                    if(interview.status ==='accept'){
                        completed++;
                    }
                });
                if(completed===0){
                    return '';
                }else{
                    return {'transform': 'rotate('+parseInt(completed/interviews.length*factor*100)+'deg)', '-webkit-transform': 'rotate('+parseInt(completed/interviews.length*factor*100)+'deg)'}
                }
        };

        /*get transform*/
        $scope.getCompletedInterviews = function(interviews){
            var completed = 0;
            angular.forEach(interviews,function(interview){
                if(interview.status ==='accept'){
                    completed++;
                }
            });
            if(completed===0){
                return 'No';
            }else{
                return completed+'/'+interviews.length;
            }
        };

        /*toggleAction*/
        $scope.toggleAction = function(item){
            if(item.actions){
                item.actions = false;
            }else{
                angular.forEach($scope.candidates,function(val){
                    val.actions = false;
                });
                item.actions = true;
            }
        };

        /*deleteNotification*/
        $scope.deleteCandidate = function(candidate){
            var index = $scope.candidates.indexOf(candidate);
            if (index > -1) {
                $scope.candidates.splice(index, 1);
            }
        };

        /*hidePopup*/
        $scope.hideInnerPopup = function(){
            $scope.innerPopup ='';
        };

    }
);

//candidate Info Controller
controllers.controller("candidateInfoCtrl",
    function($scope, dataServices,$timeout) {

        /*set banner*/
        $scope.$parent.page = "candidates";
        $scope.$parent.pageTitle = "Candidate Info";
		$scope.innerPopup = '';
        $scope.candidate=[];
        $scope.searchText = {
            "text":''
        };


        var promise;
        /*get interviewers*/
        promise = dataServices.query('candidate-info');
        promise.then(function(data) {
            $scope.candidate = data;
        }, function(data) {});

        /*get transform*/
        $scope.getTransform = function(interviews,factor){
            if(typeof(interviews) === "undefined"){
                return false;
            }
                var completed = 0;
                angular.forEach(interviews,function(interview){
                    if(interview.status ==='complete'){
                        completed++;
                    }
                });
                return {'transform': 'rotate('+parseInt(completed/interviews.length*factor*100)+'deg)', '-webkit-transform': 'rotate('+parseInt(completed/interviews.length*factor*100)+'deg)'}

        };

        /*get transform*/
        $scope.getCompletedInterviews = function(interviews){
            var completed = 0;
            angular.forEach(interviews,function(interview){
                if(interview.status ==='complete'){
                    completed++;
                }
            });
            if(completed===0){
                return 'No';
            }else{
                return completed+'/'+interviews.length;
            }
        };
        /*get Status*/
        $scope.getStatus = function(interview){
            if(interview.status ==='complete'){
                return "Interview Completed"
            }else if(interview.status ==='accept'){
                return "Interview Accepted"
            }else if(interview.status ==='decline'){
                return "Interview Declined"
            }else if(interview.status ==='pending'){
                return "Pending Interview"
            }
        };

        /*toggleAction*/
        $scope.toggleAction = function(item){
            if(item.actions){
                item.actions = false;
            }else{
                angular.forEach($scope.candidate.interviews,function(val){
                    val.actions = false;
                });
                item.actions = true;
            }
        };
        /*showSearch*/
        $scope.showSearch = function(user){
            $scope.search = true;
        };
        /*cancelSearch*/
        $scope.cancelSearch = function(){
            $scope.search = false;
            $scope.innerPopup = '';
        };
        /*clearSearchText*/
        $scope.clearSearchText = function(){
            $scope.searchText.text = '';
            $timeout(function(){
                $scope.innerPopup = '';
            },100)
        };

        /*doSearch*/
        $scope.doSearch = function(searchText){
            if(searchText !== ''){
                $scope.innerPopup = 'userSearch';

                /*get network item*/
                promise = dataServices.query('search-results');
                promise.then(function(data) {
                    $scope.searchResults = data;
                }, function(data) {});

            }else{
                $scope.innerPopup = '';
            }
        };

        /*selectSearch*/
        $scope.selectSearch = function(user){
            $scope.searchText.text = user.name;
            $timeout(function(){
                $scope.innerPopup = '';
            },100)
        };

        /*hidePopup*/
        $scope.hideInnerPopup = function(){
            $scope.innerPopup ='';
        };

    }
);

//interviewResults Controller
controllers.controller("interviewResultsCtrl",
    function($scope, dataServices,$timeout) {

        /*set banner*/
        $scope.$parent.page = "candidates";
        $scope.$parent.pageTitle = "Interview results";
        $scope.candidate=[];


        var promise;
        /*get interviewers*/
        promise = dataServices.query('interview-results');
        promise.then(function(data) {
            $scope.candidate = data;
        }, function(data) {});

        /*get transform*/
        $scope.getTransform = function(interviews,factor){

                var completed = 0;
                angular.forEach(interviews,function(interview){
                    if(interview.status ==='complete'){
                        completed++;
                    }
                });
				if(typeof interviews !== 'undefined'){
                	return {'transform': 'rotate('+parseInt(completed/interviews.length*factor*100)+'deg)', '-webkit-transform': 'rotate('+parseInt(completed/interviews.length*factor*100)+'deg)'}
				}

        };

        /*get transform*/
        $scope.getCompletedInterviews = function(interviews){
            var completed = 0;
            angular.forEach(interviews,function(interview){
                if(interview.status ==='complete'){
                    completed++;
                }
            });
            if(completed===0){
                return 'No';
            }else{
                return completed+'/'+interviews.length;
            }
        };
        /*get Status*/
        $scope.getStatus = function(interview){
            if(interview.status ==='complete'){
                return "Interview Completed"
            }else if(interview.status ==='accept'){
                return "Interview Accepted"
            }else if(interview.status ==='decline'){
                return "Interview Declined"
            }else if(interview.status ==='pending'){
                return "Pending Interview"
            }
        };

    }
);


//interview Controller
controllers.controller("interviewersCtrl",
    function($scope, dataServices,$timeout) {

        /*set banner*/
        $scope.$parent.page = "interviewers";
        $scope.$parent.pageTitle = "Interviewers";
        $scope.candidate=[];
        $scope.innerPopup = '';



        /*sort options*/
        $scope.$parent.sortBy =[
            {
                "name": "Name",
                "type": "name",
                "select": true
            },
            {
                "name": "Region",
                "type": "region",
                "select": false
            },
            {
                "name": "Location",
                "type": "location",
                "select": false
            },
            {
                "name": "Competency",
                "type": "competency",
                "select": false
            }
        ];

        $scope.$parent.sortTitle = 'Sort Interviewers';
        $scope.$parent.sortOptionTemp = false;
        $scope.$parent.sortByOpt ='name';

        $scope.$parent.filterTitle = "Filter Interviewers";
        $scope.$parent.filterOptions = ["name","location","region","competency"];
        $scope.$parent.filter = {
            name:{
                val:'',
                placeholder:'Enter Interviewer Name',
                options:[]
            },
            region:{
                val:'',
                placeholder:'Enter Region',
                options:[]
            },
            location:{
                val:'',
                placeholder:'Enter Location',
                options:[]
            },
            competency:{
                val:'',
                placeholder:'Enter Competency',
                options:[]
            }
        };


        var promise;
        /*get interviewers*/
        promise = dataServices.query('interviewers');
        promise.then(function(data) {
            $scope.interviewers = data;
        }, function(data) {});



        /*show sort sideBar*/
        $scope.showSortSidebar = function(){
            $timeout(function(){$scope.$parent.sidebarType = 'sidebar-right';},100);
            $scope.$parent.sidebar = 'sort';
        };

        /*show sort sideBar*/
        $scope.showFilterSidebar = function(){
            $timeout(function(){$scope.$parent.sidebarType = 'sidebar-right';},100);
            $scope.$parent.sidebar = 'filter';
        };
        /*showSearch*/
        $scope.showSearch = function(user){
            $scope.search = true;
        };
        /*cancelSearch*/
        $scope.cancelSearch = function(){
            $scope.search = false;
            $scope.innerPopup = '';
        };
        /*clearSearchText*/
        $scope.clearSearchText = function(){
            $scope.searchText.text = '';
            $timeout(function(){
                $scope.innerPopup = '';
            },100)
        };

        /*doSearch*/
        $scope.doSearch = function(searchText){
            if(searchText !== ''){
                $scope.innerPopup = 'userSearch';

                /*get network item*/
                promise = dataServices.query('search-results');
                promise.then(function(data) {
                    $scope.searchResults = data;
                }, function(data) {});

            }else{
                $scope.innerPopup = '';
            }
        };

        /*selectSearch*/
        $scope.selectSearch = function(user){
            $scope.searchText.text = user.name;
            $timeout(function(){
                $scope.innerPopup = '';
            },100)
        };

        /*toggleAction*/
        $scope.toggleAction = function(item){
            if(item.actions){
                item.actions = false;
            }else{
                angular.forEach($scope.interviewers,function(val){
                    val.actions = false;
                });
                item.actions = true;
            }
        }

    }
);


//interviewer Info Controller
controllers.controller("interviewerInfoCtrl",
    function($scope, dataServices,$timeout) {

        /*set banner*/
        $scope.$parent.page = "interviewers";
        $scope.$parent.pageTitle = "Interviewer Info";
        $scope.interviewer=[];


        var promise;
        /*get interviewers*/
        promise = dataServices.query('interviewer-info');
        promise.then(function(data) {
            $scope.interviewer = data;
        }, function(data) {});

        /*get transform*/
        $scope.getTransform = function(progress,factor){
                return {'transform': 'rotate('+progress*factor+'deg)', '-webkit-transform': 'rotate('+progress*factor+'deg)'}

        };

        /*get transform*/
        $scope.getCompletedInterviews = function(interviews){
            var completed = 0;
            angular.forEach(interviews,function(interview){
                if(interview.status ==='complete'){
                    completed++;
                }
            });
            if(completed===0){
                return 'No';
            }else{
                return completed+'/'+interviews.length;
            }
        };
        /*get Status*/
        $scope.getStatus = function(interview){
            if(interview.status ==='complete'){
                return "Interview Completed"
            }else if(interview.status ==='accept'){
                return "Interview Accepted"
            }else if(interview.status ==='decline'){
                return "Interview Declined"
            }else if(interview.status ==='pending'){
                return "Pending Interview"
            }
        };

    }
);

//Edit Interview Controller
controllers.controller("editInterviewCtrl",
	function($scope, dataServices,$timeout, $location) {

		/*set banner*/
		$scope.$parent.page = "editInterview";
		$scope.selectedInterviewers = [];
		
		$scope.showScheduleTime = false;
		$scope.pageUrl = '';
		$scope.schduleTime='';
		
		/*sort options*/
		$scope.$parent.sortBy =[
			{
				"name": "Interviewer name",
				"type": "name",
				"select": true
			},
			{
				"name": "No of Interviews",
				"type": "interviews",
				"select": false
			}
		];
		
		$scope.$parent.sortTitle = 'Sort Interviews';
		$scope.$parent.sortOptionTemp = false;
		$scope.$parent.sortByOpt ='name';
		
		$scope.$parent.filterTitle = "Filter Candidates";
		$scope.$parent.filterOptions = ["name","location","region","competency"];
		$scope.$parent.filter = {
			name:{
				val:'',
				placeholder:'Enter Interviewer Name',
				options:[]
			},
			region:{
				val:'',
				placeholder:'Enter Region',
				options:[]
			},
			location:{
				val:'',
				placeholder:'Location',
				options:[]
			},
			competency:{
				val:'',
				placeholder:'Competency',
				options:[]
			}
		};
		
		/*calendar date*/
		$scope.dt = new Date();
		
		var promise;
		/*get regions*/
		promise = dataServices.query('regions');
		promise.then(function(data) {
			$scope.regions = data;
		}, function(data) {});
		
		/*get locations*/
		promise = dataServices.query('locations');
		promise.then(function(data) {
			$scope.locations = data;
		}, function(data) {});
		
		/*get competency*/
		promise = dataServices.query('competency');
		promise.then(function(data) {
			$scope.competency = data;
		}, function(data) {});
		
		/*get interviewers*/
		promise = dataServices.query('interviewers');
		promise.then(function(data) {
			$scope.interviewers = data;
			$scope.interviewers[0].select = true;
			$scope.selectedInterviewers.push($scope.interviewers[0]);
		}, function(data) {});
		
		/*get interviewers*/
		promise = dataServices.query('time-schedule');
		promise.then(function(data) {
			$scope.timeSchedule = data;
		}, function(data) {});
		
		/*show sort sideBar*/
		$scope.showSortSidebar = function(){
			$timeout(function(){$scope.$parent.sidebarType = 'sidebar-right';},100);
			$scope.$parent.sidebar = 'sort';
		};
		
		/*show sort sideBar*/
		$scope.showFilterSidebar = function(){
			$timeout(function(){$scope.$parent.sidebarType = 'sidebar-right';},100);
			$scope.$parent.sidebar = 'filter';
		};
		
		/*SelectInterviews*/
		$scope.selectInterviews = function(interviewer){
			interviewer.select = !interviewer.select;
				if(interviewer.select){
					$scope.selectedInterviewers.push(interviewer);
				}else{
					var index = $scope.selectedInterviewers.indexOf(interviewer);
					if (index > -1) {
						$scope.selectedInterviewers.splice(index, 1);
					}
			}
		};
		
		/*timeSchedule*/
		$scope.scheduleTime = function(){
			if($scope.selectedInterviewers.length>0){
				$scope.showScheduleTime = true;
				$scope.pageUrl = 'partials/EditTimeSelect.html';
			}
		};
		/*timeSchedule*/
		$scope.addTime = function(time){
			$scope.schduleTime = time;
		};
		/*timeSchedule*/
		$scope.removeTime = function(){
			$scope.schduleTime = '';
		};
		
		/*addInterviewers*/
		$scope.addInterviewers = function(){
			$scope.showScheduleTime = false;
			$scope.pageUrl = '';
		
		};
		
		$scope.submitInterviewers = function(){
			if($scope.schduleTime !== ''){
				$location.path('/dashboard');   
			}
		};
		
	}
);

//Edit Interview Controller
controllers.controller("interviewerDashboardCtrl",
	function($scope, dataServices, $timeout, $location) {

		/*set banner*/
		$scope.$parent.page = "interviewerdashboard";
		$scope.$parent.pageTitle = "dashboard";
		$scope.notifications = [];
		
		/*sort options*/
		$scope.$parent.sortBy =[
			{
				"name": "Candidate",
				"type": "candidate.name",
				"select": true
			},
			{
				"name": "Date/ Time",
				"type": "candidate.date",
				"select": false
			},
			{
				"name": "Location",
				"type": "candidate.location",
				"select": false
			},
			{
				"name": "Competency",
				"type": "candidate.competency",
				"select": false
			}
		];
		
		$scope.$parent.sortTitle = 'Sort Notifications';
		$scope.$parent.sortOptionTemp = false;
		$scope.$parent.sortByOpt ='candidate.name';
		
		
		var promise;
		/*get notifications*/
		promise = dataServices.query('interview-notifications');
			promise.then(function(data) {
			$scope.notifications = data;
		}, function(data) {});
		
		/*show sort sideBar*/
		$scope.showSortSidebar = function(){
			$timeout(function(){$scope.$parent.sidebarType = 'sidebar-right';},100);
			$scope.$parent.sidebar = 'sort';
		};
		
		/*Decline popup*/
		$scope.decline = function(notification){
			$scope.$parent.selectedNotification = notification;
			$scope.$parent.popup = 'decline';
		};
		/*Accept popup*/
		$scope.accept = function(notification){
			$scope.$parent.selectedNotification = notification;
			$scope.$parent.popup = 'accept';
		};
	
	}
);

//Interviewer Requests Controller
controllers.controller("interviewRequestsCtrl",
	function($scope, dataServices, $timeout) {

		/*set banner*/
		$scope.$parent.page = "interviewRequests";
		$scope.$parent.pageTitle = "requests";
		
		/*sort options*/
		$scope.$parent.sortBy =[
			{
				"name": "Candidate",
				"type": "candidate.name",
				"select": true
			},
			{
				"name": "Date/ Time",
				"type": "candidate.date",
				"select": false
			},
			{
				"name": "Location",
				"type": "candidate.location",
				"select": false
			},
			{
				"name": "Competency",
				"type": "candidate.competency",
				"select": false
			}
		];

		$scope.$parent.sortTitle = 'Sort Requests';
		$scope.$parent.sortOptionTemp = false;
		$scope.$parent.sortByOpt ='candidate.name';
		
		$scope.$parent.filterTitle = "Filter Requests";
		$scope.$parent.filterOptions = ["name","date","location","competency","hr"];
		$scope.$parent.filter = {
			name:{
				val:'',
				placeholder:'Enter Candidate Name',
				options:[]
			},
			date:{
				val:'',
				placeholder:'Select Date/ Time',
				options:[]
			},
			location:{
				val:'',
				placeholder:'Enter Location',
				options:[]
			},
			competency:{
				val:'',
				placeholder:'Enter Competency',
				options:[]
			},
			hr:{
				val:'',
				placeholder:'Enter HR Name',
				options:[]
			}
		};
			
		var promise;
		/*get notifications*/
		promise = dataServices.query('interview-requests');
		promise.then(function(data) {
			$scope.notifications = data;
		}, function(data) {});
		
		/*show sort sideBar*/
		$scope.showSortSidebar = function(){
			$timeout(function(){$scope.$parent.sidebarType = 'sidebar-right';},100);
			$scope.$parent.sidebar = 'sort';
		};
		
		/*show sort sideBar*/
		$scope.showFilterSidebar = function(){
			$timeout(function(){$scope.$parent.sidebarType = 'sidebar-right';},100);
			$scope.$parent.sidebar = 'filter';
		};
		
		/*Decline popup*/
		$scope.decline = function(notification){
			$scope.$parent.selectedNotification = notification;
			$scope.$parent.popup = 'decline';
		};
		/*Accept popup*/
		$scope.accept = function(notification){
			$scope.$parent.selectedNotification = notification;
			$scope.$parent.popup = 'accept';
		};
		
	}
);

//Interviewer Requests Controller
controllers.controller("interviewScheduleCtrl",
	function($scope, dataServices, $timeout) {
		/*set banner*/
		$scope.$parent.page = "interviewSchedule";
		$scope.$parent.pageTitle = "interview schedule";
		$scope.$parent.popup = '';
		
		/*get notifications*/
		var promise = dataServices.query('interview-schedule');
		promise.then(function(data) {
				$scope.notifications = data;
		}, function(data) {});
	}
		
);

//interviewConduct Controller
controllers.controller("interviewConductCtrl",
	function($scope, dataServices,$timeout) {

		/*set banner*/
		$scope.$parent.page = "interviewSchedule";
		$scope.$parent.pageTitle = "Conduct interview";
		$scope.candidate=[];
		
		$scope.showFullProfile = false;
		$scope.pageUrl = '';
		
		
		var promise;
		/*get interviewers*/
		promise = dataServices.query('interview-conduct');
		promise.then(function(data) {
			$scope.candidate = data;
		}, function(data) {});
		
		/*get transform*/
		$scope.getTransform = function(interviews,factor){
		
			var completed = 0;
			angular.forEach(interviews,function(interview){
				if(interview.status ==='complete'){
					completed++;
				}
			});
			if(typeof interviews !== 'undefined'){
				return {'transform': 'rotate('+parseInt(completed/interviews.length*factor*100)+'deg)', '-webkit-transform': 'rotate('+parseInt(completed/interviews.length*factor*100)+'deg)'}
			}
		
		};
		
		/*get transform*/
		$scope.getCompletedInterviews = function(interviews){
			var completed = 0;
			angular.forEach(interviews,function(interview){
				if(interview.status ==='complete'){
					completed++;
				}
			});
			if(completed===0){
				return 'No';
			}else{
				return completed+'/'+interviews.length;
			}
		};
		
		//Score Popup
		$scope.calculate = function(score){
			$scope.$parent.selectedConduct = score;
			$scope.$parent.popup = 'score';
		};
		
		/*View Full Profile*/
		$scope.viewFullProfile = function(){
			$scope.showFullProfile = true;
			$scope.pageUrl = 'partials/InterviewConduct_ViewProfile.html';
		};
		
		/*Hide Full Profile*/
		$scope.hideFullProfile = function(){
			$scope.showFullProfile = false;
			$scope.pageUrl = '';
		};

	}
);