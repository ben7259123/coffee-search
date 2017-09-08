window.addEventListener('load', function() {
  var addressInput = document.getElementById('address-input');
  addressInput.focus();

  document.getElementById('search-form')
  .addEventListener('submit', function(e) {
    var displayErrorMessage = function(id, errorMessage){
      e.preventDefault();
      document.getElementById(id).style.visibility = "visible";
      document.getElementById(id).textContent = errorMessage;
    };

    //address character length validation
    var noSpaceValue = addressInput.value.replace(/ /g, "");
    if (noSpaceValue.length < 5) {
      displayErrorMessage('address-err',
      'address must be at least five characters');
    } else {
      document.getElementById('address-err').style.visibility = "hidden";
    }

    //result number validation
    var numberInput = parseInt(document.getElementById('results_num').value);
    if (numberInput <= 0) {
      displayErrorMessage('num-err',
      'number must be larger than zero');
    } else if (numberInput > 10) {
      displayErrorMessage('num-err',
      'number must be less than ten');
    } else if (!numberInput) {
      displayErrorMessage('num-err',
      'please enter a number');
    } else {
      document.getElementById('num-err').style.visibility = "hidden";
    }
  }, false);
});
