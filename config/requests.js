
var User = require('../app/models/user')
	, Cause = require('../app/models/cause')
	, Ngo = require('../app/models/ngo');
	
var cookie = require('cookie'), signature = require('cookie-signature');
var mongoose = require('mongoose');

var secret = 'with a little help from my friends';

module.exports = function(io, app, store){

	io.sockets.on('connection', function(socket){
		//make user on-line..
		if(socket.handshake && socket.handshake.headers && socket.handshake.headers.cookie){
			var raw = cookie.parse(socket.handshake.headers.cookie)['maoNaMassa'];
			if(raw){
				socket.sessionId = signature.unsign(raw.slice(2), secret) || undefined;
			}
		}
		if (socket.sessionId) {
			store.get(socket.sessionId, function(err, session) {
				if(typeof session !== 'undefined'){
					var uid = session.passport.user;
					socket.uid = uid;
					User.setOnline(uid, function(err, user){
						io.sockets.emit('userStatusUpdate', {id:user._id, isOnline: user.isOnline, lastLoginDate: user.lastLoginDate});
					});
				}
			});
		}
		socket.on('disconnect', function(){
			//make user off line...
			if (socket.uid) {
				User.setOffline(socket.uid, function(err, user){
					io.sockets.emit('userStatusUpdate', {id:user._id, isOnline: user.isOnline, lastLoginDate: user.lastLoginDate});
				});
			}
		});
	});

		
	/*API CALLS*/
	
	app.get('/api/userInfo/me/', function(req, res){
		if(typeof req.user === 'undefined')
		{
			res.send(404);
			return;
		}
		res.send({fullName: req.user.fullName, id: req.user._id, isAdmin: req.user.isAdmin, ngo: req.user.ngo});
	});

	app.get('/api/admin/usersList', function(req, res){
		User.getAll(function(err, users){
			res.send(users);
		});
	});
	
	app.post('/api/admin/newUser', function(req, res){
		var newUser = req.body;
		User.createNew(newUser, function(err, users){
			res.send(users);
		});
	});
	
	
	app.post('/api/admin/editUser', function(req, res){
		var user = req.body;
		var id = user._id;
		delete user._id;
		User.updateUser(id,user, function(err, user){
				var result = {
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					phone: user.phone,
					isAdmin: user.isAdmin,
					isOnline: user.isOnline,
					lastLoginDate: user.lastLoginDate,
					ngo: user.ngo
					}
				if(err) {
					res.status(502).send('An error occurred');
					return;
					}
				res.send(result);
			});
	});
	

	app.get('/api/getCauses?', function(req, res){
		var ngo = req.query.ngo;
		if(!req.user.isAdmin){
			if(typeof ngo === 'undefined') {
				res.send(404);
				return;
			}
			Cause.getAllNgo(id, function(err, causes){
				if(err) {
					res.status(502).send('An error occurred');
					return;
					}
				res.send(causes);
			});
		}else if(req.user.isAdmin){
			Cause.getAll(function(err, causes){
				if(err) {
					res.status(502).send('An error occurred');
					return;
					}
				res.send(causes);
			});
		}
		
	});
	
	app.post('/api/admin/resetUserPassword', function(req,res){
		var id = req.body._id;
		User.resetPassport(id, function(err, user){
			if(err) {
				res.status(502).send('An error occurred');
				return;
			}
			res.send(200);
		});	
	});
	
	app.get('/api/admin/getNgosList', function(req,res){
		Ngo.getAll(function(err, docs){
			if(err){
				res.status(502).send('An error occurred');
				return;
			}
			res.send(docs);
		});
	});

	app.post('/api/admin/newNgo', function(req, res){
		var ngo = req.body;
		Ngo.addNew(ngo, function(err, ngo){
			if(err) {
				res.status(502).send('An error occurred');
				return;
			}
			res.send(ngo);
			io.sockets.emit('newNgo', ngo);
		});
			
	});
	
	app.get('/api/admin/ngoTypeAhead/?', function(req, res){
		var q = req.q;
		Ngo.getForTypeAhead(q, function(err, docs){
			if(err){
				res.send([]);
				return;
			}
			res.send(docs);
		});
	});
	
	app.get('/api/getNgo/', function(req, res){
		var id = req.query.id;
		Ngo.getById(id, function(err, doc){
			if(err){
				res.status(502).send('An error occurred');
				return;
			}
			res.send(doc);
		});
	})
	
	app.get('/api/getNgoCauses/', function(req, res){
		var id = req.query.id;
		Cause.getAllNgo(id, function(err, doc){
			if(err){
				res.status(502).send('An error occurred');
				return;
			}
			res.send(doc);
		});
	});
	
	app.get('/api/closeCause/', function(req, res){
		var id = req.query.id;
		Cause.closeCause(id, function(err, doc){
			if(err){
				res.status(502).send('An error occurred');
				return;
			}
			res.send(doc);
		});
	});
	
	app.post('/api/admin/editNgo', function(req, res){
		var ngo = req.body;
		Ngo.updateNgo(ngo, function(err, doc){
			if(err){
				res.status(502).send('An error occurred');
				return;
			}
			res.send(doc);
		});
	});
	
	app.post('/api/newCause', function(req, res){
		var cause = req.body;
		cause.creator = req.user._id;
		Cause.addNew(cause, function(err, doc){
			if(err){
				res.status(502).send('An error occurred');
				return;
			}
			res.send(doc);
		});
	});

	
	function isObjectId(id){
		return mongoose.Types.ObjectId.isValid(id);
	};
	
	

};