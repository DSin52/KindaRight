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

    

  function showAccountButton() {
    if($.cookie().loggedIn && JSON.parse($.cookie().loggedIn.substring(2)).Username === window.location.pathname.substring(7)) {
      $("#accountButton").text("Account Settings");
      $("#accountButton").click(function (event) {
          event.preventDefault();
          alert("yes");
          window.location.href="/settings/" + JSON.parse($.cookie().loggedIn.substring(2)).Username;
      });
    } else {
      $("#accountButton").text("My Account");
      $("#accountButton").click(function (event) {
          event.preventDefault();
          window.location.href = "/users/" + JSON.parse($.cookie().loggedIn.substring(2)).Username;
      });
    }
  }

  function showRepositoryButton() {
    if($.cookie().loggedIn && JSON.parse($.cookie().loggedIn.substring(2)).Username === window.location.pathname.substring(7)) {
      $("#repositoryButton").text("Create Repository");
      $("#repositoryButton").click(function (event) {
          window.location.href="/repository/create/" + JSON.parse($.cookie().loggedIn.substring(2)).Username;
      });
    } else {
      $("#repositoryButton").toggle(false);
    }
  }

  function repoLaunch() {
      $('#repos li').click(function() {
        window.location.href = "/repository/" + JSON.parse($.cookie().loggedIn.substring(2)).Username + "/" + $(this).text();
    });
  }

  showAccountButton();
  showRepositoryButton();
  repoLaunch();
});