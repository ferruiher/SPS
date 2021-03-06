var config = require('./config');
var espress =  require('express');
var app = espress();
var path = require('path');
var bodyParser = require('body-parser');
var https = require('https');
var request = require('request');
var array = require('array');
var formidable = require('formidable');
var fs = require ('fs');
var download = require('image-downloader');



app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use (function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Header", "Origin, X-Requested-with, Content-Type, Accept");
  next();
})

app.get('/', (req, res) =>{
   //res.render('home', {results: []})
   res.render('upload')
})

app.listen (config.server.portApi)
  console.log ('listeting on port: '+ config.server.portApi);