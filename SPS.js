var espress =  require('express');
var app = espress();
var path = require('path');
var bodyParser = require('body-parser');
const https = require('https');
var request = require('request');
var array = require('array');


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
  console.log(req.body);
  var pepe = 'pepe';
  var download = req.body.ids;
  console.log ("---------------------");
  
  if (typeof download === 'string'){
    console.log("Es un String");
    

  }else{
    console.log("Es un ARARY");
  }
  console.log (download);
  //res.send(req.body.ids);
  // res.render('home', {results: []})
})

app.listen (8082)

  console.log ('listeting on port 8082')