"use strict"
var config = require ('./config');
var fs = require("fs");
var request = require("request");
var _ = require("lodash");

const APIKEY = "1be857e921ea3d4f5711fa096029a644434425e4";
const URLGETTOKEN = "http://localhost:5053/piclyapi/gettoken";
const URLDELETEIMAGE = "http://localhost:5053/piclyapi/deleteImage";

var ArrayImageId = [ 'ryLCMe6gX','S1xICMlag7','B1ZI0GlTlm','BJf8Aze6gm','SkVL0MxTxX','BJXUCGeTgX','rJrIRze6lQ' ];
var TOKEN = "";

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

function deleteImage(token, imageid){
    return new Promise((resolve, reject) => {
        console.log ("el imageid es: "+imageid);
        let jsonobject = {
            token: TOKEN,
            imageid: imageid
        }

        console.log("deleteImage")

        request({
            url: URLDELETEIMAGE,
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

function deleteImages (token, imagesIds) {
    return new Promise((resolve, reject)=>{
        let promisesdelete =[];
        imagesIds.forEach(imageid => {
            promisesdelete.push(deleteImage(token, imageid));
        });
        Promise.all(promisesdelete).then((res)=>{
            resolve (res);
        }).catch((err)=> {
            console.log(err);
        });
    });
}

getToken().then((body)=>{
    TOKEN = body.token

    console.log("Token: ", TOKEN);

    return deleteImages( TOKEN, ArrayImageId);
}).then((result)=>{
    console.log( result);

}).catch((err)=>{
    console.log(err);
});
