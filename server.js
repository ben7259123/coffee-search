const express = require('express');
const place_search = require('./place-search.js');
const bodyParser = require('body-parser');
const hbs = require('hbs');

var app = express();


app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
  console.log(req.body.results_num);
  place_search.getPlaces(req.body.address, req.body.results_num)
    .then(function(details) {
      var resultsHTML = '';
      for (var i = 0; i < details.length; i++) {
        resultsHTML +=
        `<div id="example-${i}">
           <h2>${details[i].name}</h>
           <p>${details[i].address}</p>
           <p>${details[i].website}</p>
         </div>`;
      }
      req.results = resultsHTML;
      next();
    })
    .catch(function(e) {
      console.log(e);
      res.send(`<h1>${e}</h1>`);
    });
});


app.post('/placesearch', function(req, res) {

  res.render('result.hbs', {
    results: req.results
  });
});

app.listen(3000, function() {
  console.log('Server is running on port 3000');
});
