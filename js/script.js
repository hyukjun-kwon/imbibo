$(document).ready(function() {
  $(".ui.accordion").accordion();

  function search(searchString) {
    
  }

  function buildResult(drinkArray) {
    // drinkArray is an array of drinkID's
    let arrayLength = drinkArray.length;

    // if array is empty, just return
    if(arrayLength === 0) {
      return;
    }

    // empty out the result section first
    $("#results").empty();

    // for each drink ID, build and append to the result the drink listing
    for(drinkID of drinkArray) {
      $("#results").append(generateDrinkListing(drinkID));
    }

  }

  function generateDrinkListing(drinkID) {
    let queryURL = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkID}`;
    let returnElement = $("<div>").addClass("ui segment");

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {
      let drink = response.drinks[0];

      returnElement.append(`
      <div class="ui accordion">

      <!--title section of the collapsible-->
      <div class="title">
        <div class="ui grid">

          <!--cocktail image thumbnail-->
          <div class="five wide mobile column">
            <img id="cocktail-image-0" class="ui bordered medium image" src="${drink.strDrinkThumb}">
          </div>

          <!--cocktail name-->
          <div class="eleven wide mobile column ">
            <h3 id="cocktail-name-0">${drink.strDrink}</h3>
          </div>

        </div>
      </div>

      <!--content section of the collapsible-->
      <div class="content">

        <!--cocktail instruction, ingredients etc-->
        <div id="cocktail-content-0">
          <h5>Instruction:</h5>
          <p>${drink.strInstructions}</p>
        </div>

      </div>

    </div>
    `);
    });

    return returnElement;
  }

  $("#search-input").on("keydown", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      search($(this).val());
    }
  });
});
