// LinuxServer Guacamole Client
var GuacamoleLite = require('guacamole-lite');
var baseurl = process.env.SUBFOLDER || '/';
var crypto = require('crypto');
var express = require('express');
var url = require('url');
var app = require('express')();
app.use(express.urlencoded({extended: true}));
app.use(express.json())
const fs = require("fs");
var CUSTOM_PORT = process.env.CUSTOM_PORT || 3000;
var baserouter = express.Router();
const credentials = require('./credentials.json')


var https = require('https').createServer({
	key: fs.readFileSync("./localhost.key"),
	cert: fs.readFileSync("./localhost.crt"),
},app);

var clientOptions = {
  crypt: {
    cypher: 'AES-256-CBC',
    key: 'LSIOGCKYLSIOGCKYLSIOGCKYLSIOGCKY'
  },
  log: {
    verbose: false
  }
};

var guacServer = new GuacamoleLite({server: https,path:baseurl +'guaclite'},{host:'127.0.0.1',port:4822},clientOptions);

function fetchCredentials(username){
  const cred = credentials[username]
	if(cred){
    return cred;
	}
}

var encrypt = (value) => {
  var iv = crypto.randomBytes(16);
  var cipher = crypto.createCipheriv(clientOptions.crypt.cypher, clientOptions.crypt.key, iv);
  let crypted = cipher.update(JSON.stringify(value), 'utf8', 'base64');
  crypted += cipher.final('base64');
  var data = {
    iv: iv.toString('base64'),
    value: crypted
  };
  return new Buffer(JSON.stringify(data)).toString('base64');
};


baserouter.use('/public', express.static(__dirname + '/public'));

baserouter.get("/", function (req, res) {	
	res.render(__dirname + '/login.ejs', {username : '', password: ''});
});

baserouter.get("/signup", function (req, res) {	
	res.render(__dirname + '/signup.ejs', {username : '', password: '', hostname: '', port: '', systemUsername: '', systemPassword: '', connection: ''});
});

baserouter.get("/register", function (req, res) {	
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	var userData = {};
	userData[query.username] = {"connection":{
		"type":query.connection,
		"settings":{
			"hostname":query.hostname,
			"port":query.port,
			"username":query.systemUsername,
			"password":query.systemPassword,
			"security": "any",
			"ignore-cert": true,
			"enable-stfp":"fasle"
		}
	}
}

	var userData_stre = JSON.stringify(userData);
	userData_stre = userData_stre.substring(1,userData_stre.length-1);
	var tempData = JSON.stringify(credentials);
	tempData = tempData.substring(1,tempData.length-1);
	tempData = "{"+tempData+","+userData_stre+"}";

	fs.writeFile('./credentials.json', tempData, 'utf8' ,function (err) {
		if (err) return console.log(err);
		res.render(__dirname + '/login.ejs', {username : '', password: ''});
	});
});

baserouter.get("/connect", function (req, res) {
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	var connectionstring = encrypt(fetchCredentials(query.username));
  res.render(__dirname + '/rdp.ejs', {token : connectionstring, baseurl: baseurl});
});

app.use(baseurl, baserouter);
https.listen(CUSTOM_PORT, function(){
  console.log('listening on *:' + CUSTOM_PORT);
});
