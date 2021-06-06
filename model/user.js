var config = require('../config/settings');

var MongoClient = require('mongodb').MongoClient;

var dbo;
MongoClient.connect(config.connection, function(err, db) {
		  if (err) throw err;
		  dbo = db.db(config.db);
		});

class User{
	constructor(n, e, p){
		this.name = n;
		this.email = e;
		this.password = p;
	}
	
	insertIntoDb(callback){
		var n = this.name;
		var e = this.email;
		var p = this.password;
		dbo.collection("users").find({'email' : this.email}).toArray(function(err, result){
			if(err)
				throw err;
			if(result.length != 0)
				return callback(-1);
			else{
				dbo.collection("users").insertOne({'name' : n, 'email' : e , 'password' : p});
				return callback(0);
			}
		});
	}
	
	validateUser(callback){
		var n = this.name;
		var e = this.email;
		var p = this.password;
		dbo.collection("users").find({'email' : e, 'password' : p}).toArray(function(err, result){
			if(err)
				throw err;
			if(result.length != 0){
				for ( var i =0; i<result.length; i++)
					if(result[i].email != null && result[i].password != null){
						dbo.collection("onlineusers").insertOne({'name': result[i].name, 'email' : result[i].email});
						return callback(0)
					}
				return callback(-1);
			}
			else{
				return callback(-1);
			}
		});
	}
	
	getDocuments(callback){
		var e= this.email;
		dbo.collection("documents").find({'author' : e}).toArray(function(err, result){
			if(err)
				throw err;
			if(result.length != 0){
				return callback(result);
			}
			else return callback("");
		});
	}
	
	getSharedDocuments(callback){
		var e= this.email;
		dbo.collection("documents").find({'collaborators' : e}).toArray(function(err, result){
			if(err)
				throw err;
			if(result.length != 0){
				return callback(result);
			}
			else return callback("");
		});
	}
	
	static checkUser(em, callback){
		
		dbo.collection("users").find({'email': em}).toArray(function(err,result){
			if(err) throw err;
			if(result.length == 0)
				return callback(-1);
			else
				return callback(0);
			
		});
		
	}
	
	static Logout(em){
		dbo.collection("onlineusers").deleteMany({'email' : em});
	}
	
}

module.exports = {
	User : User,
	dbconnection: dbo
};