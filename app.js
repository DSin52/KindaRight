
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
var async = require("async");
var app = express();

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

//middleware to attach database instance to
app.use("/validation", function (req, res, next) {
	db.connectToDB(function (error, database) {
		if (error) {
			next(error);
		}
		else {
			next();
		}
	});
});

//Used for establishing session support
passport.use(new LocalStrategy({
	"usernameField": "Email",
	"passwordField": "Password"
},
  function(email, password, done) {
    db.find({ "Email": email, "Password": password }, function (err, user, info) {
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
  db.find({"_id": id}, function (err, user) {
    done(err, user);
  });
});

app.use("/create", function (req, res, next) {
	db.connectToDB(function (error, database) {
		if (error) {
			next(error);
		}
		else {
			next();
		}
	});
});

app.use("/search", function (req, res, next) {
	db.connectToDB(function (error, database) {
		if (error) {
			next(error);
		}
		else {
			next();
		}
	});
});

// development only
if ("development" == app.get("env")) {
  app.use(express.errorHandler());
}

app.get("/", function (req, res) {
	router.route(req, res, "home");
});

app.get("/create", function (req, res) {
	router.route(req, res, "home");
});

app.post("/main", function(req, res, next) {
  passport.authenticate("local", {"session": true}, function(err, user, info) {
    if (err) { 
    	return next(err);
    }
    if (!user) { 
    	console.log(info);
    	return res.redirect("/");
    }
    req.logIn(user, function(err) {
      if (err) { 
      	return next(err); 
      }
      var minute = 500000;
      res.cookie("loggedIn", {"Email": user.Email, "First_Name": user.First_Name, "Last_Name": user.Last_Name}, {"maxAge": minute});
      return router.route(req, res, "main", 
      	{
      		"Email": user.Email, 
      	 	"First_Name": user.First_Name, 
      	 	"Last_Name": user.Last_Name
      	});
    });
  })(req, res, next);
});

app.get("/main", function (req, res) {
	if (req.cookies.loggedIn) {
		router.route(req, res, "main", {"Email": req.cookies.loggedIn.Email, "First_Name": req.cookies.loggedIn.First_Name, "Last_Name": req.cookies.loggedIn.Last_Name});
	} else {
		return res.redirect("/");
	}
});

app.get("/create", function (req, res) {
	res.redirect("/");
});

app.post("/create", function (req, res) {
	console.log("Files: " + JSON.stringify(req.files));
	console.log(req.body);
	var User = {
		"First_Name": req.body.First_Name,
		"Last_Name": req.body.Last_Name,
		"Email": req.body.Email,
		"Username": req.body.Username,
		"Password": req.body.Password
	};

	fs.readFile(req.files.picture.path, function (err, data) {
		if (err) {
			throw err;
		} else {
			User.Profile_Picture = data;
		}
	});


	db.insertIntoDB(User, function(err) {
		if (err) {
			res.send(res.statusCode);
			console.log(err);
		}
		router.route(req, res, "home");
	});
	// res.send(res.statusCode, {});
});

app.post("/validation", function (req, res) {
		db.checkExists(req.body, function(err, acct) {
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
		db.search(query, function (err, docs) {
			if (err) {
                res.send(500, {Error: "Something went wrong sanitizing text!"});
				return;
			} 
			res.json(200, docs);
		});
	});
});

app.get("/users/:userid", function (req, res) {
	router.route(req, res, "user", req.param("userid"));
});

//starts the server
app.listen(app.get("port"), function() {
	console.log("Server is listening on port: " + app.get("port"));
});
