$(document).ready(function() {
  /************************************************ initialize Semantic UI Modules ************************************************/
  $(".ui.accordion").accordion();
  $(".ui.sidebar").sidebar("attach events", ".toc.item");

  /********************************************************* Save functions ********************************************************/

  // Load saved cocktails from local storage
  let savedList = JSON.parse(localStorage.getItem("saved-cocktails"));

  // If data does not exist, create an empty array
  if (savedList === null) {
    // each element in savedList must be {drinkID: string, drinkName: string}
    savedList = [];
  }

  renderSaved();

  function renderSaved() {
    let listLength = savedList.length;

    $("#saved-cocktails").empty();
    for (let i = 0; i < listLength; i++) {
      $("#saved-cocktails").append(generateSavedItem(savedList[i]));
    }
  }

  /******************************************************** Search bar functions *****************************************************/

  // First, search for a drink name
  function search(searchString) {
    let queryURL = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchString}`;

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {
      if (response.drinks !== null) {
        let searchArray = [];
        let len = response.drinks.length;
        for (let i = 0; i < len; i++) {
          searchArray.push(response.drinks[i].idDrink);
        }

        // drinkArray is an array of drinkID's
        let arrayLength = searchArray.length;

        // if array is empty, just return
        if (arrayLength === 0) {
          return;
        }

        // empty out the result section first
        $("#results").empty();

        // for each drink ID, build and append to the result the drink listing
        for (drinkID of searchArray) {
          $("#results").append(generateDrinkListing(drinkID));
        }

        $(".ui.accordion").accordion();
      } 

      secondarySearch(searchString);
      
    });
  }

  // When drink name search is not returning, try ingredient search
  function secondarySearch(searchString) {
    queryURL = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${searchString}`;

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(res) {
      let searchArray = [];

      if (res.drinks !== "") {
        let len = res.drinks.length;
        for (let i = 0; i < len; i++) {
          if (searchArray.indexOf(res.drinks[i].idDrink) === -1) {
            searchArray.push(res.drinks[i].idDrink);
          }
        }
      }

      // drinkArray is an array of drinkID's
      let arrayLength = searchArray.length;

      // if array is empty, just return
      if (arrayLength === 0) {
        return;
      }

      // empty out the result section first
      $("#results").empty();

      // for each drink ID, build and append to the result the drink listing
      for (drinkID of searchArray) {
        $("#results").append(generateDrinkListing(drinkID));
      }

      $(".ui.accordion").accordion();
    });
  }

  function generateDrinkListing(drinkID) {
    let queryURL = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkID}`;
    let returnElement = $("<div>").addClass("ui segment");

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(resp) {
      let drink = resp.drinks[0];

      let ingredients = "";
      let measures = "";
      let counter = 1;

      while (
        resp.drinks[0][`strIngredient${counter}`] != null ||
        resp.drinks[0][`strMeasure${counter}`] != null
      ) {
        ingredients += resp.drinks[0][`strIngredient${counter}`] + "<br>";
        if (resp.drinks[0][`strMeasure${counter}`] === null) {
          measures += "<br>";
        } else {
          measures += resp.drinks[0][`strMeasure${counter}`] + "<br>";
        }

        counter++;
      }

      let ingredientSection = `
              <table class="ui striped table">
                <thead>
                  <tr>
                    <th>Ingredients:</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="top aligned">
                    <td>${ingredients}</td>
                    <td>${measures}</td>
                  </tr>
                </tbody>
              </table>
              `;

      returnElement.append(`
              <div class="ui accordion">

              <!--title section of the collapsible-->
              <div class="title">
                <div class="ui grid">

                  <!--cocktail image thumbnail-->
                  <div class="four wide mobile column">
                    <img class="ui bordered medium image" src="${drink.strDrinkThumb}">
                  </div>

                  <!--cocktail name-->
                  <div class="twelve wide mobile column">
                    <h3>${drink.strDrink}</h3>
                  </div>

                </div>
              </div>

              <!--content section of the collapsible-->
              <div class="content">

                <!--cocktail instruction, ingredients etc-->
                <div class="ui grid">
                  <div class="twelve wide mobile column">
                    <h5>Instruction:</h5>
                    <p>${drink.strInstructions}</p>
                    ${ingredientSection}
                  </div>

                  <div class="four wide mobile four wide tablet three wide computer right floated column">
                    <button class="ui secondary button save-button" data-drinkid="${drink.idDrink}" data-drinkName="${drink.strDrink}">Save</button>
                  </div>
                </div>

              </div>

            </div>
    `);
    });

    return returnElement;
  }

  function generateSavedItem(drink) {
    let returnElement = $("<a>").addClass("item saved-cocktail");
    returnElement.attr("data-drinkid", drink.drinkID);
    returnElement.text(drink.drinkName);

    return returnElement;
  }

  /****************************************************** Get Nearby Bars Information ******************************************************/

  function getBarLocations() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    }
  }

  function showPosition(position) {
    let lat = position.coords.latitude;
    let long = position.coords.longitude;
    let limit = 4;
    let secret =
      "zu2Q5R-_5slDM_BVx8NcmVC9ErXdid6zwBeDJO_lOg4U5Ou3tCKlqBCw6Z8RBFwRDBDm9tIpF8k5pOu0Y8siqXpPXy_MN1O3bA-5a49fmXwHiT8111nlec2GV5I8XnYx";
    let barURL = `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=bar&limit=${limit}&latitude=${lat}&longitude=${long}`;

    $.ajax({
      url: barURL,
      method: "GET",
      dataType: "json",
      headers: {
        Authorization: `Bearer ${secret}`
      }
    }).then(data => {
      console.log(data);

      $("#results").empty();

      let segments = $("<div>").addClass("ui segments");

      for (let i = 0; i < data.businesses.length; i++) {
        let rating = data.businesses[i].rating;
        let starRating = "";
        let starCount = 0;
        while (starCount < rating) {
          starRating += '<i class="fa fa-star"></i>';
          starCount++;
        }
        while (starCount < 5) {
          starRating += '<i class="far fa-star"></i>';
          starCount++;
        }
        let seg = $("<div>").addClass("ui segment");
        let uiGrid = $("<div>").addClass("ui grid");
        uiGrid.append(`
              <div class="twelve wide mobile column">
                <i class="red yelp icon"></i><a target="_blank" href="${data.businesses[i].url}"><b>${data.businesses[i].name}</b></a>
                <hr>
                <h5 class="grey-text">Yelp rating: ${starRating}</h5>
                <h5 class="grey-text">Phone: ${data.businesses[i].phone}</h5>
                <h5 class="grey-text">Address: ${data.businesses[i].location.address1 +
                  ", " +
                  data.businesses[i].location.city}</h5>
              
                <h5 class="grey-text">  ${getMiles(data.businesses[i].distance)} miles away</h5>
              </div>
              `);

        seg.append(uiGrid);
        segments.append(seg);
      }

      $("#results").append(segments);
    });
  }

  function getMiles(i) {
    return Number(i * 0.000621371192).toFixed(2);
  }
  /******************************************************* Side bar functions *******************************************************/
  function renderSavedCocktail(drinkID) {
    let queryURL = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkID}`;
    let returnElement = $("<div>").addClass("ui segment");

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(resp) {
      let drink = resp.drinks[0];

      let ingredients = "";
      let measures = "";
      let counter = 1;

      while (
        resp.drinks[0][`strIngredient${counter}`] != null ||
        resp.drinks[0][`strMeasure${counter}`] != null
      ) {
        ingredients += resp.drinks[0][`strIngredient${counter}`] + "<br>";
        if (resp.drinks[0][`strMeasure${counter}`] === null) {
          measures += "<br>";
        } else {
          measures += resp.drinks[0][`strMeasure${counter}`] + "<br>";
        }

        counter++;
      }

      let ingredientSection = `
              <table class="ui striped table">
                <thead>
                  <tr>
                    <th>Ingredients:</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="top aligned">
                    <td>${ingredients}</td>
                    <td>${measures}</td>
                  </tr>
                </tbody>
              </table>
              `;

      returnElement.append(`
                <div class="ui grid">

                  <!--cocktail image thumbnail-->
                  <div class="four wide mobile column">
                    <img class="ui bordered medium image" src="${drink.strDrinkThumb}">
                  </div>

                  <!--cocktail name-->
                  <div class="twelve wide mobile column">
                    <h3>${drink.strDrink}</h3>
                  </div>

                </div>
            

                <!--cocktail instruction, ingredients etc-->
                <div class="ui grid">
                  <div class="twelve wide mobile column">
                    <h5>Instruction:</h5>
                    <p>${drink.strInstructions}</p>
                    ${ingredientSection}
                  </div>

                  <div class="four wide mobile four wide tablet three wide computer right floated column">
                    <button class="ui red button delete-button" data-drinkid="${drink.idDrink}" data-drinkName="${drink.strDrink}">Delete</button>
                  </div>

              </div>

            </div>
    `);
    });

    $("#results").append(returnElement);
  }

  function renderManageSaved() {
    let arrLen = savedList.length;

    if (arrLen != 0) {
      $("#results").empty();
      for (let i = 0; i < arrLen; i++) {
        renderSavedCocktail(savedList[i].drinkID);
      }
    }
  }

  /****************************************************** Search Bar Functions ********************************************************/

  function searchByGlassType(glassType) {
    
    let queryURL = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?g=${glassType}`

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(res) {
      $("#results").empty();
      let drinks = res.drinks;

      for(drink of drinks) {
        $("#results").append(generateDrinkListing(drink.idDrink));
      }

    });
  }

  /******************************************************** Event Listeners **********************************************************/

  // In case accordion doesn't initialize, initialize again on click
  $("#results").on("click", function(event) {
    $(".ui.accordion").accordion();
  });

  $(".find-bars-button").on("click", function(event) {
    event.preventDefault();
    getBarLocations();
  });

  $("#search-input").on("keydown", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      search($(this).val());
      setTimeout(function() {
        $(".ui.accordion").accordion();
      }, 2000);
    }
  });

  $(".glass-button").on("click", function(event) {
    event.preventDefault();
    searchByGlassType($(this).text());
    setTimeout(function() {
      $(".ui.accordion").accordion();
    }, 2000);
  });

  $(".spirit-button").on("click", function(event) {
    event.preventDefault();
    search($(this).text());
    setTimeout(function() {
      $(".ui.accordion").accordion();
    }, 2000);
  });
});


$(".manage-saved").on("click", function(event) {
  console.log("manage-saved clicked, function not yet defined");
  event.preventDefault();
  $("#results").empty();
  renderManageSaved();
});

$("#saved-cocktails").on("click", ".saved-cocktail", function(event) {
  console.log("saved-cocktail clicked, function not yet defined");
  event.preventDefault();
  $("#results").empty();
  renderSavedCocktail($(this).attr("data-drinkid"));
});

$("#results").on("click", ".save-button", function(event) {
  event.preventDefault();
  $(this).text("Saved");
  $(this).removeClass("secondary");
  $(this).addClass("green");
  let drinkID = $(this).attr("data-drinkid");
  let drinkName = $(this).attr("data-drinkName");

  // If it does not exist in the saved list
  if (savedList.findIndex(i => i.drinkID === drinkID) === -1) {
    savedList.push({
      drinkID: drinkID,
      drinkName: drinkName
    });

    // update local storage
    localStorage.setItem("saved-cocktails", JSON.stringify(savedList));

    // update saved list
    renderSaved();
  }
});

$("#results").on("click", ".delete-button", function(event) {
  event.preventDefault();
  let drinkID = $(this).attr("data-drinkid");
  let index = savedList.findIndex(i => i.drinkID === drinkID);

  savedList.splice(index, 1);

  localStorage.setItem("saved-cocktails", JSON.stringify(savedList));
  renderSaved();
  renderManageSaved();
});
