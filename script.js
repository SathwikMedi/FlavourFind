document.addEventListener('DOMContentLoaded', () => {
    // Load Anime.js library
    const animeScript = document.createElement('script');
    animeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
    document.head.appendChild(animeScript);
    
    animeScript.onload = function() {
        // Hero card entrance animation (immediate on load)
        anime({
            targets: '.hero-card',
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutExpo'
        });

        // Make static recipe cards functional on page load
        attachStaticCardListeners();

        // Set up Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px'
        };

        const animateOnScroll = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    
                    // Animate category cards
                    if (target.classList.contains('categories')) {
                        anime({
                            targets: '.category-card',
                            translateY: [30, 0],
                            opacity: [0, 1],
                            delay: anime.stagger(150),
                            duration: 800,
                            easing: 'easeOutQuad'
                        });
                        observer.unobserve(target);
                    }
                    
                    // Animate stats cards
                    if (target.classList.contains('info')) {
                        anime({
                            targets: '.stats-card',
                            scale: [0.8, 1],
                            opacity: [0, 1],
                            delay: anime.stagger(100),
                            duration: 600,
                            easing: 'easeOutElastic(1, .6)'
                        });
                        observer.unobserve(target);
                    }
                    
                    // Animate about section
                    if (target.classList.contains('about')) {
                        anime({
                            targets: '.about h2, .about p',
                            translateY: [20, 0],
                            opacity: [0, 1],
                            delay: anime.stagger(100),
                            duration: 600,
                            easing: 'easeOutQuad'
                        });
                        observer.unobserve(target);
                    }
                    
                    // Animate contact section
                    if (target.classList.contains('contact')) {
                        anime({
                            targets: '.contact h2, .contact p',
                            scale: [0.9, 1],
                            opacity: [0, 1],
                            delay: anime.stagger(100),
                            duration: 600,
                            easing: 'easeOutQuad'
                        });
                        observer.unobserve(target);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(animateOnScroll, observerOptions);
        
        // Observe sections that should animate on scroll
        const sectionsToAnimate = document.querySelectorAll('.categories, .info, .about, .contact');
        sectionsToAnimate.forEach(section => observer.observe(section));
    };

    // Function to attach event listeners to static recipe cards
    function attachStaticCardListeners() {
        const staticCards = document.querySelectorAll('.static-card .view-recipe-btn');
        staticCards.forEach(button => {
            button.addEventListener('click', (e) => {
                const recipeId = e.target.getAttribute('data-recipe-id');
                showRecipeModal(recipeId);
            });
        });
    }

    // Select DOM elements
    const loginBtn = document.querySelector('.loginBtn');
    const signupBtn = document.querySelector('.signupBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const recipeModal = document.getElementById('recipeModal');
    const categoryModal = document.getElementById('categoryModal');
    const closeButtons = document.querySelectorAll('.close');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const heroSearchForm = document.getElementById('heroSearchForm');
    const heroInput = document.getElementById('heroInput');
    const recipesGrid = document.getElementById('recipes-container');
    const authButtons = document.querySelector('.auth-buttons');
    const userIcon = document.querySelector('.user-icon');
    const logoutBtn = document.getElementById('logoutBtn');
    const categoryButtons = document.querySelectorAll('.category-btn');

    // Spoonacular API key
    const apiKey = '1e66e9328b904ad6ab3783341929c3e8';

    // Function to open a modal
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Animate modal entrance with Anime.js
            if (window.anime) {
                anime({
                    targets: modal.querySelector('.modal-content'),
                    scale: [0.7, 1],
                    opacity: [0, 1],
                    duration: 400,
                    easing: 'easeOutElastic(1, .8)'
                });
            }
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
    function updateHeader(isLoggedIn, user = null) {
        if (isLoggedIn && authButtons && userIcon && user) {
            authButtons.style.display = 'none';
            userIcon.style.display = 'flex';
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
        } else if (authButtons && userIcon) {
            authButtons.style.display = 'flex';
            userIcon.style.display = 'none';
        }
    }

    // Check login state on page load
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        updateHeader(true, user);
    }

    // Toggle user dropdown
    if (userIcon) {
        userIcon.addEventListener('click', () => {
            const dropdown = userIcon.querySelector('.user-dropdown');
            dropdown.classList.toggle('show');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (userIcon && !userIcon.contains(e.target)) {
            const dropdown = userIcon.querySelector('.user-dropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        }
    });

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
                localStorage.setItem('loggedInUser', JSON.stringify(user)); 
                updateHeader(true, user);
                closeModal(loginModal);
                loginForm.reset();
            } else {
                alert('Error: Invalid email or password.');
            }
        });
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            updateHeader(false);
            alert('Logged out successfully!');
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
        
        if (!details) return ['Custom'];
        
        // Check for diet types
        if (details.vegetarian) tags.push('Vegetarian');
        if (details.vegan) tags.push('Vegan');
        if (details.glutenFree) tags.push('Gluten-Free');
        if (details.dairyFree) tags.push('Dairy-Free');
        
        // Check for ready in minutes
        if (details.readyInMinutes && details.readyInMinutes <= 30) {
            tags.push('Quick');
        }
        
        // Check for health score
        if (details.healthScore && details.healthScore >= 70) {
            tags.push('Healthy');
        }
        
        // Check for high protein
        if (details.nutrition && details.nutrition.nutrients) {
            const protein = details.nutrition.nutrients.find(n => n.name === 'Protein');
            if (protein && protein.amount > 20) {
                tags.push('High Protein');
            }
        }
        
        // Check dishTypes for additional tags
        if (details.dishTypes && details.dishTypes.length > 0) {
            if (details.dishTypes.includes('dessert')) tags.push('Dessert');
            if (details.dishTypes.includes('breakfast')) tags.push('Breakfast');
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

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const recipes = await response.json();

            // Clear the container
            recipesGrid.innerHTML = '';
            
            // Update subtitle to reflect search results
            const subtitle = document.querySelector('.results-subtitle');
            if (subtitle) {
                subtitle.textContent = `Found ${recipes.length} recipes matching your ingredients`;
            }

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

            // Animate recipe cards with stagger effect
            if (window.anime) {
                anime({
                    targets: '.recipe-card',
                    translateY: [30, 0],
                    opacity: [0, 1],
                    delay: anime.stagger(100),
                    duration: 600,
                    easing: 'easeOutQuad'
                });
            }

            // Event listener for View Recipe buttons
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

    // Function to fetch recipes by category
    async function fetchCategoryRecipes(category) {
        const categoryRecipesContainer = document.getElementById('categoryRecipes');
        const categoryTitle = document.getElementById('categoryTitle');
        
        // Set category title
        const categoryNames = {
            'quick': 'Quick Recipes',
            'healthy': 'Healthy Choices',
            'popular': 'Most Popular'
        };
        categoryTitle.textContent = categoryNames[category] || 'Recipes';

        categoryRecipesContainer.innerHTML = '<p>Loading recipes...</p>';
        
        let url = '';
        
        // Determine API endpoint based on category
        if (category === 'quick') {
            url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&number=12&maxReadyTime=30&addRecipeInformation=true`;
        } else if (category === 'healthy') {
            url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&number=12&minHealthScore=70&addRecipeInformation=true`;
        } else if (category === 'popular') {
            url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&number=12&sort=popularity&addRecipeInformation=true`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const data = await response.json();
            const recipes = data.results || [];

            categoryRecipesContainer.innerHTML = '';

            if (recipes.length === 0) {
                categoryRecipesContainer.innerHTML = '<p>No recipes found for this category.</p>';
                return;
            }

            // Render recipes
            for (const recipe of recipes) {
                const tags = getRecipeTags(recipe);

                const card = document.createElement('div');
                card.className = 'recipe-card';
                card.innerHTML = `
                    <img src="${recipe.image}" alt="${recipe.title}">
                    <div class="recipe-card-content">
                        <h3>${recipe.title}</h3>
                        <p>${recipe.summary ? recipe.summary.substring(0, 100).replace(/<[^>]*>/g, '') + '...' : 'Delicious recipe to try!'}</p>
                        <div class="recipe-tags">
                            ${tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                        </div>
                        <button class="view-recipe-btn" data-recipe-id="${recipe.id}">View Recipe</button>
                    </div>
                `;
                categoryRecipesContainer.appendChild(card);
            }

            // Animate category modal recipe cards
            if (window.anime) {
                anime({
                    targets: '#categoryModal .recipe-card',
                    translateY: [30, 0],
                    opacity: [0, 1],
                    delay: anime.stagger(80),
                    duration: 500,
                    easing: 'easeOutQuad'
                });
            }

            // Event listener for View Recipe buttons in category modal
            document.querySelectorAll('#categoryModal .view-recipe-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const recipeId = e.target.getAttribute('data-recipe-id');
                    closeModal(categoryModal);
                    showRecipeModal(recipeId);
                });
            });
        } catch (error) {
            console.error('Error fetching category recipes:', error);
            categoryRecipesContainer.innerHTML = '<p>Error fetching recipes. Please try again later.</p>';
        }
    }

    // Handle category button clicks
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            fetchCategoryRecipes(category);
            openModal(categoryModal);
        });
    });

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
