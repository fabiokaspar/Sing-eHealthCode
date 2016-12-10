// video de instalação e configuração do express
//https://www.youtube.com/watch?v=tbgBN2y5_wI

// tutorial tambem usado
// http://expressjs.com/pt-br/starter/installing.html

// dependencies


var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http')
var pg = require('pg');
var formidable = require("formidable");
var mongoose = require('mongoose');

var index = require('./routes/index');
var users = require('./routes/users');


var flash = require('connect-flash')
var session = require('express-session')
var app = express();


var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var clientGlobal = createConection();




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());

app.use(cookieParser('secret'));

var pgSession = require('connect-pg-simple')(session);
 
app.use(session({
	store: new pgSession({
		pg: pg,                                  
		conString: "postgres://postgres:felinonino@localhost:5432/SingleHealthBD", 
	}),
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days 
}));



app.use(passport.initialize());
app.use(passport.session());
//app.use(app.router);


passport.use('local', new LocalStrategy(
	{	usernameField : 'login',
		passwordField : 'senha',
		passReqToCallback : true // allows us to pass back the entire request to the callback
	},
	function(req, username, password, done) {
		/*
		User.findOne({ username: username }, function (err, user) {
			if (err) { return done(err); }
			
			if (!user) {
				return done(null, false, { message: 'Incorrect username.' });
			}
			
			if (!user.validPassword(password)) {
				return done(null, false, { message: 'Incorrect password.' });
			}
      		return done(null, user);
    	});
		*/
		return done(null, false, req.flash('loginMessage', 'Not Logged!'));
	}
));


passport.serializeUser(function(users, done) {
	done(null, users.senha);
});

passport.deserializeUser(function(senha, done) {
	clientGlobal.query('select senha from users where senha = '+senha,
		function(err, user) {
			done(err, user);
		})
});

app.post('/login',
	passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: 'Invalid username or password.',
                                   successFlash: 'Welcome!'}),
	function(req, res) {
		// If this function gets called, authentication was successful.
		// `req.user` contains the authenticated user.
		console.log('Hello '+req.user.username)
		res.redirect('/');
		res.write('Hello! '+ req.user.username)
	}
);


app.use('/', index);

// mongoose
mongoose.connect('mongodb://localhost/passport_local_mongoose_express4');



app.get('/table', function(req, res) {
	res.sendFile( __dirname + '/views/table.html');
});

app.get('/login', function(req, res) {
	res.sendFile( __dirname + '/views/login.html');
});

app.get('/exames', function(req, res) {
	res.sendFile( __dirname + '/views/exames.html');
});

app.get('/query', function(req, res) {
	res.sendFile( __dirname + '/views/hospitais.html');
});

app.post('/query', function(req, res) {
	processAllFieldsOfTheForm(req, res)
});


app.get('/style', function(req, res) {
	res.sendFile( __dirname + '/views/style.css');
});


app.get('/cadastro', function(req, res) {
	res.sendFile( __dirname + '/views/cadastro.html');
});

app.post('/cadastro', function (req, res) {
	processAllFieldsOfTheForm(req, res)
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});



var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/sh';

MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	console.log("Connected correctly to mongodb.");
	console.log('Servidor rodando em localhost:3000.\nCtrl+C para encerrar…\n');
	db.close();
});


module.exports = app;
http.createServer(app).listen(3000);




/************************ FUNÇÕES **************************/

function processAllFieldsOfTheForm (req, res) {
	var form = new formidable.IncomingForm();

	form.parse(req, function (err, fields, files) {
		res.writeHead(200, {
    		'content-type': 'text/html'
    	});

		console.log(fields)

		var client = createConection();
		
		if ('enviar' in fields) {
			var register = [];

			for (key in fields) {
				if (key != 'enviar')
					register.push(fields[key])
			}

			var str = generateComandInsert(register, 'patients')
			client.query(str, register);
			res.end("Registro inserido!")
		}

		else if ('buscar' in fields) {
			//var consulta = "select * from mac439_aula10.usuario where senha < 500";
			var consulta = fields['consulta']
			executeQuery(consulta, client, res)		
		} 
    });
}

function createConection() {
	var conString = "postgres://postgres:felinonino@localhost:5432/SingleHealthBD";
	var myClient = new pg.Client(conString);

	myClient.connect();

	return myClient;
}

function executeQuery (strQuery, client, res) {
	//var query = myClient.query('select * from mac439_aula10.teste');
    
	var query = client.query(strQuery);
	
	query.on("row", function (row, result) {
		//console.log("--- enter -----")
		result.addRow(row);
		//jsonTxt = JSON.stringify(result.rows, null, "  ")
	});


	query.on("end", function (result) 
	{

		var jsons = result.rows
		var fields = atributosTabela(jsons[0])
		var html_table = geraHTMLTabela(fields, jsons)
		
		//console.log(jsons)
		require("jsdom").env("", function(err, window) {

		    if (err) {
		        console.error(err);
		        return;
		    }
 
    		var $ = require("jquery")(window);
    		var html;

			$.get('http://localhost:3000/table', 
			  function(data,status,xhr) {
				
				var div = '<div class="panel-body" id="table"></div>';
				var final_div = '<div class="panel-body" id="table">'+ html_table +'</div>';
				
				html = data.replace(div, final_div)
				res.end(html);
				
			}, "html");


		});
		
	});
			
}


function generateComandInsert(inputReg, inputTable) {
	var str = 'insert into '+inputTable+'(loginsh, num_carteira) values(';
		
	for (var i = 1; i <= inputReg.length; i++) {
		str += ('$'+i+', ');
	}

	str = str.substring(0, str.length-2)
	str += ');'
	
	console.log(str)
	
	return str;
}


function geraHTMLTabela (fields, json) {

	var html = "<table style='width:50%' align='center'> <tr>"; 
		
	for (var i = 0; i < fields.length; i++) {
		html += ("<th> "+ fields[i] +"</th>");
	}
	html += ("</tr>")

	for (var i = 0; i < json.length; i++) {
		html += ("<tr>")

		var campo;
		for (var j = 0; j < fields.length; j++) {
			campo = fields[j]
			html += ("<td> "+ json[i][campo]+ " </td>")
		}
		
		html += ("</tr>")
	}

	html += ("</table>")
	return html;
}

function atributosTabela (json) {
	var fields = [];
	var html;

	for (key in json) {
		fields.push(key)
	}

	return fields;
}

/**********************************************************/



