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
.controller('AppCtrl', ()=>{
    this.logout = function () {

    }
})
// create the controller and inject Angular's $scope
.controller("LoginCtrl", ['$scope', '$location', '$http', function ($scope, $location, $http) {
    this.lstUserRoles = ['Nhân viên', 'Quản lý', 'ADMIN'];
    this.userName = '';
    this.fullName = '';
    this.userRole = this.lstUserRoles[0];
    this.pass = '';
    this.confirmPass = this.pass;
    this.isError = false;
    this.errorMsg = '';

    this.init = function(strAuthenMsg) {
        var info = JSON.parse(strAuthenMsg);
        console.log(info);

        if (info.success && info.success != '') {
            this.isError = false;
            this.errorMsg = '';
        } else if (info.error && info.error != '') {
            this.isError = true;
            this.errorMsg = info.error;
        }
    }

    this.signup = function() {
		if(this.userName === '' || this.pass === ''){
            this.errorMsg = 'Tên đăng nhập hoặc mật khẩu trống';
            this.isError = true;
        } else if (this.userName.trim().length < 5) {
            this.errorMsg = 'Mã người dùng >= 5 ký tự';
            this.isError = true;
        } else if (this.pass != this.confirmPass) {
            this.errorMsg = 'Mật khẩu không trùng';
            this.isError = true;
        } else {
            var thisTmp = this;
            var userInfo = {
                'username':this.userName.trim(), 
                'password':this.pass, 
                'fullName':this.fullName, 
                'roleUser':this.userRole};
            
            $http.post('/authen/local-reg', userInfo)
                .then(function(result) {
                    if (result.data.status == 'error') {
                        thisTmp.isError = true;
                        thisTmp.errorMsg = result.data.message;
                    } else if (result.data.status == 'success') {
                        thisTmp.isError = false;
                        thisTmp.errorMsg = '';

                        $location.url('/');
                    } else {
                        thisTmp.isError = false;
                        thisTmp.errorMsg = '';
                    }
                });
        }
	}
}])
// create the controller and inject Angular's $scope
.controller("TasksViewCtrl", ['$scope', '$routeParams', 'Tasks', '$location',
    function ($scope, $routeParams, Tasks, $location) {
        // tim kiem [
        this.searchUser = '';
        this.searchCompleteDate = null;
        this.searchVehicle = '';
        //]
        this.isCheckAll = false;
        this.editing = [];
        this.tasks = Tasks.query();

        this.checkAll = function () {
            console.log("this.isCheckAll");
            console.log(this.isCheckAll);

            for(var i = 0 ;i < this.tasks.length; i ++) {
                this.editing[i] = this.isCheckAll;
            }
        }

        this.showAddNew = function() {
            $location.url('/add');
        }

        /*this.checkRemove = function(index) {
            console.log('this.editing[index]');
            console.log(this.editing[index]);
            this.editing[index] = false;
        }*/

        this.removeTasks = function() {
            for(var i = this.tasks.length - 1 ;i >=0 ; i--) {
                if(this.editing[i] == true){
                    var task = this.tasks[i];
                    this.tasks.splice(i, 1);

                    Tasks.remove({id: task._id}, function(){});
                }
            }

            $location.url('/');
        }

        this.searchTasks = function() {
            var searchCondition = {completeDate:'', user:'', vehicle: ''};
            if (!this.searchCompleteDate) {
                searchCondition.completeDate = this.completeDate;
            } else {
                searchCondition.completeDate = new Date();
            }
            if (this.searchUser != '') {
                searchCondition.user = this.searchUser;
            }

            if (this.searchVehicle != '') {
                searchCondition.vehicle = this.searchVehicle;

                this.tasks = Tasks.query(searchCondition);
            } else {
                this.tasks = Tasks.query();
            }
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
            $location.url('/');
        }

        this.cancel = function() {
            $location.url('/');
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
        this.ownOrg = this.lstOwnOrg[0];
        this.processType = this.lstProcessType[0];
        this.tastContent = '';
        this.beginTime = new Date();
        this.endTime = null;
        this.taskRealHour = 0;
        this.waitMaterialHour = 0;
        this.km = 0;
        this.note = '';

        this.isError = false;
        this.errorMsg = '';

        this.save = function() {
            if(!this.vehicle || !this.createDate) {
                this.isError = true;
                this.errorMsg = 'Phương tiện hoặc ngày tạo không được trống';
                return;
            }

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
                $location.url('/');
            });
        }

        this.saveAndAdd = function() {
            if(!this.vehicle || !this.createDate) {
                this.isError = true;
                this.errorMsg = 'Phương tiện hoặc ngày tạo không được trống';
                return;
            }

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

            newTask.$save(function(){
                Tasks.query().push(newTask);
                $location.url('#!add');
            });

            this.createDate = new Date();
            this.vehicle = '';
            this.ownOrg = '';
            this.processType = null;
            this.tastContent = '';
            this.beginTime = new Date();
            this.endTime = null;
            this.taskRealHour = 0;
            this.waitMaterialHour = 0;
            this.km = 0;
            this.notea = '';
        }

        this.cancel = function() {
            $location.url('/');
        }
    }
])
// configure our routes
.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/adduser', {
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
        .when('/', {
            templateUrl : '/tasksView.html',
            controller  : 'TasksViewCtrl'
        })
        /*.otherwise({
            redirectTo: '/view'
        })*/;
}]);