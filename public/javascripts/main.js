angular.module('AppModule', ['ngRoute', 'ngResource', 'ngAnimate', 'ngSanitize', 'ui.bootstrap'])
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

        this.showAddNew = function() {
            $location.url('/add');
        }
    }
])
// create the controller and inject Angular's $scope
.controller("TaskEditCtrl", ['$scope', '$routeParams', 'Tasks', '$location',
    function ($scope, $routeParams, Tasks, $location) {
        $scope.task = Tasks.get({id: $routeParams.id });

        console.log('edit task: ' + $scope.task);
        $scope.save = function() {
            if(!$scope.task) return;
            //var todo = new Todos({ name: $scope.newTodo, completed: false });

            $scope.task.$save(function(){
                Tasks.query().push($scope.task);
                $location.url('/view');
            });
        }

        $scope.cancel = function() {
            $scope.task = null;
            $location.url('/view');
        }
    }
])
.controller("TaskAddCtrl", ['$scope', '$routeParams', 'Tasks', '$location',
    function ($scope, $routeParams, Tasks, $location) {
        /* config datetime picker [ */
        this.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
        };

        this.open1 = () => {this.popup1.opened = true;};
        this.popup1 = {opened: false};

        this.open2 = () => {this.popup2.opened = true;};
        this.popup2 = {opened: false};

        this.open3 = () => {this.popup3.opened = true;};
        this.popup3 = {opened: false};

        this.altInputFormats = ['M!/d!/yyyy'];
        this.dateTimeFormat = 'dd/MM/yyyy';
        /*] config datetime picker  */

        this.lstOwnOrg = ['Nội bộ', 'Bên ngoài'];
        this.lstProcessType =  ['SCN', 'SCC'];

        this.createDate = new Date();
        this.vehicle = '';
        this.ownOrg = '';
        this.processType = '';
        this.tastContent = '';
        this.beginTime = new Date();
        this.endTime = null;
        this.taskRealHour = 0;
        this.waitMaterialHour = 0;
        this.km = 0;
        this.note = '';

        this.save = function() {
            if(!this.vehicle || !this.createDate) return;
            var newTask = new Tasks({ 
                create_date         : this.createDate,
                vehicle             : this.vehicle,
                own_org             : this.ownOrg,
                process_type        : this.processType,
                tast_content        : this.tastContent,
                begin_time          : this.beginTime,
                end_time            : this.endTime,
                task_real_hour      : this.taskRealHour,
                wait_material_hour  : this.waitMaterialHour,
                km                  : this.km,
                note                : this.note
            });

            console.log(newTask);
            newTask.$save(function(){
                Tasks.query().push(newTask);
                $location.url('/view');
            });
        }

        this.cancel = function() {
            $location.url('/view');
        }
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
        .when('/add', {
            templateUrl : '/taskAdd.html',
            controller  : 'TaskAddCtrl'
        })
        .when('/view', {
            templateUrl : '/tasksView.html',
            controller  : 'TasksViewCtrl'
        })
        .otherwise({
            redirectTo: '/view'
        });
}]);