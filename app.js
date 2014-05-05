
/**
 * Module depencies.
 */
var express = require("express");
var path = require("path");
var router = require("./routes/router.js");
var db = require("./routes/controllers/database.js");
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var sanitizer = require("./routes/controllers/sanitizer.js");
var crypto = require("crypto");
var fs = require("fs");
var ObjectID = require('mongodb').ObjectID;
var async = require("async");
var mongodb = require("mongodb");
var MongoClient = require("mongodb").MongoClient;
var Server = require("mongodb").Server;
var Db = require("mongodb").Db;
var app = express();
var _db;
var _ = require("underscore");
var Grid = mongodb.Grid;

//put in for future https support
var options = {
	"key": fs.readFileSync("privatekey.pem"),
	"cert": fs.readFileSync("certificate.pem")
};

// all environments
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.logger("dev"));
app.use(express.json());
app.use(express.cookieParser("test"));
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
	MongoClient.connect("mongodb://127.0.0.1:27017/KindaRight", function (err, db) {
	    	if (err) {
	    		throw err;
	    	}
	    	_db = db;
	    	next();
	    });
});

//Used for establishing session support
passport.use(new LocalStrategy({
	"usernameField": "Email",
	"passwordField": "Password"
},
  function(email, password, done) {
    db.find(_db, { "Email": email, "Password": password }, function (err, user, info) {
    	if (user) {
	      user.id = user._id;
	      done(err, user, "Succesfully Authenticated!");
	  	} else {
	  		done(err, null, "No User found!");
	  	}
    });
	}
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.find(_db, {"_id": id}, function (err, user) {
    done(err, user);
  });
});

// development only
if ("development" == app.get("env")) {
  app.use(express.errorHandler());
}

app.get("/", function (req, res) {
	if (req.cookies.loggedIn) {
		db.findAllPictures(_db, function (err, ids, msgIds) {
      	if (err) {
      		return res.send(500);
      	}
      	return router.route(req, res, "main", 
      	{
      		"Email": req.cookies.loggedIn.Email, 
      	 	"First_Name": req.cookies.loggedIn.First_Name, 
      	 	"Last_Name": req.cookies.loggedIn.Last_Name,
      	 	"Username": req.cookies.loggedIn.Username,
      	 	"Pictures" : ids,
      	 	"Tags": "",
      	 	"Search": false,
      	 	"Message_Ids": msgIds
      	});
      });
	} else {
		db.findAllPictures(_db, function (err, ids, msgIds) {
			return router.route(req, res, "home", {"Pictures": ids});
		});
	}
});

app.get("/create", function (req, res) {
	db.findAllPictures(_db, function (err, ids, msgIds) {
			return router.route(req, res, "home", {"Pictures": ids});
		});
});

app.post("/main", function(req, res, next) {
  passport.authenticate("local", {"session": true}, function(err, user, info) {
    if (err) { 
    	return next(err);
    }
    if (!user) { 
    	return res.redirect("/");
    }
    req.logIn(user, function(err) {
      if (err) { 
      	return next(err); 
      }
      var minute = 500000;
      res.cookie("loggedIn", {"Username": user.Username, "Email": user.Email, 
      	"First_Name": user.First_Name, "Last_Name": user.Last_Name}, {"maxAge": minute});
      db.findAllPictures(_db, function (err, ids, msgIds) {
      	if (err) {
      		return res.send(500);
      	}
      	return router.route(req, res, "main", 
      	{
      		"Email": user.Email, 
      	 	"First_Name": user.First_Name, 
      	 	"Last_Name": user.Last_Name,
      	 	"Username": user.Username,
      	 	"Pictures" : ids,
      	 	"Tags": "",
      	 	"Search": false,
      	 	"Message_Ids": msgIds
      	});
      });
    });
  })(req, res, next);
});

app.get("/main", function (req, res) {
	if (req.cookies.loggedIn) {
		db.findAllPictures(_db, function (err, ids, msgIds) {
	      	if (err) {
	      		return res.send(500);
	      	} else if (req.query && req.query.tag) {
	      		db.findAllPicturesForTag(_db, req.query.tag, function(err, tagIds, msg_Ids){
	      			if (err) {
	      				return res.send(500);
	      			} else {
	      				if (tagIds.length > 0) {
	      					return router.route(req, res, "main", 
							{
								"Username": req.cookies.loggedIn.Username, 
								"Email": req.cookies.loggedIn.Email, 
								"First_Name": req.cookies.loggedIn.First_Name, 
								"Last_Name": req.cookies.loggedIn.Last_Name,
								"Pictures": ids,
								"Tags": tagIds,
								"Search": true,
								"Message_Ids": msg_Ids
							});
	      				} else {
	      					return router.route(req, res, "main", 
							{
								"Username": req.cookies.loggedIn.Username, 
								"Email": req.cookies.loggedIn.Email, 
								"First_Name": req.cookies.loggedIn.First_Name, 
								"Last_Name": req.cookies.loggedIn.Last_Name,
								"Pictures": ids,
								"Tags": "",
								"Search": true,
								"Message_Ids": msgIds
							});
	      				}
	      			}
	      		});	      	
	      	} else {
	      		return router.route(req, res, "main", 
				{
					"Username": req.cookies.loggedIn.Username, 
					"Email": req.cookies.loggedIn.Email, 
					"First_Name": req.cookies.loggedIn.First_Name, 
					"Last_Name": req.cookies.loggedIn.Last_Name,
					"Pictures": ids,
					"Tags": "",
					"Search": false,
					"Message_Ids": msgIds
				});
	      	}
		});
	} else {
		return res.redirect("/");
	} 
});

app.get("/me", function (req, res) {
	if (req.cookies.loggedIn) {
		res.send(200, req.cookies.loggedIn);
	} else {
		res.send(404);
	}
});

app.get("/music", function (req, res) {
	return router.route(req, res, "music");
});

app.post("/create", function (req, res) {
	var User = {
		"First_Name": req.body.First_Name,
		"Last_Name": req.body.Last_Name,
		"Email": req.body.Email,
		"Username": req.body.Username,
		"Password": req.body.Password,
		"Discipline": req.body.discipline
	};

	fs.readFile(req.files.picture.path, function (err, data) {
		if (err) {
			throw err;
		} else {
	 		var grid = new Grid(_db, 'Profile_Pictures');  
	 		var buffer = new Buffer(data);
		    grid.put(buffer, {metadata:{category:'text'}, 
		    	content_type: 'image/jpeg'}, function(err, fileInfo) {
			    User.Profile_Picture = fileInfo._id;
			    db.insertIntoDB(_db, User, function(err) {
					if (err) {
						res.send(res.statusCode, {"Error": err});
						console.log(err);
					}
					db.findAllPictures(_db, function (err, ids, msgIds) {
						return router.route(req, res, "home", {"Pictures": ids});
					});
				});
	  		});
		}
	});
});

app.post("/validation", function (req, res) {
		db.checkExists(_db, req.body, function(err, acct) {
                if (err) {
                        res.send(500, {Error: "Something went wrong!"});
                        return;
                }
                res.json(200, acct);
        });
});

app.post("/logout", function (req, res) {
	req.logOut();
	res.clearCookie("loggedIn");
	res.redirect("/");
});

app.get("/logout", function (req, res) {
	res.redirect("/");
});

app.get("/search", function (req, res) {
	sanitizer.sanitizeText(req.query.term, function (query){
		db.search(_db, query, function (err, docs) {
			if (err) {
                res.send(500, {Error: "Something went wrong sanitizing text!"});
				return;
			} 
			res.json(200, docs);
		});
	});
});

app.get("/users/:userid", function (req, res) {
	if (req.cookies.loggedIn) {
		db.getUser(_db, {"Username": req.params.userid}, function (err, account) {
			var repositories = [];
			for (var key in account.Repositories) {
				repositories.push(key);
			}
			
			var imgPath = "http://localhost:3000/profile/" + account.Profile_Picture;
			router.route(req, res, "user", 
				{					
					"Profile_Picture": imgPath, 
					"Username": account.Username, 
					"First_Name": account.First_Name, 
					"Last_Name": account.Last_Name,
					"Repositories": repositories,
					"Discipline": account.Discipline
				}
			);
		});
	}
	else {
		return res.redirect("/");
	}
});

app.get("/profile/:profile_picture_id", function (req, res) {
	if (req.cookies.loggedIn) {
		var grid = new Grid(_db, 'Profile_Pictures');  
		grid.get(new ObjectID(req.params.profile_picture_id), function (err, data) {
			if (err) {
				res.send(500, {Error: "Error in finding picture"});
			} else {
				res.writeHead(200, {"Content-Type": "image/png"});
				res.write(data, "binary");
				res.end();
			}
		});
	}
	else {
		return res.redirect("/");
	}
});

app.get("/repository/create/:userid", function (req, res) {
	if (req.cookies.loggedIn && req.cookies.loggedIn.Username === req.params.userid) {
		res.render("repository");
	} else {
		return res.send(401, "You are not authorized!");
	}
});

app.post("/repository", function (req, res) {
	if (req.cookies.loggedIn) {
		if (req.files) {
				if (req.files.repo_pics && req.files.repo_pics.length)
				{
					db.useGridFS(_db, req, "repo_pics", "Repositories", true, function (err, data) {
						if (err) {
							res.send(500, err);
						} else {
							res.redirect("/users/" + req.cookies.loggedIn.Username);
						}
					});
				} else {
					db.useGridFS(_db, req, "repo_pics", "Repositories", false, function (err, data) {
						if (err) {
							res.send(500, err);
						} else {
							res.redirect("/users/" + req.cookies.loggedIn.Username);
						}
					});
				}
			} 
		} else {
			return res.redirect("/");
		}
});

app.get("/repository/content/:userid/:pictureid", function (req, res) {
	var grid = new Grid(_db, 'Repositories');  
		grid.get(new ObjectID(req.params.pictureid), function (err, data) {
			if (err) {
				res.send(500, {Error: "Error in finding picture" + err});
			} else {
				res.writeHead(200, {"Content-Type": "image/png"});
				res.write(data, "binary");
				res.end();
			}
		});
});

// app.get("/repository/view/:userid/:pictureid", function (req, res) {
// 	db.getMessages(_db, req, function (err, data) {
// 		if (err) {
// 			console.log(err);
// 			return res.send(404);
// 		}
// 		router.route(req, res, "repo_messages", {"Image": "http://localhost:3000/repository/content/"
// 			+ req.params.userid + "/" + req.params.pictureid, "Messages": data, "Creator": req.params.userid, "Creator_Link": "http://localhost:3000/users/" + req.params.userid});
// 	});
// });

app.get("/repository/:userid/:repository/:pictureid", function (req, res) {
	if (req.cookies.loggedIn) {
		db.getUser(_db, {"Username": req.params.userid}, function (err, account) {
			if (err) {
				res.send(500, {"Error": err});
			} else if (!account) {
				res.send(404, {"Error": "User not found!"});
			} else {
				if (account.Repositories[req.params.repository]) {
					db.getMessages(_db, req, function (err, data) {
						if (err) {
							console.log(err);
							return res.send(404);
						}
						router.route(req, res, "repo_messages", {"Image": "http://localhost:3000/repository/content/"
							+ req.params.userid + "/" + req.params.pictureid, "Messages": data, "Creator": req.params.userid, "Creator_Link": "http://localhost:3000/users/" + req.params.userid, "Repository": req.params.repository, "Repository_Link": "http://localhost:3000/repository/" + req.params.userid + "/" + req.params.repository});
					});
				} else {
					res.send(404, {"Error": "Picture does not exist"});
				}
			}
		})




	} else {
		return res.redirect("/");
	}

});

app.get("/repository/:userid/:repository", function (req, res) {
	if (req.cookies.loggedIn) {
		db.getUser(_db, {"Username": req.params.userid}, function (err, account) {
		if (err) {
			res.send(500, {"Error": err});
		} else if (!account) {
			res.send(404, {"Error": "User not found!"});
		} else {
			var images = [];
			var tags = [];
			var links = [];
			if (account.Repositories[req.params.repository]) {

				for (var i = 0; i < account.Repositories[req.params.repository].Pictures.length; i++) {
					images[i] = "http://localhost:3000/repository/content/" + req.params.userid + "/" + account.Repositories[req.params.repository].Pictures[i];
					links[i] = "http://localhost:3000/repository/" + req.params.userid + "/" + req.params.repository + "/" + account.Repositories[req.params.repository].Pictures[i];
				}

				for (var i = 0; i < account.Repositories[req.params.repository].tags.length; i++) {
					for (var j = 0; j < account.Repositories[req.params.repository].tags[i].length; j++) {
						tags.push(account.Repositories[req.params.repository].tags[i][j]);
					}
				}
				router.route(req, res, "view_repository", 
					{
						"Repo": images, 
						"Creator": req.params.userid, 
						"Creator_Link": "http://localhost:3000/users/" + req.params.userid, 
						"Name": req.params.repository, 
						"Tags": tags,
						"Links": links
					}
				);
			} else {
				return res.send(404, {"Error": "Repository does not exist!"});
			}
		}
	});
	} else {
		return res.redirect("/");
	}
});

app.post("/:picture_id/messages", function (req, res) {
	db.addMessage(_db, req, function (err, data) {
		if (err) {
			return console.log(err);
		}
		res.send(200);
	});
});

/*
app.get("/settings/:userid", function (req, res) {
	if (req.cookies.loggedIn) {
		db.getUser(_db, {"Username": req.params.userid}, function (err, account) {
			var imgPath = "http://localhost:3000/users/picture/" + account.Profile_Picture;
			router.route(req, res, "settings", {"Profile_Picture": imgPath, 
				"Username": account.Username, "First_Name": account.First_Name, 
				"Last_Name": account.Last_Name});
		});	
	} else {
		res.redirect("/");
	}
});

app.post("/:repo_id/messages", function (req, res) {
	db.addMessage(_db, req, function (err, data) {
		if (err) {
			return console.log(err);
		}
		res.send(200);
	});
});

app.get("/:repo_id/messages", function (req, res) {
	db.getMessages(_db, req, false, function (err, data) {
		if (err) {
			return console.log(err);
		} 
		console.log(data);
		res.send(200, {"Messages": data});
	});
});

app.get("/get/repository/:pictureid/view/:userid", function (req, res) {
	var imageToCritique = req.path.substring(0, req.path.length - 5 - req.params.userid.length);
	db.getMessages(_db, req, true, function (err, data) {
		router.route(req, res, "repo_messages", {"Image": imageToCritique, "Messages": data, "Creator": req.params.userid});
	});
});

// app.post("/update", function (req, res) {
// 	if (req.cookies.loggedIn) {
// 		db.updateUser(_db, req, function (err, updatedCount) {
// 			if (err) {
// 				res.send(500, {Error: "Error in finding picture"});
// 			} else {
// 				res.redirect("/");
// 			}
// 		});
// 	} else {
// 		res.redirect("/");
// 	}
// });
*/

//starts the server
app.listen(app.get("port"), function() {
	console.log("Server is listening on port: " + app.get("port"));
});
