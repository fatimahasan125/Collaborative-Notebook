var express = require('express');
var router = new express.Router();
var D = require('../model/document');
var U = require('../model/user');
var nodemailer = require('nodemailer');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


router.get(["/","/Editor"],function (request,response) {	

	if(!request.session.user){
		response.redirect('/Login');
	}
	else{
		
		var d = new Date();
		var currDate = d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear();
		var doc = new D.Document("", "document", request.session.user.email, currDate);
		doc.saveDocument(function(result){
			html = '<input type="text" id="docname" name="'+result+'" value="document" style="position:relative; left: 80px; top:10px; color:darkslategray;font-family:Monospace; margin-bottom:0.8%" />';
			html += '<div class="doc" id="doc" runat="server" contenteditable="true" spellcheck="false"></div>'
			response.render('Notepad', {content: html});
			
		});
	}
});


router.post(["/","/Editor"],function (request,response) {	
	var d = new Date();
	var currDate = d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear();
	var doc = new D.Document(request.body.doctext, request.body.docname, request.session.user.email, currDate);
	doc.updateDocument(request.body.docId);
	
});

router.get(["/edit","/Editor"],function (request,response){
	
	var currentuser = new U.User("", request.session.user.email, "");
	var docHtml ="";
	var docName = "";
	currentuser.getDocuments(function(docs){
		if(docs!=""){
			docId = docs[request.query.id]._id.toString();
			docHtml = docs[request.query.id].docText;
			docName = docs[request.query.id].name;	
			
			html = '<input type="text" name="'+docId+'" id="docname" value="' + docName + '" style="position:relative; left: 80px; top:10px; color:darkslategray;font-family:Monospace; margin-bottom:0.8%" />';
			html += '<div class="doc" id="doc" runat="server" contenteditable="true" spellcheck="false">'+ docHtml +'</div>'
			response.render('Notepad', {content: html});
		}
	});
	
});


router.get(["/sharededit","/Editor"],function (request,response){
	
	var currentuser = new U.User("", request.session.user.email, "");
	var docHtml ="";
	var docName = "";
	currentuser.getSharedDocuments(function(docs){
		if(docs!=""){
			docId = docs[request.query.id]._id.toString();
			docHtml = docs[request.query.id].docText;
			docName = docs[request.query.id].name;	
			
			html = '<input type="text" name="'+docId+'" id="docname" value="' + docName + '" style="position:relative; left: 80px; top:10px; color:darkslategray;font-family:Monospace; margin-bottom:0.8%" />';
			html += '<div class="doc" style="height: 1000px;" id="doc" runat="server" contenteditable="true" spellcheck="false">'+ docHtml +'</div>'
			response.render('Notepad', {content: html});
		}
	});
	
});

router.post(["/share","/Editor"],function (request,response){
	
	U.User.checkUser(request.body.person, function(check){
		if(check==0){
			var transporter = nodemailer.createTransport({
			  service: 'gmail',
			  auth: {
				user: 'noreply.journal123@gmail.com',
				pass: 'journal123'

				}
			});

			var mailOptions = {
			  from: request.session.user.email,
			  to: request.body.person,
			  subject: 'Invitation to collaborate',
			  text: 'Hey, ' + request.session.user.email +' just shared a document with you called ' + request.body.docname + '. Please login to view it' 
			};

			transporter.sendMail(mailOptions, function(error, info){
			  if (error) {
				console.log(error);
			  } else {
				console.log('Email sent: ' + info.response);
			  }
			});
			
			
			//now email is sent. We just need to add this user to the collaborators
			
			D.Document.addCollaborator(request.body.docId, request.body.person);
			response.send("Shared!");
		}
		else{
			response.send("This user does not have a journal account");
		}
	});
	
});


module.exports = router;