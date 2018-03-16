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

const FILEPATH = config.paths.FILEPATH;
const SAVEPATH = config.paths.SAVEPATH;


app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use (function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Header", "Origin, X-Requested-with, Content-Type, Accept");
    next();
})

app.post ('/post/search' ,(req,res)=>{
    var rec = req.body.word;
    var apiKey = config.pixabay.apiKey
    var numPage = config.pixabay.numPag
    var numImagePage = config.pixabay.numImagePage
    console.log('El numero de imagenes por pagina: ' + numImagePage)
    var url = 'https://pixabay.com/api/?key=' +apiKey+ '&q=' +rec + '&image_type=all&per_page='+numImagePage ;
    
    console.log('La palabra de busqueda es: ' + rec);
    // console.log('la urle es: ' + url);
    
    request(url, (error,response,body)=>{
      
      var picJsons = JSON.parse(body);
      var viewJsonArray = [];
      //var picArray = [];
    //   console.log(picJsons);
      
      if (parseInt(picJsons.totalHits) > 0){
        var i = 0;
        
        picJsons.hits.forEach(element => {
          viewJsonArray.push({ previewUrl: picJsons.hits[i].previewURL, id: picJsons.hits[i].webformatURL });
          i++
        });
        console.log('Imagenes Buscadas y mostradas en el Array, son: ' + i);
      }
      else
        console.log ('Noooo pictures');
      
      // console.log(picArray);
      res.jsonp({results: viewJsonArray})
    })
    
  })

app.post('/post/download', (req, res)=>{
 
  
    var downloadUrl = req.body.ids;
    var urldownload = SelectStringOrArrys(downloadUrl);
    console.log('la url antes del metodo downlaodAndSave: ' + urldownload);
    downloadAndSave(urldownload,FILEPATH).then((savePath)=>{
      return renamePath(savePath);
    }).then((savePath)=>{
      return existsImage(existsPath);
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
  
    // console.log (downloadUrl);
  console.log ("---------------------");
     
})

function SelectStringOrArrys(StringArrays) {
  
    var strinToArray = [];
    if (typeof StringArrays === 'string'){
      console.log("Es un String en la function SelectStringOrArrys");
      strinToArray.push(StringArrays);
      return strinToArray;
      console.log('de string to array: '+ strinToArray);
    }else {
      console.log("Es un Array en la function SelectStringOrArrys" + StringArrays);
      return StringArrays;
    }
   
}
  
function downloadAndSave(pathForElement,FILEPATH) {
    return new Promise( function (resolver, reject) {
      var savePath = [];
      var downloadPromise = [];
      let ds = 0;
      let ds1 = 0;
      pathForElement.forEach(element =>{

        let flag = 5;
        var newpath = '';
        var options = {
          url: element,
          dest: FILEPATH
        }
        downloadPromise.push( download.image(options));
        ds ++;
        console.log('en downloadAndSave, el número de elemetos en foreach son: ' + ds); 
      }); //Fin de foreach
      Promise.all(downloadPromise).then((res) =>{
        //resolver (savePath);
        console.log ('dentro del Promise.all');

        res.forEach(result=>{  
          ds1++;
          savePath.push(result.filename);
          console.log('El path del elemento en tem es:' + result.filename );
          console.log('en downloadAndSave, el número de elemetos en foreach1 son: ' + ds1);
          
        });//foreach1
        console.log ('en downloadAndSave, los paths antes de mandar son: ' + savePath);
        resolver(savePath);
      }).catch((err)=>{
        console.log(err);
      });//Promise.all 
  });// fin de Promise
}// fin function

function renamePath(ArrayPath) {
  return new Promise (function (resolver, reject) {
    existsPath = []
    console.log('En renamePath, el array de estrada es: ' + ArrayPath);
    ArrayPath.forEach(result=>{  
      console.log('En renamePath, el path del elemento en tem es:' + result);
      var filename = result.substr(24, result.length - 1 );
      var oldpath = result;
      var newpath = SAVEPATH + filename;
      console.log ('La nueva ruta donde guardar antes de guardar: ' + newpath)
      fs.renameSync(oldpath, newpath);
      existsPath.push(newpath);
      
    });//foreach
    resolver(existsPath)
  })// fin del Promise
}// fin de Function

function existsImage(pathImage) {
    return new Promise(function (resolver, reject) {
      
      var flags = [0];
      let flag = 9;
      pathImage.forEach(element =>{

        console.log ('La ruta para ver si existe la imagen es:      '+pathImage)
        try {
          fs.statSync(element);//, (err, stat)=>{
          flags.push(0);
          console.log('File exixts');
          console.log('el valor del flags en existsImage es: ' + flags);
          
        } catch (error) {
          console.log('File NO exists')
          flags.push(1);
        }          
      });//foreach
      let suma = 0;
      flags.forEach(num =>{
        suma +=num;
        console.log('El valor de la suma dentro del foreach en existsImage es : '+ suma);
      });
      if (suma == 0){
        flag = suma;
        console.log('El valor de Flag despues del switch en existsImage es : '+ flag);
        resolver (flag);
        
      }else {
        reject(err)
        console.log('Dentro del if del error existsImage');
        console.log(err);
      }
    });
    
}

app.listen (config.server.portUI)
  console.log ('listeting on port: '+ config.server.portUI);