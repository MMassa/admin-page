
var mongoose = require('mongoose');
var hash = require('../util/hash');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var BAD_LOGIN_STRING = 'Invalid username or password'

UserSchema = new Schema({
	firstName: String,
	lastName: String,
	ngo: {type: ObjectId, ref:'Ngo'},
	email: String,
	phone: String,
	salt: String,
	hash: String,
	isAdmin: Boolean,
	lastLoginDate: Date,
	isOnline: {type: Boolean, default: false},
	isActive: {type: Boolean, default: true}
});

UserSchema.virtual('fullName').get(function(){
	return this.firstName + ' ' +this.lastName;
	
});

UserSchema.statics.createNew = function(data, callback){
	var User = this;
	hash(data.password, function(err, salt, hash){
		if(err) throw err;
		User.create({
			email: data.email,
			phone: data.phone,
			salt:salt,
			hash: hash,
			firstName: data.firstName,
			lastName: data.lastName,
			ngo: data.ngo,
			isAdmin: data.isAdmin
		}, 
		callback);
	});
};

UserSchema.statics.isValidUserPassword = function(email, password, done){
	this.findOne({email:email, isActive: true}, function(err,user){
		if(err) return done(err);
		if(!user) return (done, false, {message: BAD_LOGIN_STRING});
		hash(password, user.salt, function(err, hash){
			if(err) return done(err);
			if(hash == user.hash) return done(null, user);
			done(null, false, {
				message: BAD_LOGIN_STRING
			});
		});
	});
};

UserSchema.statics.getAll = function(callback){
	//must be Admin
	this.find({}).select('firstName lastName email isAdmin isOnline lastLoginDate').populate('ngo','name').exec(callback);
};

UserSchema.statics.changePassword = function(id, newPass, callback){
	var User = this;
	hash(newPass, function(err, newSalt, newHash){
		User.findByIdAndUpdate(id, {salt: newSalt, hash: newHash}, callback);
	});
};

UserSchema.statics.resetPassport = function(id, callback){
	var User = this;
	newPass = 'maonamassa';
	hash(newPass, function(err, newSalt, newHash){
		User.findByIdAndUpdate(id, {salt: newSalt, hash: newHash}, callback);
	});
};

UserSchema.statics.setOnline = function(id, callback){
	User.findByIdAndUpdate(id, {$set:{isOnline: true, lastLoginDate: new Date()}}, callback);
};

UserSchema.statics.setOffline = function(id, callback){
	User.findByIdAndUpdate(id, {$set:{isOnline: false}}, callback);
};

UserSchema.statics.updateUser = function(id, update, callback){
	User.findByIdAndUpdate(id, {$set:update}).populate('ngo','name').exec(callback);
};

UserSchema.statics.deactivate = function(id, callback){
	User.findByIdAndUpdate(id, {$set:{isActive:false}}, callback);
};

UserSchema.statics.activate = function(id, callback){
	User.findByIdAndUpdate(id, {$set:{isActive: true}}, callback);
};

var User = mongoose.model('User', UserSchema);
module.exports = User;