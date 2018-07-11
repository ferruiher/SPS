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

module.exports = {}

const URL = "http://192.168.1.106:8010/picly";
const SAVEPATH = config.paths.FILEPATH;

//ArrayShortResquestid = ['BJ88NxAjx7','SkvUExColm','SkOLVeCse7','SkYLNxCjem','SycLNeCjg7','SJoI4lCjlQ','BJ3L4eAslX' ];

function downloadImage(shortResquestid) {
    return new Promise((resolve, reject)=>{
        var options = {
            url: URL+'/'+shortResquestid,
            dest: SAVEPATH
        }
        download.image(options).then((result)=> {
            console.log ("Foto descargada: "+result.filename);
            resolve (result);

        }).catch ((err)=>{
            console.log(err);
        })
    });
}

function multiDownloadImage (arrayShortResquestid) {
    return new Promise((resolve, reject)=>{
        let promisesDown = [];

        arrayShortResquestid.forEach(shortResquestid =>{
            promisesDown.push(downloadImage(shortResquestid));
        });

        Promise.all(promisesDown).then((res)=>{
            resolve(res);
        }).catch((err)=> {
            console.log(err);
        });
    });
}
module.exports.multiDownloadImage = multiDownloadImage;
 
// multiDownloadImage(ArrayShortResquestid).then((res)=>{
//     console.log (res);
// }).catch((err)=>{
//     console.log(err);
// });
