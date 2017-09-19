
"use strict";

const request = require("supertest");
const expect = require("chai").expect;
const app = require("../services/api.js").createApp(
    { session: require("express-session")({ secret: "testing"}) }
);

const q = require("../services/queue");

let server;
let agent;
const username = "project_username";
const password = "project_username";
//const modelName = encodeURIComponent("model1");
let modelId = "2d4a6208-6847-4a25-9d9e-097a63f2de93";

function before() {

    return new Promise( (resolve, reject) => {

        server = app.listen(8080, function () {
            console.log("API test server is listening on port 8080!");

            agent = request.agent(server);

            agent.post("/login")
            .send({ username, password })
            .expect(200, function(err, res){
                expect(res.body.username).to.equal(username);
                resolve(err);
            });
        
        });

    });

}

// function addModel() {
//     return new Promise( (resolve, reject) => { 
        
//         const modelData = {
//             desc: "A test model",
//             project : "",
//             type: "Architecture",
//             unit: "cm",
//             code: "00123"
//         };
        

//         agent.post("/" + username + "/" + modelName)
//         .send(modelData)
//         .end(function(err, res) {
//             //console.log("Response:", res);
//             if (res.body.model) {
//                 modelId = res.body.model;
//                 agent.post("/" + username + "/" + modelId + "/upload")
//                 //.field("extra_info", "{"in":"case you want to send json along with your file"}")
//                 .attach("file", "./benchmark/data/House.ifc")
//                 //.field("model", modelName)
//                 .end(function(err, res) {
//                     console.log("addModel upload model", err, res);
//                     //res.status(200); // "success" status
//                     resolve();
//                 });

//             } else {
//                 reject(err);
//             }
          
//         });

//     });
// }

function benchmarkModels(){
    
    return new Promise( (resolve, reject) => { 
            
        const iterations = 1;
        
        const startIncludingAssets = new Date();
        agent.get(`/${username}/${modelId}/revision/master/head/unityAssets.json`)
        .end(function(err, res) {
            //console.log("benchmarkModels - unityassets.json -", err, res);
            const start = new Date();
            const promises = [];
            res.body.models.forEach((model) => {
                model.assets.forEach( (asset) => {
                    console.log(asset);
                    promises.push(
                        agent.get(asset)
                    );
                });
            });

            const end = new Promise( (resolveAll, rejectAll) => { 
                let i = 0;
                promises.forEach(function(promise){
                    promise
                    .then(function(res){
                        i++;
                        console.log("Chunk " + i, ((new Date() - start) / iterations) + " milliseconds"); 
                        if (i === promises.length) {
                            resolveAll();
                        }
                    })
                    .catch(function(err){
                        i++;
                        console.log("Chunk " + i, ((new Date() - start) / iterations) + " milliseconds"); 
                        if (i === promises.length) {
                            resolveAll(err);
                        }
                        //console.log("Something went wrong", err)
                    });
                });
            });

            end.then(() => {
                const finish =  new Date();
                console.log("Get 1 model ", ((finish - start) / iterations) + " milliseconds"); 
                console.log("Get 1 model, including assetJson : ", ((finish - startIncludingAssets) / iterations) + " milliseconds");  
                resolve();
            })
            // .catch((error) =>{
            //     console.log("end error: ", Object.keys(error));
            // });
        });
        
        
    
    });
}

function after(){
    
   // agent.delete("/" + username + "/" + modelId).end((err, res) => {
        if (q.channel) {
            console.log("After: Purging queue");
            q.channel.assertQueue(q.workerQName, { durable: true }).then(() => {
                return q.channel.purgeQueue(q.workerQName);
            }).then(() => {
                q.channel.assertQueue(q.modelQName, { durable: true }).then(() => {
                    return q.channel.purgeQueue(q.modelQName);
                }).then(() => {
                    server.close(function(){
                        console.log("API test server is closed");
                        process.exit(0);
                    });
                });
            });
        } else {
            server.close(function(){
                console.log("After: No queue to purge");
                console.log("API test server is closed");
                process.exit(1);
            });
        }
   // });

}

before()
.then(() => {
    //addModel().then(() => {
    benchmarkModels()
    .then((res) => {
        console.log("Benchmark finished succesfully, shutting down");
        after();
    })
    .catch((err) => {
        console.log("Benchmarking failed", err);
        after();
    });
   // });
});
