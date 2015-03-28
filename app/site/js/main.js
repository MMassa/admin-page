

var app = angular.module('app',['ngRoute', 'ui.bootstrap','angularMoment', 'xeditable', 'readMore','toaster'], function($httpProvider){
	var interceptor = ['$q', function($q){
		function success(res){
			return res;
		}
		function error(res){
			var status = res.status;
			if(status == 401){
				window.location = '/';
				return;
			}
			return $q.reject(res);
		}
		
		return function(promisse){
			return promisse.then(success, error);
		}
	}];
	$httpProvider.responseInterceptors.push(interceptor);
});



app.run(['$rootScope', '$location', '$window', '$http','socket', '$modal','amMoment','editableOptions', function($rootScope, $location, $window, $http,socket, $modal, amMoment, editableOptions){
	
	$rootScope.usersList = [];
	$rootScope.today = new Date();
	$rootScope.homeActive = true;
	
	$rootScope.user = {};
	$rootScope.alert = {message: '', show: false, type: ''};
	
	editableOptions.theme='bs3'
	
	$rootScope.go = function(path){
		if(path === 'back')
		{
			$window.history.back();
		}
		else{
			$location.path(path);
		}
	};
	
	$http.get('/api/userInfo/me/').success(function(res){
		if(typeof res.fullName !== 'undefined'){
			$rootScope.user = res;
		}
	})
	.error(function(){return;});
	
	$http.get('/api/admin/usersList').success(function(res){
		console.log(res);
		if(typeof res[0] !== 'undefined'){
			
			$rootScope.usersList = res;
		}
	})
	.error(function(){return;});
	
	socket.on('userStatusUpdate', function(data){
		angular.forEach($rootScope.usersList, function(item){
			if(item.id == data.id)
			{
				item.isOnline = data.isOnline;
				item.lastLoginDate = data.lastLoginDate;
			}
		});
	});
	
	
	
	$rootScope.$on('$routeChangeSuccess', function(){
		//navBar change...
		var path = $location.path();
		
		if(path.indexOf('index') > 0)
		{
			$rootScope.homeActive = true;
			$rootScope.ngo = false;
			$rootScope.causes = false;
			$rootScope.admin = false;
		}
		else if(path.indexOf('ngo') > 0)
		{
			$rootScope.homeActive = false;
			$rootScope.ngo = true;
			$rootScope.causes = false;
			$rootScope.admin = false;
		}
		else if(path.indexOf('admin') > 0)
		{
			$rootScope.homeActive = false;
			$rootScope.ngo = false;
			$rootScope.causes = false;
			$rootScope.admin = true;
		}
		else if(path.indexOf('causes') > 0)
		{
			$rootScope.homeActive = false;
			$rootScope.ngo = false;
			$rootScope.causes = true;
			$rootScope.admin = false;
		}
		else{
			$rootScope.homeActive = true;
			$rootScope.ngo = false;
			$rootScope.causes = false;
			$rootScope.admin = false;
		}
		
	});
	
}]);

app.config(['$routeProvider', function ($routeProvider) {
		
		$routeProvider
			.when('/index', {
				templateUrl: 'Index.html',
				controller: 'userDashBoardController'
			})
			.when('/ngos', {
				templateUrl: 'site/pages/ngos.html',
				controller: 'ngosController'
			})
			.when('/ngo/:id', {
				templateUrl: 'site/pages/ngo.html',
				controller: 'ngoController'
			})
			.when('/causes',{
				templateUrl:'site/pages/causes.html',
				controller: 'causesController'
			})
			.when('/admin',{
				templateUrl:'site/pages/admin.html',
				controller: 'adminPageController'
			})
			.otherwise({
			   templateUrl: 'Index.html',
			   controller: 'userDashBoardController'
			});
}]);

app.directive('validNumber', function() {
  return {
    require: '?ngModel',
    link: function(scope, element, attrs, ngModelCtrl) {
      if(!ngModelCtrl) {
        return; 
      }

      ngModelCtrl.$parsers.push(function(val) {
        var clean = val.replace( /[^0-9]+/g, '');
        if (val !== clean) {
          ngModelCtrl.$setViewValue(clean);
          ngModelCtrl.$render();
        }
        return clean;
      });

      element.bind('keypress', function(event) {
        if(event.keyCode === 32) {
          event.preventDefault();
        }
      });
    }
  };
});

app.factory('socket', function($rootScope){
	var socket = io.connect();
	return{
		on: function(eventName, callback) {
			socket.on(eventName, function(){
				var args = arguments;
				$rootScope.$apply(function(){
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback){
			socket.emit(eventName, data, function(){
				var args = arguments;
				$rootScope.$apply(function(){
					if(callback){
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});

app.controller('navBarController', function($scope, $rootScope, $modal, $http){
	
	$scope.logout = function(){
		var modalInstante = $modal.open({
			templateUrl:'loginConfirmScreen.html',
			controller: 'logoutScreenController',
			size:'sm'
		});
	};
	
	$scope.changePassword = function(){
		var modalInstante = $modal.open({
			templateUrl:'changePasswordScreen.html',
			controller: 'changePassController',
			size:'sm'
		});
	};
});

app.controller('changePassController', function($scope, $modalInstance, $http, $rootScope, toaster){
	$scope.alert = {show:false, message:''};
	$scope.form = {};
	
	$scope.cancel = function(){
		$modalInstance.dismiss('');
	};
	
	$scope.save = function(){
		$scope.alert.show = false;
		if($scope.form.oldPassword == '')
		{
			toaster.pop('warning', "Erro", "Preencha senha antiga");
			return;
		}
		if(($scope.form.oldPassword == $scope.form.newPassword) || typeof $scope.form.oldPassword === 'undefined')
		{
			toaster.pop('warning', "Erro", "Senha nova deve ser diferente da atual");
			return;
		}
		if(($scope.form.newPassword == $scope.form.confirmPassword) && typeof $scope.form.newPassword !== 'undefined')
		{
			$http.post('/changePassword', {oldPass: $scope.form.oldPassword, newPass: $scope.form.newPassword})
			.success(function(res){
				toaster.pop('success', "Sucesso", "Senha alterada com sucesso");
				$modalInstance.close('');
			})
			.error(function(res){
				toaster.pop('danger', "Error", "Ocorreu um erro ao alerar senha");
			});
		}
		else
		{
			toaster.pop('warning', "Erro", "Senha nova e confirmação são diferentes");
		}
	};
});

app.controller('logoutScreenController', function($scope, $modalInstance, $http, toaster){
	
	$scope.cancel = function(){
		$modalInstance.dismiss('');
	};
	
	$scope.logout = function(){
		$http.get('/logout').success(function(res){
			window.location = '/';
		})
		.error(function(res){
			toaster.pop('danger', "Erro", "Ocorreu um erro ao realizar logout");
			$modalInstance.close('');
		});
	};
});

app.controller('userDashBoardController', function($rootScope, $scope, $http, $modal, socket, toaster){
	$scope.causes = [];
	var ngo = $rootScope.user.ngo;
	
	/*$scope.updateDashboard = function(){
		$http.get('/api/getCauses?ngo=' +ngo)
		.success(function(res){
			$scope.causes = res;
		})
		.error(function(){
			toaster.pop('danger', "Erro", "Ocorreu um erro ao buscar causas");
			return;
		});
	}
	
	socket.on('newNgoCause'+ ngo, function(data){
				$scope.causes.unshift(data);
			});
	
	$scope.updateDashboard();*/
	
});

app.controller('adminPageController', function($scope, socket, $http, $rootScope, $modal, toaster){
	$scope.newUser = {};
	$scope.ngos = [];
	$scope.newUser.isAdmin = false;
	$scope.isCreatingUser=false;
	
	$http.get('/api/admin/getNgosList')
		.success(function(res){
			$scope.ngos = res;
		});
	
	$scope.createNewUser = function(){
		$scope.isCreatingUser=true;
		$http.post('/api/admin/createNewUser', angular.toJson($scope.newUser))
		.success(function(res){
			toaster.pop('info', "Usuário Criado", "Novo usuário criado com sucesso");
			
		})
		.error(function(res){
			toaster.pop('danger', "Erro", "Erro ao criar novo usuário");
			$scope.newUser = {};
		})
		.then(function(){
			$scope.isCreatingUser=false;
		})
	};
	
	$scope.editUser = function(user){
		var modalInstance = $modal.open({
			templateUrl:'editUserScreen.html',
			controller: 'editUserController',
			resolve: {
				user: function(){
					return JSON.parse(angular.toJson(user));
				},
				ngos: function(){
					return JSON.parse(angular.toJson($scope.ngos));
				}
			}
		});
		
		modalInstance.result.then(function(user){
			console.log(user);
			for(var i=0; i< $rootScope.usersList.length; i++){
				if($rootScope.usersList[i].id == user.id){
					$rootScope.usersList[i] = user;
				}
			}
		});
	}
	
	$scope.resetUserPassword = function(id, user){
		var check = confirm('Reset '+user+' password?');
		if(check){
			$http.post('/api/admin/resetUserPassword', {_id: id})
			.success(function(res){
				toaster.pop('info', "Sucesso", "Senha resetada com sucesso");
				
			})
			.error(function(res){
				toaster.pop('danger', "Erro", "Erro ao resetar senha");
			});
		}
	}
});

app.controller('editUserController', function($scope, $rootScope, $modalInstance, user, ngos, $http, toaster){
	$scope.user = user;
	$scope.ngos = ngos;
	
	$scope.saveEditUser = function(){
		$http.post('/api/admin/editUser', angular.toJson($scope.user))
			.success(function(res){
				$modalInstance.close(res);
				toaster.pop('success', "Sucesso", "Usuário editado");
			})
			.error(function(res){
				toaster.pop('danger', "Erro", "Erro ao editar usuário");
			});
	};
	
	$scope.cancelEditUser = function(){
		$modalInstance.dismiss('');
	};
	
});

app.controller('ngosController', function($scope, $modal, socket, $http, $rootScope, toaster){
	
	$scope.ngos = [];
	
	$scope.newNgo = function(){
		var modalInstante = $modal.open({
			templateUrl:'newNgoScreen.html',
			controller: 'newNgoController'
		});
	};
	
	socket.on('newNgo', function(item){
		$scope.ngos.push(item);
	});
	
	$scope.update = function(){
		$http.get('/api/admin/getNgosList')
			.success(function(res){
				$scope.ngos = res;
			})
			.error(function(res){
				toaster.pop('danger', "Erro", "Erro ao buscar Instituições");
			});
	};
	
	$scope.update();

});

app.controller('newNgoController', function($scope, $rootScope, $modalInstance, $http, toaster){
	$scope.ngo = {};
	$scope.isCreating = false;
	$scope.insertNewNgo = function(){
		$scope.isCreating = true;
		var newNgo = {};
			newNgo = JSON.parse(angular.toJson($scope.ngo));
	
		$http.post('/api/admin/newNgo', newNgo)
			.success(function(res){
				toaster.pop('sucess', "Criada", "Instituição criada com sucesso");
				
			})
			.error(function(res){
				toaster.pop('danger', "Erro", "Erro ao criar nova Instituição");
			})
			.then(function(){
				$modalInstance.close();
			});
	};
	
	$scope.cancel = function(){
		$modalInstance.dismiss('cancel');
	};
	
	$scope.getLocation = function(val){
		return $http.get('http://maps.googleapis.com/maps/api/geocode/json',{
			params: {
				address: val,
				sensor: false
			}
		}).then(function(res){
			var addresses = [];
			angular.forEach(res.data.results, function(item){
				addresses.push(item);
			});
			return addresses;
		});
	};
	
	$scope.onUserSelectLocation = function(item, model, label){
		for(i=0; i<item.address_components.length; i++)
		{
			var component = item.address_components[i];
			var gType = component.types[0];
			
			if (gType == 'route')
			{
				$scope.ngo.location.address = component.long_name;
			}
			else if(gType == 'street_number')
			{
				$scope.ngo.location.streetNumber = component.long_name;
			}
			else if(gType == 'neighborhood')
			{
				$scope.ngo.location.neighborhood = component.long_name;
			}
			else if(gType == 'administrative_area_level_2' || gType == 'locality' )
			{
				$scope.ngo.location.city = component.long_name;
			}
			else if (gType == 'administrative_area_level_1')
			{
				$scope.ngo.location.state = component.long_name;
			}
			else if (gType == 'country')
			{
				$scope.ngo.location.country = component.long_name;
			}
			else if (gType == 'postal_code')
			{
				$scope.ngo.location.zip = component.long_name;
			}
		}
	};
	
});

app.controller('ngoController', function($scope, $rootScope, $routeParams, $modal, socket, $http, toaster){
	
	$scope.causes = [];
	$scope.ngo = {};

	$http.get('/api/getNgo/?id='+$routeParams.id)
	.success(function(res){
		$scope.ngo = res;
	})
	.error(function(res){
		toaster.pop('danger', "Erro", "Erro buscando detalhes da Instituição");
	});
	
	$http.get('/api/getNgoCauses/?id='+$routeParams.id)
	.success(function(res){
		$scope.causes = res;
	})
	.error(function(res){
		toaster.pop('danger', "Erro", "Erro buscando ações da Instituição");
	});
	
	$scope.editNGO = function(){
		var modalInstance = $modal.open({
			templateUrl:'ediNgoScreen.html',
			controller: 'ediNgoScreenController',
			resolve: {
				ngo: function(){
					return JSON.parse(angular.toJson($scope.ngo));
				}
			}
		});
		modalInstance.result.then(function(updatedNgo){
			$scope.ngo = updatedNgo;
		});
	};
	
	$scope.addCause = function(){
		var modalInstance = $modal.open({
			templateUrl:'newCause.html',
			controller: 'newCauseController',
			size:'lg',
			resolve: {
				ngoId: function(){
					return $scope.ngo._id;
				}
			}
		});
		modalInstance.result.then(function(res){
			$scope.causes.push(res);
		});
	}
	
	$scope.closeCause = function(id){
		$http.get('/api/closeCause/?id='+id)
			.success(function(res){
				var result = [];
				angular.forEach($scope.causes, function(cause){
					if(cause._id.toString() == res._id.toString())
					{
						cause = res;
					}
					result.push(cause);
				});
				$scope.causes = result;
				toaster.pop('success', "Fechada", "Ação fechada com sucesso");
			});
	}
	
});


app.controller('ediNgoScreenController', function($scope,$rootScope, $modalInstance, $http, ngo, toaster){
	$scope.ngo = ngo;
	$scope.ngoStatus = ["Ativa", "Inativa"];
	$scope.isSaving = false;
		
	$scope.saveEditNgo = function(){
		$scope.isSaving = true;
		$http.post('/api/admin/editNgo',JSON.parse(angular.toJson($scope.ngo)))
			.success(function(res){
				$modalInstance.close(res);
				toaster.pop('success', "Editada", "Instituição editada com sucesso");
			})
			.error(function(res){
				toaster.pop('danger', "Erro", "Erro editando Instituição");
				$modalInstance.dismiss('error');
			});
	};
	
	$scope.cancelEditNgo = function(){
		$modalInstance.dismiss('cancel');
	};
	
});

app.controller('newCauseController', function($scope, $rootScope, $modalInstance, $http, ngoId, toaster){
	$scope.cause ={};
	$scope.cause.ngo = ngoId;
	$scope.creating = false;
	
	$scope.addCause = function(){
		$scope.creating = true;
		$scope.cause.tags = $scope.cause.tags.split(',');
        $http.post('/api/newCause',angular.toJson($scope.cause))
			.success(function(res){
				toaster.pop('info', "Criada", "Ação criada com sucesso");
				$modalInstance.close(res);
			})
			.error(function(res){
				toaster.pop('danger', "Erro", "Erro criando nova Ação");
			});
		};
	
	$scope.cancelAddCause = function(){
		$modalInstance.dismiss('cancel');
	};
	
});

app.controller('causesController', function($scope, $http){
	$scope.causes = [];
	
	$http.get('')
		.success(function(res){
			$scope.causes = res;
		})
	
});



angular.module('ng').filter('tel', function () {
    return function (tel) {
        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '').replace(/\s/g,'');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 10:
                city = value.slice(0, 2);
                number = value.slice(2);
				number = number.slice(0,4) + '-' + number.slice(4,8);
				return ("(" + city + ") " + number).trim();
                break;
			case 11:
                city = value.slice(0, 2);
                number = value.slice(2);
				number = number.slice(0, 1) + '-' + number.slice(1,5) + '-' + number.slice(5,9);
				return ("(" + city + ") " + number).trim();
                break;
			case 12:
				country = value.slice(0,2)
				city = value.slice(2, 4);
                number = value.slice(4);
				number = number.slice(0,4) + '-' + number.slice(4,8);
				return ('+'+country+" (" + city + ") " + number).trim();
			
			case 13:
				country = value.slice(0,2)
				city = value.slice(2, 4);
                number = value.slice(4);
				number = number.slice(0, 1) + '-' + number.slice(1,5) + '-' + number.slice(5,9);
				return ('+'+country+" (" + city + ") " + number).trim();

				default:
                return tel;
        }
        number = number.slice(0, 1) + '-' + number.slice(1,5) + '-' + number.slice(5,9);
    };
});






















