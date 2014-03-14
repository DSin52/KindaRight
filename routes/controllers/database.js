// var MongoClient = require("mongodb").MongoClient;
// var Server = require("mongodb").Server;
// var Db = require("mongodb").Db;
var bcrypt = require("bcrypt");
var async = require("async");

// var mongoDB = null;

// function connectToDB(callback) {

//     if(mongoDB) {
//       callback(null, mongoDB);
//       return;
//     }

//     MongoClient.connect("mongodb://127.0.0.1:27017/KindaRight", function (err, db) {
    	
//     	if (err) {
//     		throw err;
//     	}

//     	mongoDB = db.collection("Users");
//     		if (err) {
//     			throw err;
//     		}
//     		callback();
//     });
// }

// function closeDB(callback) {
// 	mongoDB.close();
// 	mongoDB = null;
// }

function insertIntoDB(db, account, done) {

	async.waterfall([
		function (callback) {
			db.collection("Users").findOne({Email: account.Email}, callback);
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
			db.collection("Users").insert(account, callback);
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

function checkExists(db, account, callback) {
	
	db.collection("Users").findOne(account, function (err, acct) {

		var verification = {
			exists: false
		};

		if (acct) {
			verification.exists = true;
		}

		callback(err, verification);
	});
}

function find(db, query, callback) {
	async.waterfall([
		function (next) {
			db.collection("Users").findOne({"Email": query.Email}, next);
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

function getUser(db, query, callback) {
	db.collection("Users").findOne(query, callback);
}

function search(db, query, callback) {
	var projection = {
		"First_Name": true,
		"Last_Name": true,
		"Email": true,
		"Username": true,
		"_id": false
		};		
	db.collection("Users").find(query, projection).toArray(callback);
}

module.exports.insertIntoDB = insertIntoDB;
module.exports.checkExists = checkExists;
module.exports.find = find;
module.exports.getUser = getUser;
module.exports.search = search;
