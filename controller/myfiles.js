var express = require('express');
var router = new express.Router();
var U = require('../model/user');
var D = require('../model/document');
var nodemailer = require('nodemailer');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());



router.get(["/","/MyFiles"],function (request,response) {	
	if(!request.session.user){
		response.redirect('/Login');
	}
	else{
		var html = "";
		var currentuser = new U.User("", request.session.user.email, "");
		currentuser.getDocuments(function(docs){
			if(docs!=""){
				for( var i=0; i< 5 && i<docs.length; i++){
					html += generateDocumentHtml(docs[i].name, docs[i].dateCreated, i);
				}
				if(5 < docs.length)
					html += '<button id="next" onclick="nextPage()" class="page">Next</button>';
			}
			response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
			response.setHeader("Pragma", "no-cache");
			response.render('MyFiles', {content : html});
		});
		
	}
});

router.get(["/next","/MyFiles"],function (request,response) {

	var pageSize=5;
	var html = "";
	var currentuser = new U.User("", request.session.user.email, "");
	currentuser.getDocuments(function(docs){
		if(docs!=""){
			for( var i=pageSize * request.query.page; i< pageSize * request.query.page +5 && i<docs.length; i++){
				html += generateDocumentHtml(docs[i].name, docs[i].dateCreated, i);
			}
			if(pageSize * request.query.page +5 < docs.length && request.query.page>0)
				html += '<button id="next" class="page" onclick="nextPage()" >Next</button> <button id="prev" onclick="prevPage()" class="page">Previous</button>';
			else if (request.query.page>0)
				html += '<button id="prev" onclick="prevPage()" class="page">Previous</button>';
			else if (pageSize * request.query.page +5 < docs.length)
				html += '<button id="next" onclick="nextPage()" class="page" >Next</button>';
				
		}
		response.send(html);
	});
});


router.get(["/download","/MyFiles"],function (request,response){
	var currentuser = new U.User("", request.session.user.email, "");
	var docHtml ="";
	var docName = "";
	currentuser.getDocuments(function(docs){
		if(docs!=""){
			docHtml = docs[request.query.id].docText;
			docName = docs[request.query.id].name;		
		}
		var json = {'name': docName, 'docHtml': docHtml};
		response.send(json);
	});
	
});

router.get(["/delete","/MyFiles"],function (request,response){
	var currentuser = new U.User("", request.session.user.email, "");
	var docHtml ="";
	var docName = "";
	console.log(request.query.id);
	currentuser.getDocuments(function(docs){
		if(docs!=""){
			author = docs[request.query.id].author;
			docId = docs[request.query.id]._id;
			docHtml = docs[request.query.id].docText;
			docName = docs[request.query.id].name;	
			
		}
		var docu = new D.Document(author, docName, docHtml);
		docu.deleteDocument(docId);
		var j;
		var html="";
		var i;
		var pageSize=5;
		for(i=pageSize * request.query.page; i< pageSize * request.query.page +5 && i<docs.length && i!=request.query.id; i++){
			html += generateDocumentHtml(docs[i].name, docs[i].dateCreated, i);
		}
		i++;
		for( ; i< pageSize * request.query.page + 6 && i<docs.length; i++){
			html += generateDocumentHtml(docs[i].name, docs[i].dateCreated, i-1);
		}
		if(pageSize * request.query.page +6 < docs.length && request.query.page>0)
			html += '<button id="next" class="page" onclick="nextPage()" >Next</button> <button id="prev" onclick="prevPage()" class="page">Previous</button>';
		else if (request.query.page>0)
			html += '<button id="prev" onclick="prevPage()" class="page">Previous</button>';
		else if (pageSize * request.query.page +6 < docs.length)
			html += '<button id="next" onclick="nextPage()" class="page" >Next</button>';
		
		response.send(html);
	});
	
});

router.post(["/share","/MyFiles"],function (request,response){

	var currentuser = new U.User("", request.session.user.email, "");
	currentuser.getDocuments(function(docs){
		if(docs!=""){
			docid = docs[request.body.id]._id;
			docname	= docs[request.body.id].name;		
		}
		
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
				  text: 'Hey, ' + request.session.user.email +' just shared a document with you called ' + docname + '. Please login to view it' 
				};

				transporter.sendMail(mailOptions, function(error, info){
				  if (error) {
					console.log(error);
				  } else {
					console.log('Email sent: ' + info.response);
				  }
				});
				
				
				//now email is sent. We just need to add this user to the collaborators
				
				D.Document.addCollaborator(docid, request.body.person);
				response.send("Shared");
				
			}
			else{
				response.send("This user does not have a journal account");
			}
		
		});
	
	});
});



function generateDocumentHtml(n, d, id){
	
	
	var html = '<div class="docs" id="' + id + '">';
	html+= '<img style="width: 20px;" src="../static/images/icon.png"/>';
	html += '&nbsp<span>'+n+'</span>';
	html += '<button onclick="deleteDoc(this.id)" id = del'+id+'>Delete</button>\n ';
	html += '<button onclick="downloadAjax(this.id)" id = d'+id+' >Download</button>\n';
	html += '<button onclick="shareDoc(this.id)" id = s' + id + ' >Share</button>\n';
	html += '<button onclick="editDoc(this.id)" id = e'+id+' >Edit</button>\n';
	html += '<p>Date Created:' + d + '</p></div>';

	return html;
	
}



module.exports = router;