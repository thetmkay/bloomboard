var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

var saveBoard = function(boardData) {

      MongoClient.connect("mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387", function(err, db) {
        var collection = db.collection('boards');

        var secondsBefore = new Date().getTime() / 1000;

        collection.update({name: "testBoard2"},
                          {$set: {Data: boardData }}, {safe:true},
                          function(err, doc) {
            if(err) {
                console.error(err);
            }

            var secondsAfter = new Date().getTime() / 1000;
            console.log("Save took ", (secondsAfter - secondsAfter), "seconds");

            collection.find({}).toArray(function(err, docs) {
                if(err){
                    console.error(err);
                }
                docs.forEach(function(doc) {
                })
            })
        })

      })
  };

  var getBoard = function(boardName, callback) {
    MongoClient.connect("mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387", function(err, db) {
        var secondsBefore = new Date().getTime() / 1000;

        var collection = db.collection('boards');
        collection.findOne({name:"testBoard2"}, function(err, doc) {
            if(err) {
                console.error(err);
            }
            var secondsAfter = new Date().getTime() / 1000;
            console.log("Load took ", (secondsAfter - secondsAfter), "seconds");
            callback(doc);
        })
    })
  };

  exports.saveBoard = saveBoard;
  exports.getBoard = getBoard;