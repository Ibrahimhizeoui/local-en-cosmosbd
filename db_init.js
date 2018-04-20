var DocumentDBClient = require('documentdb').DocumentClient;
const { DocumentClient, DocumentBase } = require('documentdb');
const connectionPolicy = new DocumentBase.ConnectionPolicy();
connectionPolicy.DisableSSLVerification = true;

const config = require('./config')
const client = new DocumentClient(config.host, { masterKey: config.authKey }, connectionPolicy);

var DocDBUtils = {
    getOrCreateDatabase: function (client, databaseId, callback) {
        var querySpec = {
            query: 'SELECT * FROM root r WHERE r.id= @id',
            parameters: [{
                name: '@id',
                value: databaseId
            }]
        };

        client.queryDatabases(querySpec).toArray(function (err, results) {
            if (err) {
                callback(err);

            } else {
                if (results.length === 0) {
                    var databaseSpec = {
                        id: databaseId
                    };

                    client.createDatabase(databaseSpec, function (err, created) {
                        callback(null, created);
                    });

                } else {
                    callback(null, results[0]);
                }
            }
        });
    },
    getOrCreateCollection: function (client, databaseLink, collectionId, callback) {
        var querySpec = {
            query: 'SELECT * FROM root r WHERE r.id=@id',
            parameters: [{
                name: '@id',
                value: collectionId
            }]
        };             

        client.queryCollections(databaseLink, querySpec).toArray(function (err, results) {
            if (err) {
                callback(err);

            } else {        
                if (results.length === 0) {
                    var collectionSpec = {
                        id: collectionId
                    };

                    client.createCollection(databaseLink, collectionSpec, function (err, created) {
                        callback(null, created);
                    });

                } else {
                    callback(null, results[0]);
                }
            }
        });
    },
    getOrCreateDocument: function (client, collectionLink, initDocument, callback) {
     client.createDocument(collectionLink, initDocument, function (err, doc) {
            if (err) {
                callback(err);

            } else {
                callback(null, doc);
            }
        });
 }
}

DocDBUtils.getOrCreateDatabase(client, config.databaseId, function (err, db) {
            if (err) {
                console.log(err);
            } 
            else{
                console.log(db);
                var databaseUrl = `dbs/`+config.databaseId;
                for(collection of config.collections){
                    let collectionLink = "dbs/"+config.databaseId+"/colls/"+collection;
                    let initDocument = require("./"+collection+"_init_doc.json");   
                    DocDBUtils.getOrCreateCollection(client,databaseUrl,collection,(err, coll)=>{
                        if(err){console.log(err)}
                        else{
                            DocDBUtils.getOrCreateDocument(client, collectionLink, initDocument,(err, doc)=>{
                                if(err){
                                    if (err.code === 409) {
                                        console.log("Delete the documents fron "+collectionLink+" manually");
                                    }
                                    else{console.log(err);}
                                    
                                }
                                else{
                                    if(collectionLink == "dbs/"+config.databaseId+"/colls/patients"){
                                        const f1 = function isToday(epochTs){ return new Date(epochTs * 1000).toDateString() === new Date().toDateString();};
                                        const udfs =config.udfs;
                                        for(udf of udfs){
                                            client.createUserDefinedFunction(collectionLink,udf,(err, res)=>{
                                            if (err) {console.log(err)}

                                        });
                                        }
                                        //return doc;
                                    }
                                    return doc;
                                }
                            });
                        return coll;
                            
                        }
                    });
                }
            }
        });