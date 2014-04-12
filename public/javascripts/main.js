$(window).bind("load", positionImage);
$(window).bind("resize", positionImage);

function positionImage() {
//repo_messages getting the image right.
  // $('.image').css('position', 'absolute')
  var body = $('body').css("height");
  var height = $('.image-2').css("height");
  var navbar = $('.navbar').css("height");

  $('.image-container').css('top', navbar);
  // var imgspace = $('.image-container').css("height");
  
  console.log(navbar);
  console.log(height);
  if (height != null) {
    var img2px =  (parseInt(body.substring(0, body.length - 2)) - parseInt(navbar.substring(0, navbar.length - 2)))/2;
    // var px = (parseInt(body.substring(0, body.length - 2)) - parseInt(navbar.substring(0, navbar.length - 2)))/2;
    var px = (parseInt(height.substring(0, height.length - 2)))/2;
    console.log(px);
    $('.image-2').css("top", img2px);
    $('.image').css("top", -px);
    // $('.image').css("top", );
  }


};

$(document).ready(function(event) {

  $("#logOutButton").click(function (event) {
    $("#logout").submit()
  });


  // console.log($('#actual-content').css('height'));
  // $('#actual-content').css("max-width", $(".image-container").css.width());
  // $('#actual-content').css("max-height", $(".image-container").css.height());
  
  



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

  $("#message_submit").click(function (event) {
      var pathToSubmitTo = window.location.pathname.substring(16, 40);
      var message = $("#chat_message").val();
      $.post("/" + pathToSubmitTo + "/messages", {"id": pathToSubmitTo, 
        "Username": JSON.parse($.cookie().loggedIn.substring(2)).Username, "Message": message}, function (data) {
          location.reload();
      });
  });

  function showAccountButton() {
    if($.cookie().loggedIn && JSON.parse($.cookie().loggedIn.substring(2)).Username === window.location.pathname.substring(7)) {
      $("#accountButton").text("Account Settings");
      // $("#repositoryButton").text("Create Repository");
      $("#repos").children("#repositoryButton").click(function (event) {
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

  function limitAddPictures() {
    var username = new String(JSON.parse($.cookie().loggedIn.substring(2)).Username);
    if($.cookie().loggedIn && JSON.parse($.cookie().loggedIn.substring(2)).Username === window.location.pathname.substring(12, 12 + username.length)) {
     } else {
        $("#launchPictureModal").toggle(false);
     }
  }
  function repoLaunch() {
      $('#repos #repo_list').click(function() {
        window.location.href = "/repository/" + window.location.pathname.substring(7) + "/" + $(this).children("li").text();
    });
  }

  function addPictures() {
    $("#addPictures").click(function(event) {
      event.preventDefault();
    })
  }


  showAccountButton();
  repoLaunch();
  limitAddPictures()
});