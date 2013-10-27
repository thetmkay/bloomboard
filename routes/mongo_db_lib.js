var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

var saveBoard = function(boardData) {

      MongoClient.connect("mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387", function(err, db) {
        var collection = db.collection('users');
        console.log('inserting documents...');
        collection.insert([{Name: "Phil Jones", Password: "saf"}], function(err, doc) {
            if(err) {
                console.error(err);
            }
            console.log("just inserted ", docs.length, "documents");
            collection.find({}).toArray(function(err, docs) {
                if(err){
                    console.error(err);
                }
                docs.forEach(function(doc) {
                    console.log("found doc: " + doc)
                })
            })
        })

      })
  }