var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/maonamassa');

var hash = require('./app/util/hash');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var BAD_LOGIN_STRING = 'Invalid username or password'

UserSchema = new Schema({
	firstName: {type: String, default:''},
	lastName: {type: String, default:''},
	ong: {type: ObjectId, ref:'ong'},
	email: String,
	salt: String,
	hash: String,
	isAdmin: Boolean,
	lastLoginDate: Date,
	isOnline: {type: Boolean, default: false},
	isActive: {type: Boolean, default: true}
});

UserSchema.statics.createNew = function(data, callback){
	var User = this;
	hash(data.password, function(err, salt, hash){
		if(err) throw err;
		User.create({
			email: data.email,
			salt:salt,
			hash: hash,
			firstName: data.firstName,
			lastName: data.lastName,
			ong: data.ong,
			isAdmin: data.isAdmin
		}, 
		callback);
	});
};

var User = mongoose.model('User', UserSchema);

User.createNew({
	email:'admin@maonamassa.net.br',
	password:'admin',
	firstName: 'admin',
	lastName:'',
	ong: null,
	isAdmin:true
	
}, function(err, user){
	if(err) console.log(err);
	else console.log('created');
})

