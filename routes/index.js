var express = require('express');
var router = express.Router();

// código omitido ...


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});


/*
router.get('/login', function(req, res, next) {
	res.render('login', { title: 'Express' });
});

router.get('/cadastro', function(req, res, next) {
	res.render('cadastro', { title: 'Express' });
});
*/



module.exports = router;
