$(document).ready(function(event) {

	$("#logOutButton").click(function (event) {
		$("#logout").submit();
	});

  $( "#searchbar" ).autocomplete({
        minLength: 1,
        source: "/search",
        select: function (event, ui) {
          window.location.href="/users/" + ui.item.Username;
        },
        response: function (event, ui) {
          //sweet hack :)
          if (ui.content.length === 0) {
            ui.content[0] = null;
          }
        }
      })
      .data( "ui-autocomplete" )._renderItem = function( ul, item ) {
          if (item) {
            return $( "<li>" )
              .append( "<a>" + item.Username + " " + item.First_Name + " " + item.Last_Name + ", Email: " + item.Email + "</a>" )
              .appendTo( ul );
            } else {
              return $( "<li>" )
              .append( "<a>" + "User not found!" + "</a>" )
              .appendTo( ul );
            }
      };
});