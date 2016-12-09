	//servidor nodejs
	// http://nodeexamples.com/2012/09/21/connecting-to-a-postgresql-database-from-node-js-using-the-pg-module/
	 
	var http = require('http');
	var pg = require('pg');
	var fs = require('fs');
	var formidable = require("formidable");
	var util = require('util');
	var express = require('express');
	var app = express();

	// definindo local de arquivos públicos
	app.use(express.static(__dirname + '/public'));
	
	/*	
	var server = http.createServer(
		function(req, res) {
			if (req.method.toLowerCase() == 'get') {
	    		displayForm(res);
	    	} else if (req.method.toLowerCase() == 'post') {
				processAllFieldsOfTheForm(req, res);
			}
		}
	);
	*/

	app.get('/', function (req, res) {
		displayForm(res)
		//res.send('olá mundo!')
	});

	
	function displayForm(res) {
    	fs.readFile('./views/cadastro.html', function (err, data) {
	        res.writeHead(200, {
	            'Content-Type': 'text/html',
	            'Content-Length': data.length
	        });
	        res.write(data);
	        res.end();
    	});
	}
	


	function processAllFieldsOfTheForm (req, res) {
	    var form = new formidable.IncomingForm();

	    form.parse(req, function (err, fields, files) {
	        //Store the data from the fields in your data store.
	        //The data store could be a file or database or any other store based
	        //on your application.
	        
	        //res.write('dados recebidos:\n\n');
	        res.writeHead(200, {
        		'content-type': 'text/html'
        	});
			
			if (fields.botao == 'Insere') {
		        res.end(util.inspect({
		            fields: fields,
		            files: files
		        }));

				console.log(fields)
				var register  = [];

				for (key in fields) {
					if (key != 'botao')
						register.push(fields[key])
				}

				var client = createConection();
				var str = generateComandInsert(register, 'teste')
				client.query(str, register);
			}

			else if (fields.botao == 'Busca') {
				var client = createConection();

				executeQuery('select * from mac439_aula10.'+fields['table'], client, res)
			}

	    });
	}

	//server.listen(3000);
	http.createServer(app).listen(3000);
	console.log('Servidor node iniciado em localhost:3000\nCtrl+C para encerrar…');
	

/*===================== Funções ============================*/

	function generateComandInsert(inputReg, inputTable) {
		var str = 'insert into mac439_aula10.'+inputTable+' values(';
			
		for (var i = 1; i <= inputReg.length; i++) {
			str += ('$'+i+', ');
		}

		str = str.substring(0, str.length-2)
		str += ');'
		
		console.log(str)
		
		return str;
	}

	function createConection() {
		var conString = "postgres://postgres:felinonino@localhost:5432/Computadores";
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
	

		query.on("end", function (result) {
			//myClient.end();
			var jsons = result.rows

			var fields = atributosTabela(jsons[0])
			var html = geraHTMLTabela(fields, jsons)
			
			console.log(jsons)
			res.write(html);
			res.end()
		});
				
	}

	function showTable (nomeTabela) {
		var query = client.query('select * from '+ nomeTabela);
		return query;
	}

	function geraHTMLTabela (fields, json) {
		var html = "<table><tr>"; 
			
		for (var i = 0; i < fields.length; i++) {
			html += ("<td> <b>| "+ fields[i] +"</b></td>");
		}
		html += ("</tr>")

		for (var i = 0; i < json.length; i++) {
			html += ("<tr>")

			var campo;
			for (var j = 0; j < fields.length; j++) {
				campo = fields[j]
				html += ("<td>| "+ json[i][campo]+ " </td>")
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
	
	/*
	function displayForm(res) {
    	fs.readFile('form.html', function (err, data) {
        	res.writeHead(200, {
            	'Content-Type': 'text/html; charset=utf-8',
                'Content-Length': data.length
        	});
        	
        	res.write(data);
			var fields = atributosTabela(json[0])
			html = geraHTMLTabela(fields, json)
			
			res.write(jsonTxt)
			res.write("<br><br>")
			res.write(html)
			res.end()
    	});
	}
	*/
	
	function processFormFieldsIndividual(req, res) {
	    //Store the data from the fields in your data store.
	    //The data store could be a file or database or any other store based
	    //on your application.
	    var fields = [];
	    var form = new formidable.IncomingForm();
	    form.on('field', function (field, value) {
	        console.log(field);
	        console.log(value);
	        fields[field] = value;
	    });

	    form.on('end', function () {
	        res.writeHead(200, {
	            'content-type': 'text/plain'
	        });
	        res.write('***dados recebidos***:\n\n');
	        res.end(util.inspect({
	            fields: fields
	        }));
	    });
	    form.parse(req);
	} 

