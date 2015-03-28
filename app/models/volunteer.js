
var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

VolunteerSchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	fbId: String,
	causes: [{type: ObjectId, ref:'Causes'}],
	creationDate: {type: Date, default: Date.now},
	lastLoginDate: {type: Date, default: Date.now},
	lastUpdate: {type: Date, default: Date.now},
	inactivationDate: Date,
	isActive: {type: Boolean, default: true}
});

VolunteerSchema.virtual('fullName').get(function(){
	return this.firstName + ' ' +this.lastName;
	
});

VolunteerSchema.statics.createNew = function(data, callback){
	var User = this;
	/*hash(data.password, function(err, salt, hash){
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
	});*/
};

var Volunteer = mongoose.model('Volunteer', VolunteerSchema);
module.exports = Volunteer;