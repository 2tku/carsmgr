var app = angular.module("AppModule", ["ngRoute", "MyLoginModule"]);

// configure our routes
app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl : 'login.html',
            controller  : 'AppCtrl'
        })
        // .when('/edit', {
        //     templateUrl : 'edit.html',
        //     controller  : 'AppCtrl'
        // })
        .when('/view', {
            templateUrl : 'view.html',
            controller  : 'AppCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
});

// create the controller and inject Angular's $scope
app.controller("AppCtrl", function () {});