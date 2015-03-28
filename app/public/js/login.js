
var app = angular.module('app',[] );

app.controller('loginController', function($scope, $http, $window, $location){
	$scope.user = {};
	$scope.showError = false;
	$scope.errorMessage = '';
	
	$scope.login = function(){
		$scope.showError = false;
		$http.post('/login', angular.toJson($scope.user))
		.success(function(res){
			$window.location.href = '/#' + $location.path();
		})
		.error(function(res){
			console.log(res);
			if(res == 'Unauthorized'){
				$scope.showError = true;
				$scope.errorMessage = 'Invalid username or password';
			}
			else{
				$scope.showError = true;
				$scope.errorMessage = 'Internal Server Error';
			}
		});
	};
	
});

