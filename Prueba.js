var config = require ('./config');
var fs = require("fs");
var request = require("request");
var _ = require("lodash");

var TOKEN = "";
var UPLOADID = "";
var IMAGEID = "";
var ARRAYIMAGEID = [];
var ARRAYFILENAME = [];
var ARRAYSHORTREQUESTID = [];

const URLNEWUPLOAD = "http://192.168.1.106:8010/piclyapi/newupload";
const URLNEWCHUNK = "http://192.168.1.106:8010/piclyapi/newchunk";
const URLCOMPLETEUPLOAD = "http://192.168.1.106:8010/piclyapi/completeupload";
const URLGETTOKEN = "http://192.168.1.106:8010/piclyapi/gettoken";
const URLCREATEPICLY = "http://192.168.1.106:8010/piclyapi/createpicly";
const APIKEY = "5bce0884a5cdd974e47f9e65a8e5dfc0be0f2c89";
const FILESPATH = config.paths.SAVEPATH

function startUpload(file){
    return new Promise((resolve, reject) => {
        file.token = TOKEN;
        console.log("Request new upload")
        request({
            url: URLNEWUPLOAD,
            method: "POST",
            json: true,
            body: file
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

function sendChunks(file){
    return new Promise((resolve, reject) => {
        console.log ("file in sendChunks");
        console.log(file);
        var fileBytes = fs.readFileSync(FILESPATH + file.filename);
        console.log ("fileBytes -----------------------");
        console.log (fileBytes);
        var chunks = _.chunk(fileBytes, 1000);

        console.log(`Sending chunks, ${chunks.length} in total`);
        //console.log ("Chunks in sendChunks is");
        //console.log (chunks);

        var promises = [];
        var chunkNumber = 0;
        chunks.forEach((chunk)=>{
            let chunkSize = chunk.length; 
            promises.push(sendOneChunck(UPLOADID ,chunk, chunkNumber, chunkSize))
            chunkNumber++;
            console.log("trozo enviado "+ chunkNumber);
            console.log(chunk);  
        })
        Promise.all(promises).then(()=>{
            resolve()
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
            uploadid: UPLOADID
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
                resolve();
            }
        });
    });
}

function completeUpload(uploadid){
    return new Promise((resolve, reject) => {
        var jsonobject = {
            token: TOKEN,
            uploadid: UPLOADID
        }

        console.log("Complete upload");

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


function createRequest(IMAGEID) {
    return new Promise ((resolve, reject)=>{
        var headers = {
            'x-access-token': TOKEN
        }

        console.log("createResquest");
        console.log ("imagenId es: "+ IMAGEID);

        request ({
            url: 'http://192.168.1.106:8010/request/bw/'+IMAGEID,
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

function createPicly(IMAGEID) {
    return new Promise ((resolve, reject)=>{
        var jsonobject = {
            token: TOKEN,
            request: '/bw/'+IMAGEID
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

var files = fs.readdirSync(FILESPATH);
//console.log("files");
//console.log(files);
var numFiles = files.length;
console.log("numero de files:"+numFiles);

var filestat = fs.statSync(FILESPATH + files[0]);
var file = {
    filename: files[0],
    filesize: filestat.size
}
console.log ("el nombre del fichero es " + file.filename);
console.log ("el tamaño del fichero es " + file.filesize); 

getToken().then((body)=>{
    TOKEN = body.token

    console.log("Token: ", TOKEN);

    return startUpload(file);
}).then((uploadid)=>{
    UPLOADID = uploadid;

    console.log("UploadId after startupload: ", UPLOADID);

    console.log("file before sendChunks", file);

    return sendChunks(file);
}).then(()=>{
    console.log("All chunks send");

    return completeUpload();
}).then((image)=>{
    console.log("Image Uploaded: ",image);
    console.log("ImagenID es:"+ image.imageid);

    IMAGEID = image.imageid;
    ARRAYIMAGEID.push(image.imageid);
    ARRAYFILENAME.push(image.filename);

    return createRequest (IMAGEID);
}).then((response)=>{
    console.log("createRequestResult: " + response.statusCode);

    return createPicly (IMAGEID);
}).then((picly)=>{
    console.log( picly);

    ARRAYSHORTREQUESTID.push(picly.shortrequestid);

    // console.log("this is an array of imageId: "+ ARRAYIMAGEID);
    // console.log("this is an array of fileNanes: "+ARRAYFILENAME);
    // console.log("this is an array of shortRequestId: "+ARRAYSHORTREQUESTID);

}).catch((err)=>{
    console.log(err);
});
