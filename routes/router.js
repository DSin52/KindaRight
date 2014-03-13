/*
* This file handles all the routing in this web application.
*/


function route(req, res, webpage, options, callback)
{
	if (webpage == null)
	{
		throw new Error("Authentication Failed!");
	}
	
	if (webpage === "home")
	{
		res.render("home", options);
	} else if (webpage === "main") {
		res.render("main", options);
	} else if (webpage === "user") {
		res.render("user", options);
	} else {
		res.render("not_found");
	}

	if (callback)
	{
		callback();
	}
}

module.exports.route = route;

