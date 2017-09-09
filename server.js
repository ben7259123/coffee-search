const express = require('express');
const place_search = require('./place-search.js');
const hbs = require('hbs');
const port = process.env.PORT || 3000;

var app = express();

//serve up static css files
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
//set view engines
app.set('view engine', 'hbs');

// //render html file using hbs engine
// app.engine('html', require('hbs').__express);


app.use('/placesearch', function(req, res, next) {
  place_search.getPlaces(req.query.address, req.query.results_num)
    .then(function(details) {
      var resultsHTML = '';
      for (var i = 0; i < details.results.length; i++) {
        resultsHTML +=
        `<div class="result">
           <h2>${details.results[i].name}</h2>
           <p class="result-address">${details.results[i].address}</p>
           <p class="result-website">${details.results[i].website}</p>
         </div>`;
      }
      req.results = resultsHTML;
      req.location = details.formatted_address;
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
