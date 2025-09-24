// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements
    const loginBtn = document.querySelector('.loginBtn');
    const signupBtn = document.querySelector('.signupBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const recipeModal = document.getElementById('recipeModal');
    const closeButtons = document.querySelectorAll('.close');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const heroSearchForm = document.getElementById('heroSearchForm');
    const heroInput = document.getElementById('heroInput');
    const recipesGrid = document.getElementById('recipes-container');

    // Spoonacular API key
    const apiKey = '1e66e9328b904ad6ab3783341929c3e8';

    // Debugging
    console.log('Hero search form:', heroSearchForm);
    console.log('Hero input:', heroInput);
    console.log('Recipes grid:', recipesGrid);

    // Function to open a modal
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        } else {
            console.error('Modal not found');
        }
    }

    // Function to close a modal
    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    // Function to get users from localStorage
    function getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    // Function to save user to localStorage
    function saveUser(user) {
        const users = getUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Event listeners for opening modals
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModal);
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(signupModal);
        });
    }

    // Event listeners for closing modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (loginModal && loginModal.style.display === 'flex') closeModal(loginModal);
            if (signupModal && signupModal.style.display === 'flex') closeModal(signupModal);
            if (recipeModal && recipeModal.style.display === 'flex') closeModal(recipeModal);
        }
    });

    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;

            // Check if email already exists
            const users = getUsers();
            const existingUser = users.find(user => user.email === email);
            if (existingUser) {
                alert('Error: Email already registered. Please use a different email.');
                return;
            }

            // Save new user to localStorage
            const user = { name, email, password };
            saveUser(user);
            alert('Signup successful! You can now log in.');
            closeModal(signupModal);
            signupForm.reset();
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Check credentials against localStorage
            const users = getUsers();
            const user = users.find(user => user.email === email && user.password === password);

            if (user) {
                alert(`Login successful! Welcome, ${user.name}!`);
                closeModal(loginModal);
                loginForm.reset();
            } else {
                alert('Error: Invalid email or password.');
            }
        });
    }

    // Function to fetch detailed recipe information
    async function fetchRecipeDetails(recipeId) {
        try {
            const response = await fetch(
                `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=false`
            );
            if (!response.ok) {
                throw new Error(`Failed to fetch recipe details: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            return null;
        }
    }

    // Function to determine tags based on recipe details
    function getRecipeTags(details) {
        const tags = [];
        if (details && details.diets && details.diets.length > 0) {
            const dietMap = {
                'high-protein': 'High Protein',
                'vegetarian': 'Vegetarian',
                'vegan': 'Vegan',
                'gluten-free': 'Gluten-Free',
                'dairy-free': 'Dairy-Free'
            };
            details.diets.forEach(diet => {
                if (dietMap[diet.toLowerCase()]) {
                    tags.push(dietMap[diet.toLowerCase()]);
                }
            });
        }
        if (details && details.healthScore >= 70) {
            tags.push('Healthy');
        }
        return tags.length > 0 ? tags : ['Custom'];
    }

    // Function to populate and show recipe modal
    async function showRecipeModal(recipeId) {
        const details = await fetchRecipeDetails(recipeId);
        if (!details) {
            alert('Failed to load recipe details.');
            return;
        }

        // Populate modal content
        document.getElementById('recipeTitle').textContent = details.title;
        document.getElementById('recipeIngredients').innerHTML = `
            <h4>Ingredients:</h4>
            <ul>
                ${details.extendedIngredients
                    .map(ing => `<li>${ing.original}</li>`)
                    .join('')}
            </ul>
        `;
        document.getElementById('recipeInstructions').innerHTML = `
            <h4>Instructions:</h4>
            <p>${details.instructions || 'No instructions available.'}</p>
        `;

        openModal(recipeModal);
    }

    // Function to fetch recipes and render with modal trigger
    async function fetchAndRenderRecipes(ingredients) {
        // Scroll to recipes section
        const recipesSection = document.querySelector('#recipes');
        if (recipesSection) {
            recipesSection.scrollIntoView({ behavior: 'smooth' });
        }

        if (!ingredients.trim()) {
            recipesGrid.innerHTML = '<p>Please enter ingredients to search.</p>';
            return;
        }

        const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${encodeURIComponent(ingredients)}&number=9&ranking=1`;
        console.log('Fetching URL:', url);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const recipes = await response.json();

            recipesGrid.innerHTML = '';

            if (recipes.length === 0) {
                recipesGrid.innerHTML = '<p>No recipes found. Try different ingredients!</p>';
                return;
            }

            // Fetch details for each recipe and render
            for (const recipe of recipes) {
                const details = await fetchRecipeDetails(recipe.id);
                const tags = getRecipeTags(details);

                const card = document.createElement('div');
                card.className = 'recipe-card';
                card.innerHTML = `
                    <img src="${recipe.image}" alt="${recipe.title}">
                    <div class="recipe-card-content">
                        <h3>${recipe.title}</h3>
                        <p>Uses ${recipe.usedIngredientCount} of your ingredients. Needs ${recipe.missedIngredientCount} more.</p>
                        <div class="recipe-tags">
                            ${tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                        </div>
                        <button class="view-recipe-btn" data-recipe-id="${recipe.id}">View Recipe</button>
                    </div>
                `;
                recipesGrid.appendChild(card);
            }

            //event listener for View Recipe buttons
            document.querySelectorAll('.view-recipe-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const recipeId = e.target.getAttribute('data-recipe-id');
                    showRecipeModal(recipeId);
                });
            });
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipesGrid.innerHTML = '<p>Error fetching recipes. Check your API key or try again later.</p>';
        }
    }

    // Handle hero search form submission
    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ingredients = heroInput.value.trim();
            // Scroll to recipes section before fetching
            const recipesSection = document.querySelector('#recipes');
            if (recipesSection) {
                recipesSection.scrollIntoView({ behavior: 'smooth' });
            }
            fetchAndRenderRecipes(ingredients);
            heroSearchForm.reset();
        });
    }
});