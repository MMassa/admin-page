var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

NgoSchema = mongoose.Schema({
	name: String,
	phone: String,
	email: String,
	status: {type: String, default:"Ativa"},
	type: {type: String},
	people:[{type: ObjectId, ref:'User'}],
    website: String,
	location:{
		address: String,
		streetNumber: String,
		addressComplement: String,
		neighborhood: String,
		city: String,
		state: String,
		country: String,
		zip: String
		},
	creationDate: {type: Date, default: Date.now},
	updateDate: {type: Date, default: Date.now}
});

NgoSchema.statics.addNew = function(data, callback){
	var newNgo = data;
	this.create(newNgo, callback);
};

NgoSchema.statics.updateNgo = function(update, callback){
	var id = update._id;
	delete update._id;
	update.updateDate = new Date();
	this.findByIdAndUpdate(id, {$set:update}, callback);
};

NgoSchema.statics.addPerson = function(id, personId, callback){
	this.findByIdAndUpdate(id, {$push:{people: personId}}, callback);
};

NgoSchema.statics.getById = function(id, callback){
	this.findById(id).populate('people', 'firstName lastName email phone lastLoginDate isOnline isActive').exec(callback);
};

NgoSchema.statics.getAll = function(callback){
	this.find({}).exec(callback);
};

NgoSchema.statics.getForTypeAhead = function(query, callback){
	var q = new RegExp('.*' + query + '.*', 'i');
	this.find({'name': q}, 'name', {limit:15}, callback);
};

NgoSchema.statics.getCount = function(callback){
	this.count({}, callback);
};

var Ngo = mongoose.model('Ngo', NgoSchema);
module.exports = Ngo;