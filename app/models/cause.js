
var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var Status_Open_String = 'Aberta', Status_Closed_String = 'Fechada';

CauseSchema = mongoose.Schema({
	creator: {type: ObjectId, ref: 'User'} ,
	creationDate: {type: Date, default: Date.now},
	title: {type: String, default: ''},
	ngo:{type: ObjectId, ref:'Ngo'},
	text: String,
	place: String,
	time: String,
	closingDate: Date,
	isOpen: {type: Boolean, default: true},
	status: {type: String, default: Status_Open_String},
	maxVolunteers: Number,
	volunteers: [{type:ObjectId, ref:'Volunteer'}],
	tags:[String]
	//eventDate: Date //includes the right time...
	//type: {type:String}
});

CauseSchema.statics.closeCause = function(id, callback){
	this.findByIdAndUpdate(id,{$set:{status: Status_Closed_String, isOpen:false}})
	.populate('ngo', 'name email phone')
	.populate('creator','firstName lastName')
	.populate('volunteers','firstName lastName email')
	.exec(callback);
};

CauseSchema.statics.getAllNgo = function(ngo, callback){
	this.find({ngo: ngo}).sort('-closingDate').populate('creator', 'firstName lastName').exec(callback);
};

CauseSchema.statics.addNew = function(cause, callback){
	this.create(cause, callback);
};

CauseSchema.statics.getAll = function(callback){
	//need admin permission...
	this.find({})
	.sort('-closingDate')
	.populate('ngo', 'name email phone')
	.populate('creator','firstName lastName')
	.populate('volunteers','firstName lastName email')
	.exec(callback);
};

CauseSchema.statics.getByQuery = function(query, nDocs, nSkip, callback){
	this.find(query).sort('-status').skip(nSkip).limit(nDocs).exec(callback);
};

CauseSchema.statics.getCount = function(query, callback){
	this.count(query, callback);
};

var Cause = mongoose.model('Cause', CauseSchema);
module.exports = Cause;