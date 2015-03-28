var User = require('../app/models/user');
var Auth = require('./middlewares/authorization');
var express = require('express');
var path = require('path');



module.exports = function(app, passport){
	
	//CHECK IF IS LOGGED
	app.get('/', function(req, res, next){ //can use the new middleware
		if(req.isAuthenticated())
		{
			res.render('index.html');
		}else{
			res.redirect('/login');
		}
	});
	
	app.get('/login', function(req, res, next){
		res.render('login.html');
	});
	
	app.post('/login', function(req, res, next){
		passport.authenticate('local', function(err, user, info){
			if(err || !user){ return res.send(401)};
			req.logIn(user, function(err){
			if(err) res.send(500);
			return res.render('index.html');
			});
		})(req, res, next);
	});
	
	app.get('/logout', function(req,res){
		req.logout();
		res.render('login.html');
	});
	
};