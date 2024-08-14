const recipes = [];

// Initialize an empty array to store tag order
let tagOrder = [];
let options = {};

// Function to load options from options.json
async function loadOptions() {
    const response = await fetch('options/options.json');
    const optionsData = await response.json();
    options = optionsData;

    // Extract all tags from options, ignoring categories
    tagOrder = Object.values(options.tags).flat(); 
}

// Function to load all recipe JSON files
async function loadRecipes() {
    const recipeFiles = [
        "recipes/gyudon.json",
        "recipes/pad-kra-pao.json",
        "recipes/tofu-green-goddess-dressing.json",
        "recipes/harissa-chickpea-lamb-meatballs.json"
    ];

    for (const file of recipeFiles) {
        const response = await fetch(file);
        const recipe = await response.json();
        recipes.push(recipe);
    }
}

// Function to load all recipes and options
async function loadRecipesAndOptions() {
    await loadOptions();
    await loadRecipes();
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
        authorHtml += ` <span style="color: red; font-family: 'Archivo Black'; font-size: 12pt; margin-left: 15px;">*EDITED</span>`;
    }

    return authorHtml;
}

function formatTagWithColor(tag) {
    // Tags to exclude
    const tagsToExclude = ["made-up", "favourite"];

    // Check if the tag should be excluded
    if (tagsToExclude.includes(tag)) {
        return ''; // Return empty string to omit the tag
    }

    // Get the formatted tag from options.tag-formats or capitalize the first letter if not found
    const formattedTag = options['tag-formats'][tag] || capitalizeFirstLetter(tag);

    // Return HTML for the tag with formatted text and background color
    return `<span class="recipe-tag">${formattedTag.toUpperCase()}</span>`;
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function sortTags(tags) {
    // Sort tags based on the predefined tag order
    return tags.sort((a, b) => {
        return (tagOrder.indexOf(a) - tagOrder.indexOf(b));
    });
}

function generateNutritionalTable(nutrition) {
    if (!nutrition || !nutrition.columns || nutrition.columns.length === 0) {
        return ''; // Return empty string if no nutritional info
    }

    // Extract columns and rows
    const columns = nutrition.columns;
    const rows = Object.keys(nutrition).filter(key => key !== 'columns');
    
    // Create table headers
    const tableHeaders = columns.map(column => `<th>${column}</th>`).join('');
    
    // Create table rows
    const tableRows = rows.map(row => {
        const isCaloriesRow = row === 'calories';
        return `<tr>
            <td class="nutritional-label">${row.charAt(0).toUpperCase() + row.slice(1)}</td>
            ${columns.map((column, index) => {
                const value = nutrition[row][index];
                return `<td>${isCaloriesRow ? value + ' kcal' : value + ' g'}</td>`;
            }).join('')}
        </tr>`;
    }).join('');

    // Generate HTML table
    const tableHtml = `
    <div class="expandable">
        <div class="expandable__title-bar">
            <span class="expandable__title">
                <div class="two-bracket-container white-brackets">
                    <p class="bracket__archivo">Nutrition</p>
                </div>
            </span>
            <ion-icon class="expandable__icon" name="chevron-forward"></ion-icon>
        </div>
        <div class="expandable__content-wrapper">
            <div class="expandable__content">
                <table class="nutritional-info-table">
                <colgroup>
                    <col style="width: 150px;"> <!-- Fixed width for the first column -->
                    <col style="width: auto;"> <!-- Remaining space for the second column -->
                </colgroup>
                <thead>
                    <tr><th></th>${tableHeaders}</tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            </div>
        </div>
    </div>
    `;
    setTimeout(() => {
        adjustColumnWidths();
    }, 0);
    
    return tableHtml;
}

function adjustColumnWidths() {
    const table = document.querySelector('.nutritional-info-table');
    if (!table) return;

    const headers = table.querySelectorAll('thead th');
    const cells = table.querySelectorAll('tbody td');

    // Get max width of each header cell
    const columnWidths = Array.from(headers).map(header => header.scrollWidth);

    // Apply column widths to headers and cells
    headers.forEach((header, index) => {
        header.style.maxWidth = `${columnWidths[index] + 10}px`; // Add padding
    });

    cells.forEach(cell => {
        cell.style.maxWidth = `${columnWidths[cell.cellIndex] + 10}px`; // Add padding
    });
}

// Function to display individual recipe details
async function displayRecipeDetails() {
    await loadRecipesAndOptions();
    
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    const recipe = recipes.find(r => r.id === recipeId);

    if (!recipe) {
        window.location.href = '404.html';
        return;
    }

    document.title = `The Consumer - ${recipe.name}`;
    
    const h2Element = document.querySelector('.recipe-title-container h2');
    h2Element.textContent = recipe.name.toUpperCase();

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
    const sortedTags = sortTags(recipe.tags);
    const tagsHtml = sortedTags
        .map(tag => formatTagWithColor(tag))
        .filter(tagHtml => tagHtml !== '') // Filter out empty strings
        .join(' ');

    // Generate HTML for nutritional info
    const nutritionalTableHtml = generateNutritionalTable(recipe.nutrition);

    recipeDetailsContainer.innerHTML = `
        <div class="column-page">
            <div class="left-column">
                <div class="four-bracket-container">
                    <div class="bracket-top-right"></div>
                    <div class="bracket-bottom-left"></div>
                    <div class="recipe-image-container">
                        <img src="${recipe.image}" alt="${recipe.name} Image">
                        <div class="favourite-tag" style="${recipe.tags.includes('favourite') ? (recipe.tags.includes('made-up') ? 'left: 130px;' : 'left: 10px;') : 'display: none;'}">
                            <ion-icon name="heart"></ion-icon>
                            FAVOURITE
                        </div>
                        <div class="made-up-tag" style="${recipe.tags.includes('made-up') ? '' : 'display: none;'}">
                            <ion-icon name="star"></ion-icon>
                            INVENTED
                        </div>
                    </div>
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
                <p><strong>SERVINGS:</strong> ${recipe.servings}</p>
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
        ${nutritionalTableHtml}
        ${sourceHtml}
        ${imageSourceHtml}
        <p><strong>Referred by:</strong><em class="image-source"> ${recipe.through}</em></p>
    `;
}


document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.contains(document.getElementById('recent-recipes'))) {
        await displayRecentRecipes();
    }
    if (document.body.contains(document.getElementById('all-recipes'))) {
        await displayAllRecipes();
    }
    if (document.body.contains(document.getElementById('recipe-details'))) {
        await displayRecipeDetails();
    }

    const backButton = document.querySelector('.recipe-title-container .back-button');

    if (backButton) {
        backButton.addEventListener('click', () => {
            // Check if the referrer is empty
            if (document.referrer === '') {
                // Redirect to index.html if no referrer
                window.location.href = 'index.html';
            } else {
                // Otherwise, go back in history
                window.history.back();
            }
        });
    }

});

document.querySelector('.hover-highlight').addEventListener('mouseover', function() {
    const img = document.getElementById('hover-image');
    const originalSrc = img.src;
    img.dataset.originalSrc = originalSrc; // Save the original src
    const extensionIndex = originalSrc.lastIndexOf('.');
    const highlightedSrc = originalSrc.slice(0, extensionIndex) + '-highlighted' + originalSrc.slice(extensionIndex);
    img.src = highlightedSrc;
});

document.querySelector('.hover-highlight').addEventListener('mouseout', function() {
    const img = document.getElementById('hover-image');
    img.src = img.dataset.originalSrc; // Restore the original src
});