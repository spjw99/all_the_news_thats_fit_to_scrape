var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var helpers = require('handlebars-helpers');
var helpers_url = helpers.url();

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));


app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.Promise = Promise; // Set mongoose to leverage Built in JavaScript ES6 Promises
mongoose.connect(MONGODB_URI);

let mongooseConnection = mongoose.connection;

mongooseConnection.on('error', console.error.bind(console, 'connection error:'));
mongooseConnection.once('open', function() {
  console.log(`Sucessfully Connected to Mongo DB !`); // If Connection is successful, Console.log(Message)
});



// Routes
app.get("/", (req, res) => res.render("index"));

/********************
 * SCRAPPING ARTICLES
 ********************/
app.get("/scrape", function(req, res) {
  axios.get("https://www.allkpop.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    
    var result = {data:[]};
    
    $("#more_stories_scr article.list").each(function(i, element) {
      var title = helpers_url.encodeURI($(element).find(".title").text());
      var link = $(element).find("a").attr("href");
      var image = $(element).find("img").attr("src");
      var category = $(element).find('.category').text();
        if( title && link && image){
            result.data.push({
                title : title,
                link : "https://www.allkpop.com" + link,
                image : image,
                category : category
            });
        }
    });
    // console.log(result);
    res.render("index", result);
  });
});


/*****************************
 * SELECT SAVED ARTICLE FROM DB
 *****************************/
app.get("/saved_articles", function(req, res) {
  db.Article.find({}).sort( { _id: -1 } )
    .then((dbArticle) => {
        var result = {data : dbArticle};
        //console.log(result);
      //res.json(dbArticle);
      res.render("index", result);
    })
    .catch((err) => {
      res.json(err);
    });
});

/************************
 * INSERT ARTICLE INTO DB 
 ***********************/
app.post("/api/save", function(req, res){
  //console.log(req.body);
  db.Article.create(req.body)
  .then((dbArticle) => {
      //console.log(dbArticle);
      db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbArticle._id }, { new: true });
      res.json("added");
  })
  .catch((err) => {
      res.json(err);
  });
})
/******************************
 * DELETE SAVED ARTICLE FROM DB
 *******************************/
app.post('/api/delete_article', function(req, res){
  if(req.body.article_id){
    db.Article.findByIdAndRemove(req.body.article_id)
    .then((dbArticle) => {
        res.json(dbArticle);
    })
    .catch((err) => {
      res.json(err);
    });
  }
})




/*************************************
 * SELECT ALL COMMENTS FOR AN ARTICLE
 ************************************/
app.post("/api/select_comment", function(req, res) {
  db.Comment.find({ article_id: req.body.article_id })
    .then(function(dbComment) {
      res.json(dbComment);
    })
    .catch((err) => {
      res.json(err);
    });
});
/************************
 * INSERT NEW COMMENT
 *********************/
app.post('/api/insert_comment', function(req, res){
  // console.log("FROM server.js");
  // console.log(db);
  db.Comment.create(req.body)
  .then((dbComment) => {
    console.log(dbComment);
    db.Comment.findOneAndUpdate({ _id: req.params.id }, { note: dbComment._id }, { new: true });
    res.json(dbComment);
  })
  .catch((err) => {
    res.json(err);
  })
})
/******************************
 * DELETE COMMENT FROM DB
 *******************************/
app.post('/api/delete_comment', function(req, res){
  if(req.body.comment_id){
    db.Comment.findByIdAndRemove(req.body.comment_id)
    .then((dbComment) => {
        res.json(dbComment);
    })
    .catch((err) => {
      res.json(err);
    });
  }
})

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});