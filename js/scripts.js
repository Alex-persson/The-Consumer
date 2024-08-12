const recipes = [];

// Function to load all recipe JSON files
async function loadRecipes() {
    const recipeFiles = [
        "recipes/gyudon.json",
        "recipes/harissa-chickpea-lamb-meatballs.json"
    ];

    for (const file of recipeFiles) {
        const response = await fetch(file);
        const recipe = await response.json();
        recipes.push(recipe);
    }
}

// Function to display recent recipes on the home page
async function displayRecentRecipes() {
    await loadRecipes();
    
    // Sort recipes by datetime, most recent first
    const sortedRecipes = recipes.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    
    // Take the first 5 recipes from the sorted array
    const recentRecipes = sortedRecipes.slice(0, 5);
    
    const recentRecipesContainer = document.getElementById('recent-recipes');

    recentRecipes.forEach(recipe => {
        const recipeElement = document.createElement('div');
        recipeElement.classList.add('recipe-item');
        recipeElement.innerHTML = `
            <a href="recipe.html?id=${recipe.id}">
                <img src="${recipe.image}" alt="${recipe.name}">
                <h3>${recipe.name}</h3>
            </a>
        `;
        recentRecipesContainer.appendChild(recipeElement);
    });
}

// Function to display all recipes on the recipes page
async function displayAllRecipes() {
    await loadRecipes();
    
    const allRecipesContainer = document.getElementById('all-recipes');
    recipes.forEach(recipe => {
        const recipeElement = document.createElement('div');
        recipeElement.classList.add('recipe-item');
        recipeElement.innerHTML = `
            <a href="recipe.html?id=${recipe.id}">
                <img src="${recipe.image}" alt="${recipe.name}">
                <h3>${recipe.name}</h3>
            </a>
        `;
        allRecipesContainer.appendChild(recipeElement);
    });
}

// Function to format the datetime as dd-mm-yyyy
function formatDate(datetime) {
    const date = new Date(datetime);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Function to format tags: replace dashes with spaces and capitalize the first letter
function formatTag(tag) {
    return tag
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Function to parse time strings like "1h 30m" into minutes
function parseTime(timeStr) {
    const timeParts = timeStr.match(/(\d+)(h|m)/g) || [];
    return timeParts.reduce((total, part) => {
        const value = parseInt(part);
        if (part.includes('h')) {
            return total + value * 60;
        } else if (part.includes('m')) {
            return total + value;
        }
        return total;
    }, 0);
}

// Function to format minutes into "1h 30m" format
function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes} mins`;
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h ? `${h}h ` : ''}${m ? `${m}m` : ''}`.trim();
}

function formatAuthor(author, edited) {
    // Check if the author string contains a comma
    const commaIndex = author.indexOf(',');
    let authorHtml = "";

    if (commaIndex !== -1) {
        // Split the string into parts
        const name = author.substring(0, commaIndex).trim();
        const details = author.substring(commaIndex + 1).trim();
        // Return formatted HTML string
        authorHtml = `${name}, <em>${details}</em>`;
    } else {
        // Return the author as is if no comma is found
        authorHtml = author;
    }

    // Check if the recipe was edited and append the Edited label
    if (edited) {
        authorHtml += ` <span style="font-weight: bold; font-style: italic; color: #33ccee; font-family: 'DM Serif Display'; font-size: 13pt; margin-left: 15px;">*Edited</span>`;
    }

    return authorHtml;
}

// Function to display individual recipe details
async function displayRecipeDetails() {
    await loadRecipes();
    
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    const recipe = recipes.find(r => r.id === recipeId);

    if (!recipe) {
        window.location.href = '404.html';
        return;
    }

    const recipeDetailsContainer = document.getElementById('recipe-details');

    // Calculate total time
    const prepTimeMinutes = parseTime(recipe.prepTime);
    const cookTimeMinutes = parseTime(recipe.cookTime);
    const totalTime = formatTime(prepTimeMinutes + cookTimeMinutes);
    const prepTime = formatTime(prepTimeMinutes);
    const cookTime = formatTime(cookTimeMinutes);

    const sourceHtml = recipe.source ? `<p class="recipe-source"><strong>Source:</strong> <a href="${recipe.source}" target="_blank" rel="noopener noreferrer"><em>${recipe.source}</em></a></p>` : '';
    const imageSourceHtml = recipe.imageSource ? `<p><strong>Image Source:</strong><em class="image-source"> ${recipe.imageSource}</em></p>` : '';

    // Create HTML for tags
    const tagsHtml = recipe.tags
        .map(tag => `<span class="recipe-tag">${formatTag(tag)}</span>`)
        .join(' ');

    recipeDetailsContainer.innerHTML = `
        <h2>${recipe.name}</h2>
        <div class="column-page">
            <div class="left-column">
                <div class="recipe-image-container">
                    <img src="${recipe.image}" alt="${recipe.name} Image">
                </div>
                <div class="recipe-tags">${tagsHtml}</div>
                <div class="recipe-times">
                    <img src="images/clock-icon.png" alt="Clock Icon">
                    <p><strong>Prep:</strong> ${prepTime}</p>
                    <p><strong>Cook:</strong> ${cookTime}</p>
                    <p><strong>Total Time:</strong> ${totalTime}</p>
                </div>
                <p><strong>Author:</strong> ${formatAuthor(recipe.author, recipe.edited)}</p>
                <div class="recipe-date">
                    <img src="images/calender-icon.png" alt="Calender Icon">
                    <p><strong>Added on:</strong> ${formatDate(recipe.datetime)}</p>
                </div>
            </div>
            <div class="right-column">
                <p><strong>Servings:</strong> ${recipe.servings}</p>
                <table class="ingredients-table">
                    ${recipe.ingredients.map(ingredient => `
                    <tr>
                        <td>${ingredient
                            .replace(/optional/gi, '<em>optional</em>')
                            .replace(/to garnish/gi, '<em>to garnish</em>')
                        }</td>
                    </tr>`).join('')}
                </table>
                <h3>Method</h3>
                <ol class="method-list">
                    ${recipe.method.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        </div>
        ${sourceHtml}
        ${imageSourceHtml}
    `;
}

// Run the appropriate function based on the current page
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.contains(document.getElementById('recent-recipes'))) {
        displayRecentRecipes();
    }
    if (document.body.contains(document.getElementById('all-recipes'))) {
        displayAllRecipes();
    }
    if (document.body.contains(document.getElementById('recipe-details'))) {
        displayRecipeDetails();
    }
});