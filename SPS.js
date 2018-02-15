var espress =  require('express');
var app = espress();
var path = require('path');
var bodyParser = require('body-parser');
const https = require('https');


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
  
  https.getJSON(url, (data)=>{
      if (parseInt(data.totalHits)>0)
        https.each(data.hits, (i, hit)=>{
            console.log(hit.pageURL);
        });
       else
        console.log('NOOOOOOOOOOO') 
  })

//   res.send(url);
})

app.listen (8082)

  console.log ('listeting on port 8082')