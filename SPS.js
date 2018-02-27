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

const FILEPATH = "/home/ubu/Descargas/tem/"
const SAVEPATH = '/home/ubu/Imágenes/'

var picArray = [];


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
 
  
  var downloadUrl = req.body.ids;
  console.log (downloadUrl);
  console.log ("---------------------");
  
  if (typeof downloadUrl === 'string'){
    console.log("Es un String");

    // downdload one image, create object
    var options = {
      url: downloadUrl,
      dest: FILEPATH
    }
    
  download.image(options).then((result)=>{
    var filename = result.filename.substr(24, result.filename.length - 1 );
    var oldpath = result.filename;
    var newpath = SAVEPATH + filename;
    
    fs.rename(oldpath, newpath, (err)=>{
      if (err) throw err;
    })
    fs.stat(newpath, (err, stat)=>{
      let flag;
      if (err == null){
        console.log('File exixts');
        flag = 0;
      }else if (err.code == 'ENOENT') {
        console.log('File NO exists')
        flag = 1;
      }else{
        console.log('Some other error', err.code);
        flag  = 2;
      }

      switch (flag) {
        case 0:
          console.log('File/s is download ok BEFORE SEND JSON');
          res.json({responses: 'File/s is download ok'}) ; 
          console.log('File/s is download ok');
          break;
        case 1:
          res.json({responses: 'File/s is not download ok'})
          break;
        default:
          re.json({responses: 'Fatal eror, unplug the microware'})
          break;
      }

    });
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
      
      var oldpath = result.filename;
      var newpath = SAVEPATH + filename;
      
      fs.rename(oldpath, newpath, (err)=>{
        if (err) throw err;
        
        
      })
    }).catch((err)=>{
      console.log("download error:")
      console.log(err)
    });
  });
  
}
  
})


app.listen (8082)

  console.log ('listeting on port 8082')