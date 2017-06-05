// Boilerplate
// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();
var PORT = 3000 || process.env.PORT;

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/mongooseScraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});

// Routes
// Scrape Route Root
app.get("/", function(req, res) {
    res.redirect("/articles");
})

app.get("/scrape", function(req, res) {
    request("http://www.echojs.com/", function(error, response, html) {
        var $ = cheerio.load(html);

        $("article h2").each(function(i, element) {
            var result = {};

            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");
            // result.saved = false;

            var entry = new Article(result);

            entry.save(function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc);
                }
            });
        });
        res.redirect("/articles");
    });
});

// Shows all articles
app.get("/articles", function(req, res) {
    Article.find({}, function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            var hbsObject = { stories: doc };
            res.render("index", hbsObject);
        }
    });
});

// Grab Article by ObjectId
app.get("/articles/:id", function(req, res) {
    Article.findOne({ "_id": req.params.id }).populate("note")
        .exec(function(error, doc) {
            if (error) {
                console.log(error);
            } else {
                res.json(doc);
            }
        });
});

// Create new note or replace an existing note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    var newNote = new Note(req.body);

    // And save the new note the db
    newNote.save(function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's note
            Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
                // Execute the above query
                .exec(function(err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    } else {
                        // Or send the document to the browser
                        res.send(doc);
                    }
                });
        }
    });
});

app.get("/saved", function(req, res) {
    Article.find({}, function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            var hbsObject = { stories: doc };
            res.render("saved", hbsObject);
        }
    });
});

app.post("/saved/:id", function(req, res) {

    // Use the article id to find and update saved status
    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": req.body.saved })
        // Execute the above query
        .exec(function(err, doc) {
            // Log any errors
            if (err) {
                console.log(err);
            } else {
                // Or send the document to the browser
                res.redirect("/saved");
            }
        });

});

// To delete the note for an article
app.post("/delete/:id", function(req, res) {
    Article.findById(req.params.id, function(err, doc) {
        console.log("doc is ==============" + doc);
        if (err) {
            console.log(err);
        } else {

            Note.findByIdAndRemove(doc.note, function(err, docu) {
                res.redirect("/saved");
            });
        }
    });
});



// Listen on port 3000
app.listen(PORT, function() {
    console.log("App running on port " + PORT + " !");
});