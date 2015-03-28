/*Mão na Massa Admin*/

	//DEPENDENCIES
	var express = require('express'); 
	var fs = require('fs');
	var path = require('path');
	var cookieParser = require('cookie-parser'), bodyParser = require('body-parser'), session = require('express-session'); //express middle-ware
	var passport = require('passport');
	var mongoose = require('mongoose'); //used to authenticate at first.. TODO: replace the mongodb framework dor this
	var flash = require('connect-flash');
	
	var MemoryStore = session.MemoryStore;
	
	mongoose.connect('mongodb://127.0.0.1:27017/maonamassa');
	
	var models_dir = __dirname + '/app/models';
		fs.readdirSync(models_dir).forEach(function (file) {
		if(file[0] === '.') return; 
		require(models_dir+'/'+ file);
	});
	
	require('./config/passport')(passport);
	
	var app = express();
	
	app.set('title','Mao na Massa Admin');
	//definir as views...
	app.set('views', path.join(__dirname, 'app/site/pages'));
	app.engine('html', require('ejs').renderFile);
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	
	var store = new MemoryStore();
	app.use(session({
		name:'maoNaMassa',
		store: store,
		secret: 'with a little help from my friends',
		saveUninitialized: true,
		resave:true
	}));
	
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());
	
	/*Handlers para request que necessitam login, devem vir antes da definição do diretório a ser validado*/
	
	app.all('/site/pages/admin.html', function(req, res, next){
		if(req.isAuthenticated() && req.user.isAdmin)
		{
			next();
		}
		else
		{
			res.send(401);
		}
	});
	
	app.all('/site/*', function(req, res, next){
		if(req.isAuthenticated())
		{
			next();
		}
		else
		{
			res.send(401);
		}
	});
	
	app.all('/api/*', function(req, res, next){
		if(req.path.indexOf('admin') > 0 && !req.user.isAdmin)
		{
			res.send(401); //requests that need admin user
			return;
		}
		if(req.isAuthenticated())
		{
			next();
		}
		else
		{
			res.send(401);
		}
	}); 
	
	app.use(express.static(path.join(__dirname, '/app/public')));
	app.use('/site', express.static(path.join(__dirname, '/app/site')));
	
	require('./config/routes')(app, passport);
	
	/*CREATING THE SERVER*/
	
	var server = require('http').createServer(app),
		io = require('socket.io').listen(server, {log:false});
	
	require('./config/requests')(io, app, store);
	
	server.listen(8080, function(){
			console.log('server up and listening on 8080');
	}); //Sobe o servidor na porta especificada.. se mudar a porta aqui tem que mudar no client o source do socket.io pra mesma porta (todo: integrar no config)
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	