var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

var saveBoard = function(boardData) {

      MongoClient.connect("mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387", function(err, db) {
        var collection = db.collection('boards');
        console.log('inserting documents...');
        console.log(boardData);
        collection.update({name: "testBoard2"},
                          {$set: {Data: boardData }}, {safe:true},
                          function(err, doc) {
            if(err) {
                console.error(err);
            }
            console.log("just inserted documents");
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
  };

  var getBoard = function(boardName, callback) {
    MongoClient.connect("mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387", function(err, db) {
        var collection = db.collection('boards');
        collection.findOne({name:"testBoard2"}, function(err, doc) {
            if(err) {
                console.error(err);
            }
            console.log("got doc: ", doc);
            callback(doc);
        })
    })
  };

  exports.saveBoard = saveBoard;
  exports.getBoard = getBoard;