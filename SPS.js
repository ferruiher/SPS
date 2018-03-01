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
  var urldownload = SelectStringOrArrys(downloadUrl);
  console.log('la url antes del metodo downlaodAndSave: ' + urldownload);
  downloadAndSave(urldownload,FILEPATH).then((newpath)=>{
    return existsImage(newpath);
  }).then((flag)=>{
    switch (flag) {
      case 0:
        console.log('File/s is download ok BEFORE SEND JSON');
        res.json({responses: 'File/s is download ok'}) ; 
        console.log('File/s is download ok');
        break;
      case 1:
        res.json({responses: 'File/s is not download ok'})
        break;
      case 2:
        res.json({responses: 'Another error when downloading  '})
        break;
      default:
        res.json({responses: 'Fatal eror, unplug the microware'})
        break;
    }
  }).catch ((err)=>{
    console.log('FIN  ' + err);
  })

  console.log (downloadUrl);
  console.log ("---------------------");
  
  // if (typeof downloadUrl === 'string'){
  //   console.log("Es un String");

  //   downloadAndSave(downloadUrl, FILEPATH).then((result)=>{

  //     let flag = result;

  //     switch (flag) {
  //       case 0:
  //         console.log('File/s is download ok BEFORE SEND JSON');
  //         res.json({responses: 'File/s is download ok'}) ; 
  //         console.log('File/s is download ok');
  //         break;
  //       case 1:
  //         res.json({responses: 'File/s is not download ok'})
  //         break;
  //       case 2:
  //         res.json({responses: 'Another error when downloading  '})
  //         break;
  //       default:
  //         res.json({responses: 'Fatal eror, unplug the microware'})
  //         break;
  //     }

  //   });
    
    

  // }else{
  //   console.log("Es un ARARY");
    
  //   downloadUrl.forEach(element => {
      
  //     var options = {
  //       url: element,
  //       dest: FILEPATH
  //     }
      
  //     download.image(options).then((result)=>{
  //       var filename = result.filename.substr(24, result.filename.length - 1 );
      
  //       var oldpath = result.filename;
  //       var newpath = SAVEPATH + filename;
      
  //       fs.rename(oldpath, newpath, (err)=>{
  //         if (err) throw err;
        
        
  //       })
  //     }).catch((err)=>{
  //       console.log("download error:")
  //       console.log(err)
  //     });
  //   });
  
  // }
  
})
function SelectStringOrArrys(StringArrays) {
  
  var strinToArray = [];
  if (typeof StringArrays === 'string'){
    console.log("Es un String en la function SelectStringOrArrys");
    strinToArray.push(StringArrays);
    return StringArrays;
  }else {
    console.log("Es un Array en la function SelectStringOrArrys");
    return StringArrays;
  }
 
}

function downloadAndSave(pathForElement,FILEPATH) {
  return new Promise( function (resolver, reject) {
    
    let flag = 5;
    var newpath = '';
    var options = {
      url: pathForElement,
      dest: FILEPATH
    }
    
    download.image(options).then((result)=>{
      var filename = result.filename.substr(24, result.filename.length - 1 );
      var oldpath = result.filename;
      var newpath = SAVEPATH + filename;
      console.log ('La nueva ruta donde guardar antes de guardar: ' + newpath)
      fs.rename(oldpath, newpath, (err)=>{
        if (err) throw err;

        if (err){
          reject(err)
          console.log('Dentro del if del error downloadAndSav');
          console.log(err);
        }else {
          console.log('El valor de Flag antes del switch en downloadAndSave es : '+ flag);
          resolver (newpath);
        }

      });
     
    }).catch((err)=>{
      console.log("download error:")
      console.log(err)
    });
  });
  // console.log ('La nueva ruta de guardar depues de guardar:' + pathSave)
  
}

function existsImage(pathImage) {
  return new Promise(function (resolver, reject) {
    
    let flag = 9;
    console.log ('La ruta para ver si existe la imagen es:      '+pathImage)
    fs.stat(pathImage, (err, stat)=>{
      
      if (err == null){
        console.log('File exixts');
        flag = 0;
        console.log('el valor del flag en existsImage es: ' + flag);
      }else if (err.code == 'ENOENT') {
        console.log('File NO exists')
        flag = 1;
      }else{
        console.log('Some other error', err.code);
        flag  = 2;
      }
      if (err && flag > 3 ){
        reject(err)
        console.log('Dentro del if del error existsImage');
        console.log(err);
      }else {
        console.log('El valor de Flag antes del switch en existsImage es : '+ flag);
        resolver (flag);
      }
    });
  });
  
}

app.listen (8082)

  console.log ('listeting on port 8082')