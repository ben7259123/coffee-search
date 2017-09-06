const express = require('express');
const place_search = require('./place-search.js');
// const bodyParser = require('body-parser');
const hbs = require('hbs');

var app = express();


app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
// app.use(express.static(__dirname + '/public'));
// app.use(bodyParser.urlencoded({extended: true}));

app.use('/placesearch', function(req, res, next) {

  place_search.getPlaces(req.query.address, req.query.results_num)
    .then(function(details) {
      var resultsHTML = '';
      for (var i = 0; i < details.results.length; i++) {
        resultsHTML +=
        `<div id="example-${i}">
           <h2>${details.results[i].name}</h>
           <p>${details.results[i].address}</p>
           <p>${details.results[i].website}</p>
         </div>`;
      }
      req.results = resultsHTML;
      req.location = details.formatted_address;
      next();
    })
    .catch(function(e) {
      console.log(e);
      res.send(`<h1>${e}</h1>`);
    });
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/search.html');
});

app.get('/placesearch', function(req, res) {
  res.render('result.hbs', {
    results: req.results,
    location: req.location
  });
});

app.listen(3000, function() {
  console.log('Server is running on port 3000');
});
