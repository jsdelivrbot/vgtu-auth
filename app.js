var createError = require('http-errors');
var express = require('express');
var path = require('path');
var https = require('https');
var http = require('http');
var session = require('cookie-session')
var csrf = require('csurf');

const fs = require('fs');
var secure = require('express-force-https');






var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();
var Fingerprint = require('express-fingerprint')

var logger = require('./logger')
logger.init();
logger.info('Server restarting', {"toto": "lol"})
//mongod
var mongoose = require('mongoose');

var mongoDB = 'mongodb://127.0.0.1/my_database';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug'); 

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
app.use(session({
  name: 'session',
  keys: ['key1', 'key2'],
  cookie: {
    secure: true,
    httpOnly: true,
    domain: 'example.com',
    path: 'foo/bar',
    expires: expiryDate
  }
}))

app.disable('x-powered-by');

app.use(Fingerprint({
    parameters:[
        Fingerprint.useragent,
        Fingerprint.acceptHeaders,
        Fingerprint.geoip,
        function(next) {
            next(null,{
            })
        },
        function(next) {
            next(null,{
            })
        },
    ]
}))


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

const options = {
    cert: fs.readFileSync('./public/fullchain.pem'),
    key: fs.readFileSync('./public/privkey.pem')
};

app.use(csrf());

app.use(function(req, res, next) {
  res.locals._csrf = req.csrfToken();
  next();
});

var http = require('http');
http.createServer(function (req, res) {
    if (req.socket.localPort == 80){
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}
}).listen(80);

app.listen(80)
https.createServer(options, app).listen(443);


//module.exports = app;
