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
      $("#repositoryButton").text("Create Repository");
      $("#repositoryButton").click(function (event) {
          window.location.href="/repository/create/" + JSON.parse($.cookie().loggedIn.substring(2)).Username;
      });
      $("#accountButton").click(function (event) {
          event.preventDefault();
          window.location.href="/settings/" + JSON.parse($.cookie().loggedIn.substring(2)).Username;
      });
    } else {
      $("#accountButton").text("My Account");
      $("#accountButton").click(function (event) {
          event.preventDefault();
          window.location.href = "/users/" + JSON.parse($.cookie().loggedIn.substring(2)).Username;
      });
      $("#repositoryButton").toggle(false);
    }
  }

  // function showRepositoryButton() {
  //   if($.cookie().loggedIn && JSON.parse($.cookie().loggedIn.substring(2)).Username === window.location.pathname.substring(7)) {
  //     $("#repositoryButton").text("Create Repository");
  //     $("#repositoryButton").click(function (event) {
  //         window.location.href="/repository/create/" + JSON.parse($.cookie().loggedIn.substring(2)).Username;
  //     });
  //   } else {
  //     $("#repositoryButton").toggle(false);
  //   }
  // }

  function limitAddPictures() {
    var username = new String(JSON.parse($.cookie().loggedIn.substring(2)).Username);
    if($.cookie().loggedIn && JSON.parse($.cookie().loggedIn.substring(2)).Username === window.location.pathname.substring(12, 12 + username.length)) {
     } else {
        $("#launchPictureModal").toggle(false);
     }
  }
  function repoLaunch() {
      $('#repos li').click(function() {
        // window.location.href = "/repository/" + JSON.parse($.cookie().loggedIn.substring(2)).Username + "/" + $(this).text();
        window.location.href = "/repository/" + document.getElementById("myHeader").innerHTML + "/" + $(this).text();
    });
  }

  function addPictures() {
    $("#addPictures").click(function(event) {
      event.preventDefault();
    })
  }


  showAccountButton();
  // showRepositoryButton();
  repoLaunch();
  limitAddPictures()
});