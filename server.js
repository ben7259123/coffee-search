const express = require('express');
const place_search = require('./place-search.js');
const hbs = require('hbs');
const port = process.env.PORT || 3000;

var app = express();

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

app.set('view engine', 'hbs');

app.use('/placesearch', function(req, res, next) {
  place_search.getPlaces(req.query.address, req.query.results_num)
    .then(function(details) {
      req.results = place_search.resultsToHTML(details.results);
      req.location = details.location;
      next();
    })
    .catch(function(e) {
      console.log(e);
      res.render('search.hbs', {
        heading: `<h1>Place could not be Found</h1>`
      });
    });
});

app.get('/', function(req, res) {
  res.render('search.hbs', {
    heading: `<h1>Find Coffee Near You</h1>`
  });
});

app.get('/placesearch', function(req, res) {
  res.render('results.hbs', {
    results: req.results,
    location: req.location
  });
});

app.listen(port, function() {
  console.log(`Server is running on ${port}`);
});
