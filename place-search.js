const request = require('request');


var geocodeAddress = function(address) {
  return new Promise(function(resolve, reject) {
    var encodedAddress = encodeURIComponent(address);
    request({
      url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`,
      json: true
    }, function(error, response, body) {

      if (response.statusCode == 400) {
        reject('400 Bad Request (Geocode)');
      } else if (response.statusCode === 404) {
        reject('404 Server Not Found (Geocode)');
      } else if (response.body.status === 'ZERO_RESULTS') {
        reject('zero results found (Geocode)');
      } else if (!error && response.statusCode === 200) {
        resolve({
          lat: response.body.results[0].geometry.location.lat,
          lng: response.body.results[0].geometry.location.lng,
          formatted_address: response.body.results[0].formatted_address
        });
      }
    });
  });
};

var placeSearch = function(lat, lng, resultNum) {
  return new Promise(function(resolve, reject) {
    request({
      url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&keyword=coffee&key=AIzaSyAokLRG4vvoIIhLU1WhRogBnMfRKLK8tYw`,
      json: true
    }, function(error, response, body) {
      if (response.statusCode == 400) {
        reject('400 Bad Request (Nearby Search)');
      } else if (response.statusCode === 404) {
        reject('404 Server Not Found (Nearby Search)');
      } else if (response.body.status === 'ZERO_RESULTS') {
        reject('zero results found (Nearby Search)');
      } else if (!error && response.statusCode === 200) {
          var place_ids = [];
          console.log(resultNum);
          for (var i = 0; i < resultNum; i++) {
            place_ids.push(response.body.results[i].place_id);

          }
        resolve(place_ids);
      }
    });
  });
};

var getPromises = function(place_ids) {
  var promiseArr = [];
  for (var i = 0; i < place_ids.length; i++) {
    var currentId = place_ids[i];

    promiseArr[i] = new Promise(function(resolve, reject) {
      request({
        url: `https://maps.googleapis.com/maps/api/place/details/json?placeid=${currentId}&key=AIzaSyAokLRG4vvoIIhLU1WhRogBnMfRKLK8tYw`,
        json: true
      }, function(error, response, body) {
        if (response.body.status === 'INVALID_REQUEST') {
          reject('invalid request made');
        } else if (response.body.status === 'REQUEST_DENIED') {
          reject(response.body.error_message);
        } else if (response.statusCode == 404) {
          reject('404 could not connect to server');
        } else if (response.body.status ==='OK') {
          resolve({
            name: response.body.result.name,
            address: response.body.result.formatted_address,
            phoneNumber: response.body.result.international_phone_number,
            website: response.body.result.website,
            status: response.body.status
          });
        }
      });
    });
  }
  return promiseArr;
};


var getPlaces = function(address, resultNum) {

  return new Promise(function(resolve, reject) {
    var formatted_address = '';
    geocodeAddress(address).then(function(response) {
      formatted_address = response.formatted_address;
      // console.log(formatted_address);
      return placeSearch(response.lat, response.lng, resultNum);
    }).then(function(results) {
      return Promise.all(getPromises(results));
    })
    .then(function(results) {
      console.log(formatted_address);
      resolve({
        results: results,
        formatted_address: formatted_address
      });
    })
    .catch(function(e) {
      reject(e);
      console.log(e);
    });
  });
};

module.exports = {
  getPlaces: getPlaces
};
