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
	} else if (webpage === "settings") {
		res.render("settings", options);
	} else if (webpage === "view_repository") {
	// } else if (webpage === "music") {
		res.render("view_repository", options);
	} else if (webpage === "repo_messages") {
		res.render("repo_messages", options);
	} else if (webpage === "music") {
		res.render("music", options);
	} else {
		res.render("not_found");
	}

	if (callback)
	{
		callback();
	}
}

module.exports.route = route;

