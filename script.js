document.addEventListener('DOMContentLoaded', () => {
    // Element selections
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const recipeModal = document.getElementById('recipeModal');
    const categoryModal = document.getElementById('categoryModal');
    const loginBtn = document.querySelector('.loginBtn');
    const signupBtn = document.querySelector('.signupBtn');
    const closeButtons = document.querySelectorAll('.close');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const heroSearchForm = document.getElementById('heroSearchForm');
    const heroInput = document.getElementById('heroInput');
    const authButtons = document.querySelector('.auth-buttons');
    const recipeTitle = document.getElementById('recipeTitle');
    const recipeIngredients = document.getElementById('recipeIngredients');
    const recipeInstructions = document.getElementById('recipeInstructions');
    const categoryTitle = document.getElementById('categoryTitle');
    const categoryRecipes = document.getElementById('categoryRecipes');

    // Enhanced Debugging
    console.log('DOM Loaded');
    console.log('Header DOM:', document.querySelector('.header').outerHTML);
    console.log('Initial Auth buttons element:', authButtons, 'Exists:', !!authButtons);

    if (!authButtons) {
        console.error('Critical: Auth buttons not found in DOM. Check HTML structure.');
    }

    // Spoonacular API key
    const apiKey = '1e66e9328b904ad6ab3783341929c3e8'; 

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

    // Function to update header based on login state
    function updateHeader(isLoggedIn) {
        if (!authButtons) {
            console.error('Auth buttons not available');
            return;
        }

        console.log('Updating header, isLoggedIn:', isLoggedIn);
        console.log('Auth buttons classes:', authButtons.className);

        if (isLoggedIn) {
            authButtons.style.display = 'none'; 
        } else {
            authButtons.style.display = 'flex'; 
        }

        // Force reflow to ensure CSS updates
        authButtons.offsetHeight;
    }

    // Initial header update on load
    const loggedInUser = localStorage.getItem('loggedInUser');
    updateHeader(!!loggedInUser);

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
            if (categoryModal && categoryModal.style.display === 'flex') closeModal(categoryModal);
        }
    });

    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;

            const users = getUsers();
            const existingUser = users.find(user => user.email === email);
            if (existingUser) {
                alert('Error: Email already registered. Please use a different email.');
                return;
            }

            const user = { name, email, password };
            saveUser(user);
            alert('Signup successful! You can now log in.');
            closeModal(signupModal);
            signupForm.reset();
            updateHeader(false); 
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const users = getUsers();
            const user = users.find(user => user.email === email && user.password === password);

            if (user) {
                alert(`Login successful! Welcome, ${user.name}!`);
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                updateHeader(true);
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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(
                `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=false`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`Failed to fetch recipe details: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching recipe details:', error.message);
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

        recipeTitle.textContent = details.title;
        recipeIngredients.innerHTML = `
            <h4>Ingredients:</h4>
            <ul>
                ${details.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}
            </ul>
        `;
        recipeInstructions.innerHTML = `
            <h4>Instructions:</h4>
            <p>${details.instructions || 'No instructions available.'}</p>
        `;

        openModal(recipeModal);
    }

    // Function to fetch and render recipes by category in modal
    async function fetchAndRenderRecipesByCategory(category) {
        categoryTitle.textContent = category;
        categoryRecipes.innerHTML = '<p class="loading">Loading...</p>';
        openModal(categoryModal);

        let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&number=6`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const params = {};
        switch (category.toLowerCase()) {
            case 'quick recipes':
                params.maxReadyTime = 30;
                break;
            case 'healthy choices':
                params.healthScore = 70;
                params.diet = 'vegetarian';
                break;
            case 'most popular':
                params.sort = 'popularity';
                params.sortDirection = 'desc';
                break;
            default:
                console.warn('Unknown category:', category);
                categoryRecipes.innerHTML = `<p>Error: Unknown category "${category}".</p>`;
                return;
        }

        url += Object.entries(params)
            .map(([key, value]) => `&${key}=${encodeURIComponent(value)}`)
            .join('');

        console.log('Fetching category URL:', url);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const data = await response.json();
            const recipes = data.results;

            categoryRecipes.innerHTML = '';

            if (recipes.length === 0) {
                categoryRecipes.innerHTML = `<p>No ${category.toLowerCase()} found.</p>`;
                return;
            }

            for (const recipe of recipes.slice(0, 3)) {
                const details = await fetchRecipeDetails(recipe.id);
                if (details) {
                    const tags = getRecipeTags(details);

                    const card = document.createElement('div');
                    card.className = 'recipe-card';
                    card.innerHTML = `
                        <img src="${recipe.image}" alt="${recipe.title}">
                        <div class="recipe-card-content">
                            <h3>${recipe.title}</h3>
                            <p>Ready in ${recipe.readyInMinutes} minutes</p>
                            <div class="recipe-tags">
                                ${tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                            </div>
                            <button class="view-recipe-btn" data-recipe-id="${recipe.id}">View Recipe</button>
                        </div>
                    `;
                    categoryRecipes.appendChild(card);
                }
            }

            document.querySelectorAll('#categoryRecipes .view-recipe-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const recipeId = e.target.getAttribute('data-recipe-id');
                    closeModal(categoryModal);
                    showRecipeModal(recipeId);
                });
            });
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Error fetching category recipes:', error.message);
            categoryRecipes.innerHTML = `<p>Error loading ${category.toLowerCase()}. Please try again later or check your internet connection.</p>`;
        }
    }

    // Event listener for category buttons
    document.querySelector('.categories').addEventListener('click', (e) => {
        const categoryBtn = e.target.closest('.category-btn');
        if (categoryBtn) {
            e.preventDefault();
            const category = categoryBtn.getAttribute('data-category');
            fetchAndRenderRecipesByCategory(category);
        }
    });

    // Handle hero search form submission
    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ingredients = heroInput.value.trim();
            const recipesSection = document.querySelector('#recipes');
            if (recipesSection) recipesSection.scrollIntoView({ behavior: 'smooth' });
            fetchAndRenderRecipesByCategory(ingredients);
            heroInput.value = '';
        });
    }
});
