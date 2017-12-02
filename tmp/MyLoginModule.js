var myLoginModule = angular.module("MyLoginModule", [])
    .controller("MyLoginCtrl", MyLoginCtrl);

function MyLoginCtrl($location) {
    this.helloworldMsg = "hello world";
    this.userName = 'admin';
    this.pass = 'admin';
    this.isError = false;
    this.errorMsg = '';

    this.login = function() {
		if(this.userName === '' || this.pass === ''){
            this.errorMsg = '[User name] or [password] is null or empty';
            this.isError = true;
		} else if (this.userName === 'admin' || this.pass === 'admin') {
            // $rootScope.loggedUser = this.userName;
            this.isError = false;
            this.errorMsg = '';

            //$location.path( "#!view" );
            window.location = "#!view";
        } else {
            this.errorMsg = 'Invalidate user name or password';
            this.isError = true;
        }
	}
}