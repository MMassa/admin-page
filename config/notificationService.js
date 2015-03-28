
var User = require('../app/models/user')

var nodemailer = require('nodemailer');
var wk = require('nodemailer-wellknown');
//var config = wk('hotmail');

module.exports = {
	transporter: nodemailer.createTransport({
		service: 'Outlook',
		auth:{
			user: 'atgcms@outlook.com',
			pass: 'Mureb@001'
		}
	}),
	sendNotification: function(uids, details) {
		var mailOpt = {
			from: 'atgcms@outlook.com',
			to: 'lmureb@americastg.com',
			subject: 'Hello',
			html: '<b> teste</b>'
		}

		this.transporter.sendMail(mailOpt, function(err, info){
			if(err){
				console.log(err);
			}else{
				console.log('Message sent: ' + info.response);
			}
		});
	}
};