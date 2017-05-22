var express = require('express');
var app = express();
var router = require('./router.js');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session');
// var storage =   multer.diskStorage({
//   destination: function (req, file, callback) {
//     callback(null, './public/images/products');
//   },
//   filename: function (req, file, callback) {
//     callback(null, file.fieldname + '-' + Date.now());
//   }
// });
// var upload = multer({ storage : storage}).single('userPhoto');

mongoose.connect('mongodb://localhost/my_db');
app.set('view engine', 'pug');
app.set('views','./views');
app.locals.pretty = true;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(cookieParser());
app.use(session({secret: "secret-key"}));
app.use(upload.array());
app.use('/public', express.static('./public'));
app.use('/', router);

app.listen(80);
