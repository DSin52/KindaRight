$(document).ready(function(event) {

	$("#create_repo").click(function (event) {
		var repo_name = $("#repo_name").val();

		event.preventDefault();
		if (repo_name) {
			$("#repo_form").submit();
		} else {
			alert("Please Enter Repository Name!");
		}
	});
});