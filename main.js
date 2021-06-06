var express = require('express');
var app = new express();
var http = require('http').Server(app);
var session = require('express-session')

app.engine('html',require('./controller/templateengine'));
app.set('views','./view');
app.set('view engine','html');

app.use(session({secret:"827897wkdkh", resave:false, saveUninitialized:true}));

app.use('/', require('./controller/login'));
app.use('/SignUp', require('./controller/signup'));
app.use('/Home', require('./controller/home'));
app.use('/Notepad', require('./controller/editor'));
app.use('/MyFiles', require('./controller/myfiles'));
app.use('/SharedWithMe', require('./controller/shared'));

app.get("/Drive", function(request,response){
	response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	response.setHeader("Pragma", "no-cache");
	response.render("Drive");
});

app.get("/Uploadfiles", function(request,response){
	response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	response.setHeader("Pragma", "no-cache");
	response.render("Uploadfiles");
});

app.use('/static', express.static('static'));

http.listen(8888, function() {
   console.log('listening on *:8888');
});