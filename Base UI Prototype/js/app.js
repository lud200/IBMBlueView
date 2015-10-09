'use strict';

var app = angular.module('App',['ui.router','controllers','directives','filter','ngSanitize','ui.bootstrap','file-model','ngCookies']);

/*set Sanitization compile values*/
app.config(function($compileProvider){
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript|tel):/);
});

// Initialize the main module
app.run(['$rootScope', '$location', '$window', function ($rootScope,$location,$window) {
    $rootScope.location = $location;
    $rootScope.goto = function (path) {
        $rootScope.isExpand = false;
        if (path === 'back') { // Allow a 'back' keyword to go to previous page
            $window.history.back();
        }else { // Go to the specified path
            $location.path(path);
        }
    };
}]);

/*route provider*/
app.config(function($stateProvider, $urlRouterProvider){
        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("/login");


        /*states*/
        $stateProvider
            .state("login",{
                url: "/login",
                templateUrl: "partials/Login.html",
                controller:"loginCtrl"
            }).state("dashboard",{
                url: "/dashboard",
                templateUrl: "partials/Dashboard.html",
                controller:"dashboardCtrl"
            }).state("newCandidates",{
                url: "/newCandidates",
                templateUrl: "partials/NewCandidates.html",
                controller:"newCandidatesCtrl"
            }).state("candidates",{
                url: "/candidates",
                templateUrl: "partials/Candidates.html",
                controller:"candidatesCtrl"
            }).state("candidateInfo",{
                url: "/candidateInfo",
                templateUrl: "partials/CandidateInfo.html",
                controller:"candidateInfoCtrl"
            }).state("interviewResults",{
                url: "/interviewResults",
                templateUrl: "partials/InterviewResults.html",
                controller:"interviewResultsCtrl"
            }).state("interviewers",{
                url: "/interviewers",
                templateUrl: "partials/Interviewers.html",
                controller:"interviewersCtrl"
            }).state("interviewerInfo",{
                url: "/interviewerInfo",
                templateUrl: "partials/InterviewerInfo.html",
                controller:"interviewerInfoCtrl"
            }).state("editInterview",{
                url: "/editInterview",
                templateUrl: "partials/EditInterview.html",
                controller:"editInterviewCtrl"
            }).state("interviewerDashboard",{
                url: "/interviewerDashboard",
                templateUrl: "partials/InterviewerDashboard.html",
                controller:"interviewerDashboardCtrl"
            }).state("interviewRequests",{
                url: "/interviewRequests",
                templateUrl: "partials/InterviewRequests.html",
                controller:"interviewRequestsCtrl"
            }).state("interviewSchedule",{
                url: "/interviewSchedule",
                templateUrl: "partials/InterviewSchedule.html",
                controller:"interviewScheduleCtrl"
            }).state("interviewConduct",{
                url: "/interviewConduct",
                templateUrl: "partials/InterviewConduct.html",
                controller:"interviewConductCtrl"
            });
    }
);


/*highlightFilter*/
app.filter('highlightFilter', function() {
    return function(items,text) {
        var output=[];
        angular.forEach(items,function(item){
            if(item.name.toLowerCase().indexOf(text.toLowerCase()) > -1){
                var str = item.name;
                var regexp = new RegExp("(" + preg_quote( text ) + ")", 'gi');
                item.tempName = str.replace(regexp, '<strong>$1</strong>');
                output.push(item);
            }
        });
        return output;
    }
});

/*filterSidebarHighlight*/
app.filter('filterSidebarHighlight', function() {
    return function(items,text) {
        if(text===''){
            return [];
        }
        var output=[];
        angular.forEach(items,function(item){
            if(item.name.toLowerCase().indexOf(text.toLowerCase()) > -1){
                var str = item.name;
                var regexp = new RegExp("(" + preg_quote( text ) + ")", 'gi');
                item.tempName = str.replace(regexp, '<strong>$1</strong>');
                output.push(item);
            }
        });
        return output;
    }
});
/*statusFilter*/
app.filter('statusFilter', function() {
    return function(notifications,filter) {
        var output=[];
        angular.forEach(notifications,function(noti){
            if(filter[noti.status]){
                output.push(noti);
            }
        });
        return output;
    }
});
/*autoFocus*/
app.directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
            }, 0);
        }
    };
});