var express = require('express');
var router = new express.Router();
var U = require('../model/user');
var D = require('../model/document');

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


router.get(["/","/SharedWithMe"],function (request,response) {	
	if(!request.session.user){
		response.redirect('/Login');
	}
	else{
		var html = "";
		var currentuser = new U.User("", request.session.user.email, "");
		currentuser.getSharedDocuments(function(docs){
			if(docs!=""){
				for( var i=0; i< 5 && i<docs.length; i++){
					html += generateDocumentHtml(docs[i].name, docs[i].author, i);
				}
				if(5 < docs.length)
					html += '<button id="next" onclick="nextPage()" class="page">Next</button>';
			}
			response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
			response.setHeader("Pragma", "no-cache");
			response.render('SharedWithMe', {content : html});
		});
		
	}
});

router.get(["/next","/SharedWithMe"],function (request,response) {

	var pageSize=5;
	var html = "";
	var currentuser = new U.User("", request.session.user.email, "");
	currentuser.getSharedDocuments(function(docs){
		if(docs!=""){
			for( var i=pageSize * request.query.page; i< pageSize * request.query.page +5 && i<docs.length; i++){
				html += generateDocumentHtml(docs[i].name, docs[i].author, i);
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
	currentuser.getSharedDocuments(function(docs){
		if(docs!=""){
			docHtml = docs[request.query.id].docText;
			docName = docs[request.query.id].name;		
		}
		var json = {'name': docName, 'docHtml': docHtml};
		response.send(json);
	});
	
});



function generateDocumentHtml(n, d, id){
	
	var html = '<div class="docs" id="' + id + '">';
	html+= '<img style="width: 20px;" src="../static/images/icon.png"/>';
	html += '&nbsp<span>'+n+'</span>';
	html += '<button onclick="downloadAjax(this.id)" id = d'+id+' >Download</button>\n';
	html += '<button onclick="editDoc(this.id)" id = e'+id+' >Edit</button>\n';
	html += '<p>Authored by: ' + d + '</p></div>';

	return html;
	
}



module.exports = router;