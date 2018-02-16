var espress =  require('express');
var app = espress();
var path = require('path');
var bodyParser = require('body-parser');
const https = require('https');
var request = require('request');



// app.set('views',path.join(__dirname, 'Mypexel'));
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));
app.use(bodyParser.json({ limit: '5mb' }));

app.get('/', (req, res) =>{
    res.render('home')
})

app.post ('/post/search' ,(req,res)=>{
  var rec = req.body.search;
  var apiKey = '8047832-4eb74703bfe5535846a8f3959'
  var url = 'https://pixabay.com/api/?key=' +apiKey+ '&q=' +rec + '&image_type=all';
  
  request (url, (error,response,body)=>{
    
    console.log(JSON.parse(body));
  })

//   res.send(url);
})

app.listen (8082)

  console.log ('listeting on port 8082')