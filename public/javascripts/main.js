angular.module('AppModule', ['ngRoute', 'ngResource'])
.factory('Tasks', ['$resource', function($resource){
        return $resource('/tasks/:id', null, {
            'update': { method:'PUT' }
        });
    }]
)
.controller('AppCtrl', ()=>{})
// create the controller and inject Angular's $scope
.controller("LoginCtrl", ['$scope', 'Tasks', '$location', function ($scope, Tasks, $location) {
    this.userName = 'admin';
    this.pass = 'admin';
    this.isError = false;
    this.errorMsg = '';

    this.login = function() {
		if(this.userName === '' || this.pass === ''){
            this.errorMsg = '[User name] or [password] is null or empty';
            this.isError = true;
        } else if (this.userName === 'admin' 
                && this.pass === 'admin') {
            // $rootScope.loggedUser = this.userName;
            this.isError = false;
            this.errorMsg = '';

            $location.url('/view');
        } else {
            this.errorMsg = 'Invalidate user name or password';
            this.isError = true;
        }
	}
}])
// create the controller and inject Angular's $scope
.controller("TasksViewCtrl", ['$scope', '$routeParams', 'Tasks', '$location',
    function ($scope, $routeParams, Tasks, $location) {
        $scope.tasks = Tasks.query();
    }
])
// create the controller and inject Angular's $scope
.controller("TaskEditCtrl", ['$scope', '$routeParams', 'Tasks', '$location',
    function ($scope, $routeParams, Tasks, $location) {

    }
])
// configure our routes
.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl : '/pageLogin.html',
            controller  : 'LoginCtrl'
        })
        .when('/edit', {
            templateUrl : '/taskEdit.html',
            controller  : 'TaskEditCtrl'
        })
        .when('/view', {
            templateUrl : '/tasksView.html',
            controller  : 'TasksViewCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);