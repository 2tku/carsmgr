angular.module('AppModule', 
    ['ngRoute', 'ngResource', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngFileSaver', 'ngMaterial', 'ngMessages', 'material.svgAssetsCache']
)
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
.config(function ($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
        return !date ? '' : moment(date).format('DD/MM/YYYY');
    };
    
    $mdDateLocaleProvider.parseDate = function(dateString) {
        var m = moment(dateString, 'DD/MM/YYYY', true);
        return m.isValid() ? m.toDate() : new Date(NaN);
    };
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
.controller("ChangePassCtrl", ['$scope', '$location', '$http', 
function ($scope, $location, $http) {
    this.userName = '';
    this.oldPass = '';
    this.newPass = '';
    this.confirmPass = this.newPass;
    this.isError = false;
    this.errorMsg = '';

    this.init = function(strAuthenMsg) {
        var info = JSON.parse(strAuthenMsg);

        if (info.success && info.success != '') {
            this.isError = false;
            this.errorMsg = '';
        } else if (info.error && info.error != '') {
            this.isError = true;
            this.errorMsg = info.error;
        }
    }

    this.changePass = function() {
		if (this.userName === '' || this.oldPass === '' || this.newPass === '') {
            this.errorMsg = 'Tên đăng nhập hoặc mật khẩu cũ/mới không được trống';
            this.isError = true;
        } else if (this.userName.trim().length < 5) {
            this.errorMsg = 'Mã người dùng phải >= 5 ký tự';
            this.isError = true;
        } else if (this.newPass != this.confirmPass) {
            this.errorMsg = 'Mật khẩu mới không khớp';
            this.isError = true;
        } else {
            var thisTmp = this;
            var userInfo = {
                'username':this.userName.trim(), 
                'password':this.oldPass,
                'newPass':this.newPass
            };
            
            $http.post('/authen/change-pass', userInfo)
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
.controller("TasksViewCtrl", ['$scope', '$routeParams', 'Tasks', '$location', '$http','FileSaver', 'Blob', 
    function ($scope, $routeParams, Tasks, $location, $http, FileSaver, Blob) {
        // tim kiem [
        this.searchCondition = {
            completeDate: null,
            //createDateFrom: moment(new Date()).startOf('hour').subtract(1, 'days').toDate(), 
            createDateFrom: null,
            createDateTo: null,
            user: '', 
            vehicle: '',
            isNotComplete: true};
        //]
        this.isCheckAll = false;
        this.editing = [];
        // load mac dinh 
        this.tasks = Tasks.query(this.searchCondition);

        this.checkAll = function () {
            for(var i = 0 ;i < this.tasks.length; i ++) {
                this.editing[i] = this.isCheckAll;
            }
        }

        this.showAddNew = function() {
            $location.url('/add');
        }

        /*this.checkRemove = function(index) {
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
            /*if ((this.searchCondition.vehicle != null && this.searchCondition.vehicle != '') 
                || (this.searchCondition.completeDate!=null)
                || (this.searchCondition.createDateFrom != null)
                || (this.searchCondition.createDateTo != null)
                || (this.searchCondition.user != null && this.searchCondition.user != '')
                || (this.searchCondition.isNotComplete == true)
            ){
                this.tasks = Tasks.query(this.searchCondition);
            } else {
                this.tasks = Tasks.query();
            }*/

            this.tasks = Tasks.query(this.searchCondition);
        }

        this.exportExcel = function (uri) {
            $http.get('/export', {params : this.searchCondition, responseType: "arraybuffer"})
            .then(
                function(response) {
                    var defaultFileName = 'tasks.xlsx';

                    var downloadType = response.headers('Content-Type');
                    var disposition = response.headers('Content-Disposition');
                    if (disposition) {
                        var match = disposition.match(/.*filename=\"?([^;\"]+)\"?.*/);

                        if (match[1]) defaultFileName = match[1];
                    }

                    defaultFileName = defaultFileName.replace(/[<>:"\/\\|?*]+/g, '_');

                    var blob = new Blob([response.data], { type: downloadType });
                    FileSaver.saveAs(blob, defaultFileName);
                }
                , function(response) {
                    console.log('Download error');
                    console.log(response);
            });
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

        this.isError = false;
        this.errorMsg = '';

        this.addAssignStaff = function(){
            if (this.editTask.assign_staffs.length <= 4) {
                this.editTask.assign_staffs.push({staff: '', begin_time: new Date(), end_time : null, task_content: ''});
            }
        }

        this.deleteAssignStaff = function(index) {
            this.editTask.assign_staffs.splice(index, 1)
        }

        this.newMaterial = function(chip) {
			return {
				name: chip
			}
		}

        // this.addMaterial = function(chip, index){
        //     if (this.editTask.material.length <= 5) {
        //         this.editTask.material.push({name: chip});
        //     }
        // }

        // this.removeMaterial = function(chip, index, event) {
        //     this.editTask.material.splice(index, 1)
        // }

        this.save = function() {
            if(!this.editTask) {
                this.isError = true;
                this.errorMsg = 'Không tồn tại nội dung công việc';

                return;
            }

            if(this.editTask.begin_time != null && this.editTask.end_time != null && this.editTask.begin_time > this.editTask.end_time) {
                this.isError = true;
                this.errorMsg = 'Thời gian bắt đầu không được lớn hơn ngày kết thúc thúc công việc';
                return;
            }

            // this.processType = SCN => reset;
            if (this.editTask.process_type == this.lstProcessType[0]) {
                this.editTask.estimates_date = null;
                this.editTask.done_percent = null;
            }

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
        this.note = '';
        this.estimatesDate = 0;
        this.donePercent = 0;

        this.fuel = 0;
        this.cost = 0;
        this.material = [];

        this.isError = false;
        this.errorMsg = '';

        this.save = function() {
            if(!this.vehicle || !this.createDate) {
                this.isError = true;
                this.errorMsg = 'Phương tiện hoặc ngày tạo không được trống';
                return;
            }

            if(this.beginTime != null && this.endTime != null 
                    && this.beginTime > this.endTime
            ) {
                this.isError = true;
                this.errorMsg = 'Thời gian bắt đầu không được lớn hơn ngày kết thúc thúc công việc';
                return;
            }

            // this.processType = SCN => reset;
            if (this.processType == this.lstProcessType[0]) {
                this.estimatesDate = null;
                this.donePercent = null;
            }

            var objMaterial = [];

            for(var i = this.material.length - 1 ;i >=0 ; i--) {
                // check have any value
                if(this.material[i]){
                    objMaterial.push({name: this.material[i]});
                }
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
                note                : this.note,
                estimates_date      : this.estimatesDate,
                done_percent        : this.donePercent,
                fuel                : this.fuel,
                cost                : this.cost,
                material            : objMaterial
            });

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

            var objMaterial = [];

            for(var i = this.material.length - 1 ;i >=0 ; i--) {
                // check have any value
                if(this.material[i]){
                    objMaterial.push({name: this.material[i]});
                }
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
                note                : this.note,
                fuel                : this.fuel,
                cost                : this.cost,
                material            : objMaterial
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
            this.notea = '';
            this.fuel = 0;
            this.cost = 0;
            this.material = [];
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
            templateUrl : '/userAdd.html',
            controller  : 'LoginCtrl'
        })
        .when('/changepass', {
            templateUrl : '/changePass.html',
            controller  : 'ChangePassCtrl'
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