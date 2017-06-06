// $.getJSON("/articles", function(data) {

// });

// When clicking a p tag
$(document).on("click", "p", function() {
    $("#notes").empty();
    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    }).done(function(data) {
        console.log(data);
        // The title of the article
        $("#notes").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $("#notes").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
        // A button to remove the note
        $("#notes").append("<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>");

        // If there's a note in the article
        if (data.note) {
            // Place the title of the note in the title input
            $("#titleinput").val(data.note.title);
            // Place the body of the note in the body textarea
            $("#bodyinput").val(data.note.body);
        }
    });
});

// Savenote button
$(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from title input
                title: $("#titleinput").val(),
                // Value taken from note textarea
                body: $("#bodyinput").val(),
                articleId: thisId
            }
        })
        // With that done
        .done(function(data) {
            // Log the response
            console.log(data);
            var newDiv = $("<div class='comment'>");
            newDiv.append("<div data-id='" + data._id + "'>");
            $("#comments").append(newDiv);
            // Empty the notes section
            // $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});

// Deletenote button
$(document).on("click", "#deletenote", function() {
    var thisId = $(this).attr("data-id");

    $.ajax({
            method: "POST",
            url: "/delete/" + thisId
        })
        .done(function(data) {
            $("#notes").empty();
        });
    // Remove values in the input and textarea.
    $("#titleinput").val("");
    $("#bodyinput").val("");
});


// Change saved status
$(document).on("click", ".savedchange", function() {
    var thisId = $(this).attr("data-id");
    if ($(this).attr("saved") === "true") {
        // console.log("======== saved true case =======");
        $(this).attr("saved", "false");
        $(this).text("Save Article");
        $.ajax({
            method: "POST",
            url: "/saved/" + thisId,
            data: {
                saved: false
            }
        }).done(function(data) {
            console.log(data);
        });
    } else {
        $(this).attr("saved", "true");
        $(this).text("Remove Article");
        $.ajax({
            method: "POST",
            url: "/saved/" + thisId,
            data: {
                saved: true
            }
        }).done(function(data) {
            console.log(data);
        });
    }
});