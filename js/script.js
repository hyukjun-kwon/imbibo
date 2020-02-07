$(document).ready(function() {
  $('.ui.accordion').accordion();

  
  
  
 

  function search(searchString) {
    $("#results").empty();
    let queryURL = "https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=" + searchString;

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {
      console.log(response);
      let drinks = response.drinks;
      for(drink of drinks) {
        $("#results").append(generateDrinkListing(drink.idDrink));
      }
    });
  }

  function drinkNameInfo(y) {
    let drinkname = y
    let drinknameURL = https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${drinkname};


    $.ajax({
        url: drinknameURL,
        method: "GET"
      }).then(function(response) {
        let drinkArray = []

        for (let i=0; i < response.drinks.length; i++) {
            let drinkI = response.drinks[i].idDrink;
            let drinkN = response.drinks[i].strDrink;
            drinkArray.push({
                drinkName: drinkName,
                drinkID: drinkI
            });
        }
        console.log(drinkArray[0].drinkName)
      });
}


  function generateDrinkListing(drinkID) {
    let queryURL = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkID}`
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
    `)
      
      
      
    });

    return returnElement;
  }

  $("#search-input").on("keydown", function(event){
    if (event.keyCode === 13) {
      event.preventDefault();
      search($(this).val());
    }
  });


});