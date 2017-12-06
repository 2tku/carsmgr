angular.module('AppModule', ['ngRoute', 'ngResource', 'ngAnimate', 'ngSanitize', 'ui.bootstrap'])
.run(function($rootScope) {
    $rootScope.dateOptions = {
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };
    
    
    $rootScope.altInputFormats = ['M!/d!/yyyy'];
    $rootScope.dateTimeFormat = 'dd/MM/yyyy';
    
    $rootScope.lstOwnOrg = ['Nội bộ', 'Bên ngoài'];
    $rootScope.lstProcessType =  ['SCN', 'SCC'];
})
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
        this.tasks = Tasks.query();

        this.showAddNew = function() {
            $location.url('/add');
        }
    }
])
// create the controller and inject Angular's $scope
.controller("TaskEditCtrl", ['$scope', '$rootScope', '$routeParams', 'Tasks', '$location',
    function ($scope, $rootScope, $routeParams, Tasks, $location) {
        /* config datetime picker [ */
        this.dateOptions = $rootScope.dateOptions;
        this.altInputFormats = $rootScope.altInputFormats;
        this.dateTimeFormat = $rootScope.dateTimeFormat;
        this.lstOwnOrg = $rootScope.lstOwnOrg;
        this.lstProcessType =  $rootScope.lstProcessType;

        this.open1 = () => {this.popup1.opened = true;};
        this.popup1 = {opened: false};

        this.open2 = () => {this.popup2.opened = true;};
        this.popup2 = {opened: false};

        this.open3 = () => {this.popup3.opened = true;};
        this.popup3 = {opened: false};
        /*] config datetime picker  */

        this.editTask = Tasks.get({id: $routeParams.id });
        this.currentDate = new Date();

        console.log('edit task: ');
        console.log(this.editTask);
        console.log(this.currentDate);

        this.addAssignStaff = function(){
            if (this.editTask.assign_staffs.length <= 4) {
                this.editTask.assign_staffs.push({staff: '', begin_time: new Date(), end_time : null, task_content: ''});
            }
        }

        this.deleteAssignStaff = function(index) {
            this.editTask.assign_staffs.splice(index, 1)
        }

        this.save = function() {
            if(!this.editTask) return;
            console.log('begin edit task ----');

            Tasks.update({id: this.editTask._id}, this.editTask);
            $location.url('/view');
        }

        this.cancel = function() {
            $location.url('/view');
        }
    }
])
.controller("TaskAddCtrl", ['$scope', '$rootScope', '$routeParams', 'Tasks', '$location',
    function ($scope, $rootScope, $routeParams, Tasks, $location) {
        /* config datetime picker [ */

        this.dateOptions = $rootScope.dateOptions;
        this.altInputFormats = $rootScope.altInputFormats;
        this.dateTimeFormat = $rootScope.dateTimeFormat;
        this.lstOwnOrg = $rootScope.lstOwnOrg;
        this.lstProcessType =  $rootScope.lstProcessType;

        this.open1 = () => {this.popup1.opened = true;};
        this.popup1 = {opened: false};

        this.open2 = () => {this.popup2.opened = true;};
        this.popup2 = {opened: false};

        this.open3 = () => {this.popup3.opened = true;};
        this.popup3 = {opened: false};
        /*] config datetime picker  */

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
        .when('/edit/:id', {
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
        /*.otherwise({
            redirectTo: '/view'
        })*/;
}]);