$(document).ready(function() {
    let selectedMeal = false; // Track if a meal name was selected

    // Trigger suggestions as the user types
    $('#ingredient').on('input', function() {
        const ingredient = $(this).val().trim();
        selectedMeal = false; // Reset the selectedMeal flag
        
        if (ingredient.length > 0) {
            getSuggestions(ingredient);
        } else {
            $('#suggestions').empty(); // Clear suggestions if input is empty
        }
    });

    // Handle search button click
    $('#searchButton').click(function() {
        const ingredientOrMeal = $('#ingredient').val().trim();

        if (ingredientOrMeal !== '') {
            if (selectedMeal) {
                // If a meal was selected, search by meal name
                searchRecipeByMealName(ingredientOrMeal);
            } else {
                // If an ingredient was entered, search by ingredient
                searchRecipesByIngredient(ingredientOrMeal);
            }
        } else {
            alert('Please enter an ingredient or select a meal!');
        }
    });

    // Fetch suggestions for the autocomplete
    function getSuggestions(ingredient) {
        const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${ingredient}`;
        
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(data) {
                displaySuggestions(data.meals);
            },
            error: function() {
                $('#suggestions').empty(); // Clear suggestions on error
            }
        });
    }

    // Display suggestions
    function displaySuggestions(meals) {
        const suggestionsList = $('#suggestions');
        suggestionsList.empty();

        if (meals) {
            meals.forEach(meal => {
                const suggestionItem = `<li>${meal.strMeal}</li>`;
                suggestionsList.append(suggestionItem);
            });

            // Add click event to suggestion items
            $('#suggestions li').click(function() {
                const selectedText = $(this).text();
                $('#ingredient').val(selectedText);
                $('#suggestions').empty(); // Clear suggestions once selected
                selectedMeal = true; // Mark that a meal was selected
            });
        }
    }

    // Search recipes by ingredient
    function searchRecipesByIngredient(ingredient) {
        const apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`;
        
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(data) {
                displayBasicResults(data.meals);
            },
            error: function() {
                $('#results').html('<p class="error-message">Unable to fetch recipes. Please check your connection and try again.</p>');
            }
        });
    }

    // Search recipe by meal name
    function searchRecipeByMealName(mealName) {
        const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`;
        
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(data) {
                displayFullRecipe(data.meals[0]);
            },
            error: function() {
                $('#results').html('<p class="error-message">Unable to fetch recipes. Please check your connection and try again.</p>');
            }
        });
    }

    // Display basic search results (image and title) for ingredient-based search
    function displayBasicResults(recipes) {
        const resultsSection = $('#results');
        resultsSection.empty();

        if (recipes) {
            recipes.forEach(recipe => {
                const recipeCard = `
                    <div class="recipe">
                        <h3>${recipe.strMeal}</h3>
                        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" width="100" />
                    </div>
                `;
                resultsSection.append(recipeCard);
            });
        } else {
            resultsSection.append('<p>No recipes found for that ingredient.</p>');
        }
    }

    // Display full recipe details
    function displayFullRecipe(recipe) {
        const resultsSection = $('#results');
        resultsSection.empty(); // Clear previous results

        if (recipe) {
            // Extract ingredients and measurements
            const ingredients = [];
            for (let i = 1; i <= 20; i++) {
                const ingredient = recipe[`strIngredient${i}`];
                const measure = recipe[`strMeasure${i}`];
                if (ingredient) {
                    ingredients.push(`${measure} ${ingredient}`);
                }
            }

            const recipeDetails = `
                <div class="full-recipe">
                    <h2>${recipe.strMeal}</h2>
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" width="200" />
                    <h3>Category: ${recipe.strCategory}</h3>
                    <h3>Cuisine: ${recipe.strArea}</h3>
                    <p><strong>Instructions:</strong></p>
                    <p>${recipe.strInstructions}</p>
                    <h3>Ingredients:</h3>
                    <ul>
                        ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
            `;
            resultsSection.append(recipeDetails);
        } else {
            resultsSection.append('<p>No recipe details found.</p>');
        }
    }
});
