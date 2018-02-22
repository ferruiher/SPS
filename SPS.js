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

const FILEPATH = "/home/ubu/Descargas/tem"
const SAVEPATH = '/home/ubu/Imágenes/'

var picArray = [];
//const picJsons = {};


// app.set('views',path.join(__dirname, 'Mypexel'));
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));
app.use(bodyParser.json({ limit: '5mb' }));

app.get('/', (req, res) =>{
    res.render('home', {results: []})
})

app.post ('/post/search' ,(req,res)=>{
  var rec = req.body.search;
  var apiKey = '8047832-4eb74703bfe5535846a8f3959'
  var url = 'https://pixabay.com/api/?key=' +apiKey+ '&q=' +rec + '&image_type=all' ;
  
  request (url, (error,response,body)=>{
    
    var picJsons = JSON.parse(body);
    var viewJsonArray = [];
    //var picArray = [];
    //console.log(picJsons);
    
    if (parseInt(picJsons.totalHits) > 0){
      var i = 0;
      
      picJsons.hits.forEach(element => {
        viewJsonArray.push({ previewUrl: picJsons.hits[i].previewURL, id: picJsons.hits[i].webformatURL });
        i++
      });
    }
    else
      console.log ('Noooo pictures');
    
    // console.log(picArray);
    res.render('home', {results: viewJsonArray})
  })

})

app.post('/post/download', (req, res)=>{
  // console.log(req.body);
  // var pepe = 'pepe';
  var downloadUrl = req.body.ids;
  console.log (downloadUrl);
  console.log ("---------------------");
  
  if (typeof downloadUrl === 'string'){
    console.log("Es un String");
    var options = {
      url: downloadUrl,
      dest: FILEPATH
    }
    
  download.image(options).then((result)=>{
    var filename = result.filename.substr(24, result.filename.length - 1 );
    // console.log(filename + '--------------------------------------------------------------------------------------------------------------');
    var oldpath = result.filename;
    var newpath = SAVEPATH + filename;
    // console.log ('the newpath is: '+ newpath+ '+++++++++++++++++++++++++');
    fs.rename(oldpath, newpath, (err)=>{
      if (err) throw err;
      res.write('File upload and moved');
      res.end;
    })
  }).catch((err)=>{
    console.log("download error:")
    console.log(err)
  });
   
  }else{
    console.log("Es un ARARY");
    
    downloadUrl.forEach(element => {
      
      var options = {
        url: element,
        dest: FILEPATH
      }
      
    download.image(options).then((result)=>{
      var filename = result.filename.substr(24, result.filename.length - 1 );
      // console.log(filename + '--------------------------------------------------------------------------------------------------------------');
      var oldpath = result.filename;
      var newpath = SAVEPATH + filename;
      // console.log ('the newpath is: '+ newpath+ '+++++++++++++++++++++++++');
      fs.rename(oldpath, newpath, (err)=>{
        if (err) throw err;
        res.write('File upload and moved');
        // console.log('File upload and moved');
        res.end;
      })
    }).catch((err)=>{
      console.log("download error:")
      console.log(err)
    });
    });
  }
  //res.send(req.body.ids);
  // res.render('home', {results: []})
})

app.listen (8082)

  console.log ('listeting on port 8082')