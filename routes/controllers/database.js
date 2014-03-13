var MongoClient = require("mongodb").MongoClient;
var Server = require("mongodb").Server;
var Db = require("mongodb").Db;
var bcrypt = require("bcrypt");
var async = require("async");

var mongoDB = null;

function connectToDB(callback) {

    if(mongoDB) {
      callback(null, mongoDB);
      return;
    }

    MongoClient.connect("mongodb://127.0.0.1:27017/KindaRight", function (err, db) {
    	
    	if (err) {
    		throw err;
    	}

    	mongoDB = db.collection("Users");
    		if (err) {
    			throw err;
    		}
    		callback();
    });
}

function closeDB(callback) {
	mongoDB.close();
	mongoDB = null;
}

function insertIntoDB(account, done) {

	async.waterfall([
		function (callback) {
			mongoDB.findOne({Email: account.Email}, callback);
		},
		function (acct, callback) {
			if (acct) {
				callback(new Error("Email already exists!"));
			} else {
				callback();
			}
		},
		function (callback) {
			bcrypt.genSalt(3, callback);
		},
		function (salt, callback) {
			bcrypt.hash(account.Password, salt, callback);
		},
		function (hashedPassword, callback) {
			account.Password = hashedPassword;
			mongoDB.insert(account, callback);
		}
		],
		function (err, results) {
			if (err) {
				return done(err);
			} else {
				done(null);
			}
		});
}

function checkExists(account, callback) {
	
	mongoDB.findOne(account, function (err, acct) {

		var verification = {
			exists: false
		};

		if (acct) {
			verification.exists = true;
		}

		callback(err, verification);
	});
}

function find(query, callback) {
	async.waterfall([
		function (next) {
			mongoDB.findOne({"Email": query.Email}, next);
		},
		function (account, next) {
			bcrypt.compare(query.Password, account.Password, function (err, res) {
				next(err, account, res);
			});
		}
		],
		function (err, account, response) {
			if (response) {
				callback(err, account);
			} else {
				callback(err, null);
			}
		});
}

function search(query, callback) {
	var projection = {
		"First_Name": true,
		"Last_Name": true,
		"Email": true,
		"Username": true,
		"_id": false
		};		
	mongoDB.find(query, projection).toArray(callback);
}

module.exports.connectToDB = connectToDB;
module.exports.insertIntoDB = insertIntoDB;
module.exports.checkExists = checkExists;
module.exports.find = find;
module.exports.search = search;
