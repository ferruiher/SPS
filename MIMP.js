"use strict"
var config = require ('./config');
var download = require('./Download.js');
var fs = require("fs");
var request = require("request");
var _ = require("lodash");
var express = require ('express');
var app = express();
var bodyParser = require('body-parser');


var TOKEN = "";
var plugins = "bw";
var ARRAYIMAGEID = [];
var ARRAYFILENAME = [];
var ARRAYSHORTREQUESTID = [];
var numFiles = "";
var numPiclys = "";

const URLNEWUPLOAD = "http://192.168.1.106:8010/piclyapi/newupload";
const URLNEWCHUNK = "http://192.168.1.106:8010/piclyapi/newchunk";
const URLCOMPLETEUPLOAD = "http://192.168.1.106:8010/piclyapi/completeupload";
const URLGETTOKEN = "http://192.168.1.106:8010/piclyapi/gettoken";
const URLCREATEPICLY = "http://192.168.1.106:8010/piclyapi/createpicly";
const APIKEY = "5bce0884a5cdd974e47f9e65a8e5dfc0be0f2c89";
const FILESPATH = config.paths.SAVEPATH 

app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use (function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //res.header("Access-Control-Allow-Header", "Origin, X-Requested-with, Content-Type, Accept");
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
})

app.post('/post/token', (req, res)=>{
 

    getToken().then((body)=>{
        TOKEN = body.token
    
        console.log("Token: ", TOKEN)

        res.json({token: TOKEN})
            
        }).catch((err)=>{
            console.log(err);
        });
})
     

app.post('/post/upload', (req, res)=>{
 
    //console.log(req.body);
   // var myObject = JSON.parse(req.body[0].filename);  
    var filename = req.body.filename;
    console.log("filename");
    console.log(filename);
    
    var filebinary = req.body.filebinary;  
    //console.log("filebinary");
    //console.log(filebinary);
    var filebinaryArray = filebinary.split(' ');
    var filebinaryArraySend =strintToHex(filebinaryArray);
    
    // console.log("filebinaryArraySend");
    // console.log(filebinaryArraySend);

    var filebinaryBuffer = Buffer.from(filebinaryArraySend);
    var filesize = filebinaryBuffer.length;
    console.log("filesize") ;
    console.log (filesize)
    console.log("filebinaryBuffer"); 
    console.log(filebinaryBuffer);
    

    getToken().then((body)=>{
            TOKEN = body.token;
            console.log("Token: ", TOKEN);

            return startUpload(filename, filesize);
        }).then((uploadid) =>{
            var uploadid1 = uploadid;
            console.log("uploadid before sendChunks: ", uploadid1);

            return sendChunks(uploadid1, filebinaryBuffer);
        }).then((uploadid)=>{
            var uploadid2 = uploadid;
            console.log("uploadid after sendChunks and before CompleteUpload: ", uploadid2);

            return completeUpload(uploadid2);
        }).then((result)=> {
            console.log (result);

            res.json({responses: 'Images is download ok'})
            
        }).catch((err)=>{
            console.log(err);
        });
    
    // res.json({responses: 'Images is download ok'})
})


function strintToHex(array) {
    var filebinaryArraySend =[];
    array.forEach( (e)=>{
        // console.log("elemento: ");
        // var element = e
        // console.log(element);
        var elementN = parseInt(e, 16);
        // console.log("Ellemento parseado");
        // console.log(elementN);
        //element = "0x"+element;
        filebinaryArraySend.push(elementN);
    });
    return filebinaryArraySend
}


function startUpload(filename, filesize){
    return new Promise((resolve, reject) => {
        var jsonobject = {
            token: TOKEN,
            filename: filename,
            filesize: filesize
        }

        console.log("Request new upload")

        request({
            url: URLNEWUPLOAD,
            method: "POST",
            json: true,
            body: jsonobject
        }, (err, response, body)=>{
            if(!!err){
                reject(err);
            }else{
                resolve(body.uploadid);
            }
        });
    });
}

function getToken(){
    return new Promise((resolve, reject) => {
        let jsonobject = {
            APIKey: APIKEY
        }

        console.log("Get Token")

        request({
            url: URLGETTOKEN,
            method: "POST",
            json: true,
            body: jsonobject
        }, (err, response, body)=>{
            if(!!err){
                reject(err);
            }else{
                resolve(body)
            }
        });
    });
}

function sendChunks(uploadid, filebinary){
    return new Promise((resolve, reject) => {
        //var fileBytes = fs.readFileSync(FILESPATH + "1147097.jpg");
        
        var uploadidS = uploadid;
        console.log("uploadid in sendChunks : ", uploadidS);
        console.log("filebinary llegado en sendChunk");
        //console.log(filebinary);
        var chunks = _.chunk(filebinary, 1000);

        console.log(`Sending chunks, ${chunks.length} in total`);

        var promises = [];
        var chunkNumber = 0;
        chunks.forEach((chunk)=>{
            let chunkSize = chunk.length;
            //var chunkSend = 
            promises.push(sendOneChunck(uploadidS, chunk, chunkNumber, chunkSize))
            chunkNumber++;
            //  console.log("trozo enviado "+ chunkNumber);
            //  console.log(chunk);  
        })
        Promise.all(promises).then(()=>{
            resolve(uploadidS)
        });
    });  
}

function sendOneChunck(uploadid, chunk, chunkNumber, chunkSize){
    return new Promise((resolve, reject) => {
        var jsonobject = {
            token: TOKEN,
            chunkBuffer: chunk,
            chunkNumber: chunkNumber,
            chunkSize: chunkSize,
            uploadid: uploadid
        };

        request({
            url: URLNEWCHUNK,
            method: "POST",
            json: true,
            body: jsonobject
        }, (err, response, body)=>{
            if(!!err){
                reject(err);
            }else{
                resolve(body);
                console.log("Respuesta del trozo enviado");
                console.log(body);
            }
        });
    });
}

function completeUpload(uploadid){
    return new Promise((resolve, reject) => {
        var jsonobject = {
            token: TOKEN,
            uploadid: uploadid
        }

        console.log("uploadid in CompleteUpload:")
        console.log(jsonobject.uploadid);
        console.log("Complete upload")
 
        request({
            url: URLCOMPLETEUPLOAD,
            method: "POST",
            json: true,
            body: jsonobject
        }, (err, response, body)=>{
            if(!!err){
                reject(err);
            }else{
                resolve(body); 
            }
        });
    });
}

function uploadFile(filesize){
    return new Promise((resolve, reject) => {
        //var filestat = fs.statSync(filename);

        console.log("Start upload ", filename)

        // var file = {
        //     filename: filename,
        //     filesize: filestat.size
        // }

        var upladticket;

        startUpload(filesize).then((uploadid)=>{   
            console.log("Get ticket: ", uploadid)
            upladticket = uploadid;
            return sendChunks(uploadid, file);
        }).then(()=>{
            console.log("All chunks send ", filename);

            return completeUpload(upladticket);
        }).then((image)=>{
            console.log(filename, " uploaded, id: ", image)
            ARRAYIMAGEID.push(image.imageid);
            ARRAYFILENAME.push(image.filename);

            resolve();
        }).catch((err)=>{

            console.log(err);

        });

    });

}

function uploadChunkFiles(filenames){
    return new Promise((resolve, reject) => {
        let promises = [];
        filenames.forEach(file => {
            promises.push(uploadFile(file));
        });

        Promise.all(promises).then(()=>{
            resolve();
        }).catch((error)=>{
            console.error(error);
        })
    });
}

function createRequest(imageid) {
    return new Promise ((resolve, reject)=>{
        var headers = {
            'x-access-token': TOKEN
        }

        console.log("createResquest");
        console.log ("imagenId es: "+ imageid);

        request ({
            url: 'http://192.168.1.106:8010/request/'+plugins+'/'+imageid,
            method: 'Get',
            headers: headers
        }, (err,response, body)=>{
            if ( !err && response.statusCode == 200){
                resolve (response);
            }else{
                reject(err);
            }
        })
    })
    
}

function createPicly(imageid) {
    return new Promise ((resolve, reject)=>{
        var jsonobject = {
            token: TOKEN,
            request: '/'+plugins+'/'+imageid
        }

        console.log ("create picly");
        console.log ("request de createPicly: " +jsonobject.request);

        request ({
            url: URLCREATEPICLY,
            method: "POST",
            json: true,
            body: jsonobject
        },(err, response, body)=>{
            
            if (!!err) {
                reject(err);
            }else{
                resolve(body);
            }
        })
    })
    
}

function requestAndCreatePicly (imageid) {
    return new Promise ((resolve, reject)=>{
        createRequest(imageid).then(()=>{
            return createPicly(imageid).then((res)=>{
                console.log(res.statusCode);
                return createPicly(imageid).then((picly)=>{
                    ARRAYSHORTREQUESTID.push(picly.shortrequestid);
                    resolve(picly);
                }).catch ((err)=> {
                    console.log (err);
                });
            });
        });
    });
}

function requestsAndPiclys(imagesIds) {
    return new Promise ((resolve, reject)=> {
        let promisesEaP = [];
        imagesIds.forEach(imageid => {
            promisesEaP.push(requestAndCreatePicly(imageid));
        });

        Promise.all(promisesEaP).then((res)=> {
            resolve (res);
        }).catch((err)=> {
            console.log(err);
        });
    });
    
}

// var files = fs.readdirSync(FILESPATH);
// console.log(files);
// numFiles = files.length;
// console.log("numero de files: "+numFiles);


// getToken().then((body)=>{
//     TOKEN = body.token

//     console.log("Token: ", TOKEN);

//     var filenamechunks = _.chunk(files, 100);

//     filenamechunks.reduce((prev, current) =>{
//         return prev.then(()=>{
//             console.log(numFiles+" files uploaded")

//             return uploadChunkFiles(current);
//         });

//     }, Promise.resolve()).then(()=>{
//         console.log("finish");

//         console.log("los imagenes id:");
//         console.log(ARRAYIMAGEID);
//         console.log("Los nombres: "+ARRAYFILENAME);

//         return requestsAndPiclys(ARRAYIMAGEID);
//     }).then((piclys)=>{
//         console.log( piclys);
        
//         numPiclys = ARRAYSHORTREQUESTID.length;

//         console.log("ARRAYSHORTREQUESTID:");
//         console.log(ARRAYSHORTREQUESTID);
//         console.log("Números de Imagenes: "+numFiles);
//         console.log("Números de Piclys: "+numPiclys);

//         return download.multiDownloadImage(ARRAYSHORTREQUESTID);
    
//     }).then((res)=> {
//         console.log (res);
//     }).catch((err)=>{
//         console.log(err);
//     });
// })


app.listen (config.server.portUI)
  console.log ('listeting on port: '+ config.server.portUI);