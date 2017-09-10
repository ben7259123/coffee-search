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
        var address_components = response.body.results[0].address_components;
        var cityName, adminLevelOne, location = "";
        address_components.forEach(function(component) {
          var type = component.types[0];
          if (type === 'locality') {
            cityName = component.long_name;
          } else if (type === 'administrative_area_level_1') {
            adminLevelOne = component.long_name;
          }
        });
        location = `${cityName}, ${adminLevelOne}`;
        resolve({
          lat: response.body.results[0].geometry.location.lat,
          lng: response.body.results[0].geometry.location.lng,
          location: location
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
            address: response.body.result.adr_address,
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
  var location = '';
  return new Promise(function(resolve, reject) {
    geocodeAddress(address).then(function(response) {
      location = response.location;
      return placeSearch(response.lat, response.lng, resultNum);
    }).then(function(results) {
      return Promise.all(getPromises(results));
    })
    .then(function(results) {
      resolve({
        results: results,
        location: location
      });
    })
    .catch(function(e) {
      reject(e);
      console.log(e);
    });
  });
};

var resultsToHTML = function(results) {
  var resultsHTML = '';
  for (var i = 0; i <results.length; i++) {
    var address = results[i].address;
    var sliceIndex = address.indexOf('<span class=\"postal-code\"');
    var slicedAddress = address.slice(0, sliceIndex);

    var name =  results[i].name;
    var website = results[i].website;
    var phoneNumber = results[i].phoneNumber;
    if (website) {
      heading = `<a href=${website}>${name}</a>`
    } else {
      heading = name;
    }

    if (phoneNumber) {
      if (phoneNumber.startsWith('+1 ')) {
        slicedPhoneNumber = phoneNumber.slice(3);
      }
      var phoneNumberHTML =
      `<a id="phone-number" href=\"tel:${phoneNumber}\">${slicedPhoneNumber}</a>`;
    } else {
      phoneNumberHTML = '';
    }

    resultsHTML +=
    `<div class="result">
       <h2>${heading}</h2>
       <p class="result-address">${slicedAddress}</p>
       ${phoneNumberHTML}
     </div>`;
  }
  return resultsHTML;
}


module.exports = {
  getPlaces: getPlaces,
  resultsToHTML: resultsToHTML
};
