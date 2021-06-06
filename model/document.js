var config = require('../config/settings');
var U = require('../model/user');
var ObjectId = require('mongodb').ObjectID;

var MongoClient = require('mongodb').MongoClient;

var dbo;
MongoClient.connect(config.connection, function(err, db) {
		  if (err) throw err;
		  dbo = db.db(config.db);
		});

class Document{
	constructor(t, n, a, d){
		this.author = a;
		this.docName = n;
		this.docText = t;
		this.dateCreated = d;
	}
	
	saveDocument(callback){
		var a = this.author;
		var n = this.docName;
		var t = this.docText;
		var d = this.dateCreated;
		
		
		dbo.collection("documents").insertOne({'author' : a, 'name' : n , 'docText' : t, 'dateCreated': d}, function(err, result){
			if(err) throw err;
			return callback(result.insertedId);
			
		});

	}
	
	updateDocument(docId){
		
		dbo.collection("documents").updateOne( { '_id' :  ObjectId(docId) }, { $set: {'name': this.docName, 'docText': this.docText} }, function(err, res){
			if(err) throw err;
			console.log('updated');
		});
	}
	
	deleteDocument(id){
		dbo.collection("documents").deleteOne({'_id': id});
	}
	
	
	toJson(){
		var json = '{';
		json += '"name":"'+ this.docName + '",';
		json += '"dateCreated":"'+ this.dateCreated + '"';	
		json += '}';
		return json;
	}
	
	static addCollaborator(docId, person){
		
		dbo.collection("documents").updateOne( { '_id' :  ObjectId(docId) },  { $push: {'collaborators': person}} , function(err, res){
			if(err) throw err;
		});
		
	}
}

module.exports = {
	Document: Document
};
		
		