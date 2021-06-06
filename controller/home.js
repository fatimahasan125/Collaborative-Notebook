var express = require('express');
var router = new express.Router();
var U = require('../model/user');

router.get(["/","/Home"],function (request,response) {	  	
	if(!request.session.user){
		return response.send("You have not logged in");
	}
	else{
		response.render('Home');
	}
	
});

router.get(["/logout","/Home"],function (request,response) {	
	U.User.Logout(request.session.user.email);
	request.session.destroy();
	response.redirect('/Login');
	
});



module.exports = router;