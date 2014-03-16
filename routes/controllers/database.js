var bcrypt = require("bcrypt");
var async = require("async");
var Grid = require("mongodb").Grid;
var fs = require("fs");
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
			account.Repositories = {};
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

function updateUser(db, req, callback) {
	parseBody(req, function (err, updatedObject) {
		if(!isEmpty(updatedObject)) {
			var args = {
		        'query'     : { Username: req.body.Username }, //getId() returns empty string if not set
		        'update'    : { $set : updatedObject},
		        'new'       : true,
		    };
			db.collection("Users").findAndModify(args, callback);
		}
	});
}

function parseBody(req, callback) {
	var updatedObject = {};
	if (req.body.update_email && req.body.update_email.length > 0) {
		updatedObject.Email = req.body.update_email;
	}
	if (req.body.passwordinput && req.body.passwordinput.length > 0) {
			bcrypt.genSalt(3, function (err, salt) {
				bcrypt.hash(account.Password, salt, function(err, hashedPassword) {
					if (err) {
						return callback("Error in updated password!");
					}
					updatedObject.Password = hashedPassword;
				});
			});
	}
	// if (req.files.update_profile.size > 0) {
	// 	fs.readFile(req.files.update_profile.path, function (err, data) {
	// 		if (err) {
	// 			throw err;
	// 		} else {
	// 	 		var grid = new Grid(_db, 'Users');  
	// 	 		var buffer = new Buffer(data);
	// 		    grid.put(buffer, {metadata:{category:'text'}, content_type: 'image/jpeg'}, function(err, fileInfo) {
	// 			    if(err) {
	// 			      return callback("Error in updated profile picture!");
	// 			    }
	// 			    updatedObject.Profile_Picture = fileInfo._id;
	// 	  		});
	// 		}
	// 	});
	// }
	return callback(null, updatedObject);
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function findAndModify(db, query, repo_name, data, callback) {
	var setModifier = { $push: {} };
	setModifier.$push["Repositories." + repo_name] = data;
	db.collection("Users").findAndModify(query, null, setModifier, callback);
}

function useGridFS(db, req, fileName, gridName, isArray, callback) {
	if (isArray) {
		var array = [];
		for (var i = 0; i < req.files[fileName].length; i++) {
			array[i] = req.files[fileName][i].path;
		}
		async.eachSeries(
		    array, function (item, next) {
		    	fs.readFile(item, function(err, data) {
			        if (!err) {
			          	var grid = new Grid(db, gridName);  
				 		var buffer = new Buffer(data);
					    grid.put(buffer, {metadata:{category:'text'}, content_type: 'image/jpeg'}, function(err, fileInfo) {
					    	if (err) {
					    		return next(err);
					    	}
						    findAndModify(db, {"Username": req.cookies.loggedIn.Username}, req.body.repo_name, fileInfo._id, next);
				  		});
			        }
			    });
		    }, function (err) {
		    	callback(err);
		    });
	} else {
		fs.readFile(req.files[fileName].path, function (err, data) {
			var grid = new Grid(db, req.body.repo_name);  
	 		var buffer = new Buffer(data);
		    grid.put(buffer, {metadata:{category:'text'}, content_type: 'image/jpeg'}, function(err, fileInfo) {
		    	if (err) {
		    		return callback(err);
		    	} 
			    findAndModify(db, {"Username": req.cookies.loggedIn.Username}, req.body.repo_name, fileInfo._id, callback);
	  		});
		});
	}
}

function getRepositoryPictures(db, req, gridName, callback) {
	getUser(db, {"Username": req.params.userid}, function (err, account) {
		if (err) {
			callback(err);
		} else if (!account) {
			callback("No account found with the requested username!");
		} else {
			for (var key in account.Repositories) {
				
			}
		}
	})
}

module.exports.insertIntoDB = insertIntoDB;
module.exports.checkExists = checkExists;
module.exports.find = find;
module.exports.getUser = getUser;
module.exports.search = search;
module.exports.updateUser = updateUser;
module.exports.findAndModify = findAndModify;
module.exports.useGridFS = useGridFS;