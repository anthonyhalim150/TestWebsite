let items = [];
let cartItems = {};  // To store the quantities of items in the cart
let likedItems = [];



// Function to update the login state
async function update_login() {
    const navbarLinks = document.getElementById('navbar-links');
    
    // Fetch userID and role using the functions from auth.js
    const userID = await getCookie();  // Use auth.js to get the user ID securely
    const role = get_user_role();  // Get the user role using the provided function from auth.js

    if (userID) {
        if (role === 'admin') {
            window.location.href = './admin/index.html'; // Redirect to admin dashboard
            return;
        }
        
        // User is logged in, update the navbar links
        navbarLinks.innerHTML = `
        <ul class="navbar-icons">
            <li class="nav-item">
                <a class="cart-btn" href="cart.html" id="cart_nav">
                    <img src="Icons/cart.png" title="Cart" alt="Transparent Cart Icon">
                </a>
            </li>
            <li class="nav-item dropdown">
                <a class="dropdown-toggle" href="#" id="profileDropdown" role="button">
                    <img src="Icons/profile.png" title="Profile" alt="Profile Icon" class="profile-btn">
                </a>
                <ul class="dropdown-menu" aria-labelledby="profileDropdown">
                    <li><a class="dropdown-item" href="Dashboard/index.html">Dashboard</a></li>
                    <li><a class="dropdown-item" href="auction.html">Auctions</a></li>
                    <li><a class="dropdown-item" href="settings.html">Settings</a></li>
                    <li><a class="dropdown-item" id="likes_nav"  href="#">Likes</a></li>
                    <li><a class="dropdown-item" id="logout_nav" href="#">Logout</a></li>
                </ul>
            </li>
            <li class="nav-item">
                <button id="customer-support" class="support-btn">
                    <img src="Icons/customer-support.png" title="Customer Support" alt="Feedback">
                </button>
            </li>
        </ul>
        `;

        // Event listener for 'Likes'
        const likesNav = document.getElementById('likes_nav');
        if (likesNav) {
            likesNav.addEventListener('click', (event) => {
                event.preventDefault(); 
                show_likes(userID);  // Show liked items
                window.location.href = 'like.html';
            });
        }

        clear_login();  // Call function to clear login data (if needed)
    } else {
        // User is logged out, show login/signup links
        navbarLinks.innerHTML = `
        <ul class="navbar-icons">
            <li class="nav-item">
                <a class="cart-btn" href="#" id="cart_nav">
                    <img src="Icons/cart.png" title="Cart" alt="Transparent Cart Icon">
                </a>
            </li>
            <li class="nav-item dropdown">
                <a class="dropdown-toggle" href="#" id="profileDropdown" role="button">
                    <img src="Icons/profile.png" title="Profile" alt="Profile Icon" class="profile-btn">
                </a>
                <ul class="dropdown-menu" aria-labelledby="profileDropdown">
                    <li><a class="dropdown-item" href="signup.html">Sign Up</a></li>
                    <li><a class="dropdown-item" href="login.html">Login</a></li>
                </ul>
            </li>
            <li class="nav-item">
                <button id="customer-support" class="support-btn">
                    <img src="Icons/customer-support.png" title="Customer Support" alt="Feedback">
                </button>
            </li>
        </ul>
        `;

        prevent_cart(userID);  // Prevent access to the cart if not logged in
    }

    setup_icon();  // Initialize profile dropdown or other settings
}

// Function to show likes, now using getCookie for userID retrieval
function show_likes(userID) {
    renderItems(likedItems);
}

// Function to prevent cart access, now using getCookie for userID retrieval
function prevent_cart(userID) {
    const cartNav = document.getElementById('cart_nav');
    if (cartNav) {
        cartNav.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent navigation
            if (!userID) {
                alert('You must be logged in to access your cart.');
                return;
            }
        });
    }
}

// Function to set up the profile icon dropdown
function setup_icon() {
    const profileDropdown = document.querySelector('#profileDropdown');
    if (profileDropdown) {
        profileDropdown.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior
            const dropdownMenu = this.nextElementSibling; // Get the dropdown menu
            // Toggle visibility of the dropdown menu
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown if clicking outside
        document.addEventListener('click', function (event) {
            const dropdown = document.querySelector('.dropdown-menu');
            if (dropdown && !profileDropdown.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
}
async function clear_login() {
    const login = document.getElementById('logout_nav');
    login.addEventListener('click', async () => {
        try {
            // Make a POST request to the logout endpoint
            const response = await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include', // Include cookies in the request
            });

            if (response.ok) {
                alert('You have logged out.');
                window.location.href = 'login.html'; // Redirect to login page
            } else {
                const data = await response.json();
                console.error('Logout failed:', data.message);
                alert('Failed to log out. Please try again.');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('An error occurred while logging out.');
        }
    });
}


// Fetch items from the backend
async function fetchItems() {
    const userID = getCookie(); // Get userID from cookies

    try {
        const encodedUserID = encodeURIComponent(userID);
        const response = await fetch(`${API_URL}/items?userID=${encodedUserID}`);
        const data = await response.json();

        if (data.success && data.items) {
            items = data.items; // Store items from the response
            await fetchCartItems(userID); // Fetch cart items after fetching shop items
            renderItems(); // Render items after they are fetched
        } else {
            console.error('Failed to fetch items:', data.error);
        }
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

// Fetch cart items to keep track of quantities
async function fetchCartItems(userID) {
    try {
        const response = await fetch(`${API_URL}/cart-items?userID=${userID}`);
        const data = await response.json();

        if (data.success && data.cartItems) {
            // Update the cartItems object with quantities
            cartItems = {};
            data.cartItems.forEach(item => {
                cartItems[item.item_id] = item.quantity;
            });
        } else {
            console.error('Failed to fetch cart items:', data.error);
        }
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }
}

// Add item to cart
async function addToCart(itemID) {
    const userID = getCookie(); // Get userID from cookies
    const quantityInput = document.getElementById(`quantity-${itemID}`);
    const quantity = parseInt(quantityInput.value, 10);
    const item = items.find(i => i.id === itemID);

    if (quantity > item.stock - (cartItems[itemID] || 0)) {
        alert('Insufficient stock available.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID, itemID, quantity }),
            credentials: "include",
        });

        const result = await response.json();
        if (result.success) {
            cartItems[itemID] = (cartItems[itemID] || 0) + quantity; // Update cart quantity
            alert(`${item.name} added to cart.`);
            location.reload();
        } else {
            alert('Failed to add item to cart. Please try again.');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('An error occurred. Please try again later.');
    }
}

function searchItems() {
    const query = document.getElementById('search-bar').value.trim().toLowerCase();
    let desc_match = 0;
    let category_match = 0;
    if (query === ''){//Biar kalo ga ada search barnya, itemnya ga ke sort lgi
        renderItems();
        return;
    }
    const heading = document.querySelector('h2');
    let searched_items = [];
    searched_items = Array.from(items);
    if (heading.textContent == 'Liked Items') {
        searched_items = Array.from(likedItems);
    }
    // Filter and sort items based on the query
    const filteredItems = searched_items
        .map(item => {
            // Calculate the match score based on the name and description
            const nameMatch = (item.name.toLowerCase().includes(query) ? 1 : 0);
            if (item.description !== null){
                desc_match = (item.description.toLowerCase().includes(query) ? 1 : 0);
            }
            if (item.category !== null){
                category_match = (item.category.toLowerCase().includes(query) ? 1 : 0);
            }

            // Total match score
            const matchScore = nameMatch + desc_match + category_match;

            return { ...item, matchScore };
        })
        .filter(item => item.matchScore > 0) // Filter out items with no match
        .sort((a, b) => {
            // Sort primarily by match score (descending), then by name (ascending)
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return a.name.localeCompare(b.name);
        });

    // Render the filtered items
    renderItems(filteredItems);
}
// Render shop items with updated stock, //Event propagation stops it from displaying the showItemOverview for specific buttons
// Function to render items with the ability to filter and display cart quantity
async function renderItems(filteredItems = null) {
    const itemsToRender = filteredItems || items; // Use filtered items if provided, otherwise render all items
    const itemsContainer = document.getElementById('items');
    if (!itemsContainer) return;

    itemsContainer.innerHTML = itemsToRender.map(item => {
        const cartQuantity = cartItems[item.id] || 0; // Quantity of the item in the cart
        const availableStock = item.stock - cartQuantity; // Stock available after subtracting cart quantity

        // Sanitize dynamic content to prevent XSS using sanitizeInput from auth.js
        const sanitizedItemName = sanitizeInput(item.name);
        const formattedPrice = parseFloat(item.price).toLocaleString('en-US');

        // Check if the item is liked (use `likedItems` to track liked items)
        const isLiked = likedItems.some(liked => liked.id === item.id); // `likedItems` is a Set of liked item IDs

        return `
            <div class="col-md-4 mb-4">
                <div class="card" onclick="showItemOverview(${item.id})">
                    <div class="like-icon" onclick="event.stopPropagation(); toggleLike(${item.id})">
                        <img src="${isLiked ? 'Icons/red-heart.png' : 'Icons/white-heart.png'}" alt="Like" />
                    </div>
                    <img src="${item.image}" class="card-img-top" alt="${sanitizedItemName}">
                    <div class="card-body text-center">
                        <h5 class="card-title">${sanitizedItemName}</h5>
                        <p class="card-text">$${formattedPrice}</p>
                        <p class="card-text">Stock: ${availableStock}</p>
                        <div class="quantity-control">
                            <button class="btn btn-secondary" onclick="event.stopPropagation(); changeQuantity(${item.id}, -1)">-</button>
                            <input type="number" id="quantity-${item.id}" value="1" min="1" max="${availableStock}" class="quantity-input" onchange="updateQuantity('${item.id}', ${availableStock})" onclick="event.stopPropagation();">
                            <button class="btn btn-secondary" onclick="event.stopPropagation(); changeQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="btn btn-primary mt-2" onclick="event.stopPropagation(); addToCart(${item.id})">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Function to update the quantity of an item
async function updateQuantity(itemID, stock) {
    const quantityInput = document.getElementById(`quantity-${itemID}`);
    const newQuantity = parseInt(quantityInput.value);

    if (newQuantity < 1 || newQuantity > stock) {
        quantityInput.value = stock; // Reset to max if invalid
        return;
    }
}

// Adjust the quantity value in the input field
function changeQuantity(itemId, delta) {
    const quantityInput = document.getElementById(`quantity-${itemId}`);
    const currentQuantity = parseInt(quantityInput.value, 10);
    const item = items.find(i => i.id === itemId);
    const cartQuantity = cartItems[itemId] || 0;
    const availableStock = item.stock - cartQuantity;
    const newQuantity = currentQuantity + delta;

    if (newQuantity >= 1 && newQuantity <= availableStock) {
        quantityInput.value = newQuantity;
    }
}

// Function to show item overview, sanitized to prevent XSS
function showItemOverview(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const overviewContainer = document.getElementById('item-overview');

    // Sanitize dynamic content before rendering
    const sanitizedItemName = sanitizeInput(item.name);
    const sanitizedItemDescription = sanitizeInput(item.description);
    const sanitizedItemCategory = sanitizeInput(item.category || 'N/A'); // Default 'N/A' if category is not available
    const formattedPrice = parseFloat(item.price).toLocaleString('en-US');
    
    // Render sanitized content
    overviewContainer.innerHTML = `
        <h3>${sanitizedItemName}</h3>
        <img src="${item.image}" alt="${sanitizedItemName}" style="width: 180px; height: 180px; margin-bottom: 15px;">
        <p class="item-description"><strong>Description:</strong> ${sanitizedItemDescription}</p>
        <p class="item-description"><strong>Price:</strong> $${formattedPrice}</p>
        <p class="item-description"><strong>Stock:</strong> ${item.stock}</p>
        <p class="item-description"><strong>Category:</strong> ${sanitizedItemCategory}</p>
        <button class="close-btn" onclick="closeItemOverview()">Close</button>
    `;
    overviewContainer.style.display = 'block';
}


document.addEventListener('click', (event) => {
    const overviewSection = document.getElementById('item-overview');
    const isInsideOverview = overviewSection && overviewSection.contains(event.target);
    const isCloseButton = event.target.closest('.close-btn');
    const isTriggerElement = event.target.closest('.card'); // Adjust trigger as needed

    if (isTriggerElement) {
        const itemId = parseInt(isTriggerElement.dataset.itemId, 10);
        showItemOverview(itemId);
    } else if (!isInsideOverview || isCloseButton) {
        closeItemOverview();
    }
});

function closeItemOverview() {
    const overviewContainer = document.getElementById('item-overview');
    if (overviewContainer){
        overviewContainer.style.display = 'none';
    }
}

async function customer_support(){
    customer_support_button = document.getElementById('customer-support');
    if (customer_support_button){
        customer_support_button.addEventListener('click', function () {
            // Check if the script is already loaded
            if (!document.getElementById('tawk-script')) {
                // Dynamically create the script element
                var s1 = document.createElement("script");
                s1.async = true;
                s1.src = 'https://embed.tawk.to/675fd299af5bfec1dbdc8347/1if74tanu';
                s1.id = 'tawk-script'; // Add an ID to prevent duplicate loading
                s1.setAttribute('crossorigin', '*');
                document.body.appendChild(s1);
            } else {
                // If the script is already loaded, toggle the widget
                if (typeof Tawk_API !== 'undefined') {
                    Tawk_API.toggle();
                }
            }
        }
        )  
    }  
}


// Initial rendering of items and cart
document.addEventListener('DOMContentLoaded', async () => {
    document.body.classList.add('loading');
    loadUserSettings().then(() => {
        document.body.classList.remove('loading');
    });
    await fetchLikedItems(); //To show whats liked and whats not
    await update_login();
    await fetchItems(); // Fetch items when page loads
    const userID = localStorage.getItem('userID');
    if (window.location.pathname.includes('like.html')) {
        show_likes(userID);
    }
    else{
        await renderItems();
    }
    customer_support();
});


const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', (event) => {
        searchItems(); 
    });
} 


// Fetch liked items on page load
// Fetch liked items on page load
async function fetchLikedItems() {
    const currentUserID = getCookie(); // Use getCookie to fetch userID
    if (!currentUserID) {
        console.error("User not logged in.");
        return;
    }

    try {
        // Ensure the userID is encoded before inserting it into the URL
        const encodedUserID = encodeURIComponent(currentUserID); 

        const response = await fetch(`${API_URL}/like-list?userID=${encodedUserID}`);
        const data = await response.json();
        if (data.success) {
            likedItems = data.likedItems.map(item => ({
                ...item,
                name: sanitizeInput(item.name), // Sanitize item name
                description: sanitizeInput(item.description), // Sanitize item description
                category: sanitizeInput(item.category), // Sanitize category
            }));
        }
    } catch (error) {
        console.error('Error fetching liked items:', error);
    }
}


async function toggleLike(itemID) {
    const isLiked = likedItems.some(item => item.id === itemID);
    const currentUserID = getCookie(); // Use getCookie for user authentication

    // Sanitize the itemID to ensure it's safe
    const sanitizedItemID = sanitizeInput(itemID); // Sanitize itemID before making API calls

    try {
        if (isLiked) {
            // Unlike the item
            const response = await fetch(`${API_URL}/delete-like`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: currentUserID, itemID: sanitizedItemID }),
            });

            const data = await response.json();
            if (data.success) {
                if (likedItems.length == 1) {
                    location.reload();
                } else {
                    likedItems = likedItems.filter(item => item.id !== sanitizedItemID); // Remove item with matching ID
                }
            } else {
                console.error(data.error);
            }
        } else {
            // Like the item
            const response = await fetch(`${API_URL}/add-like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: currentUserID, itemID: sanitizedItemID }),
            });

            const data = await response.json();
            if (data.success) {
                likedItems.push({ id: sanitizedItemID });
                await fetchLikedItems(); // Fetch liked items after liking the item
            } else {
                console.error(data.error);
            }
        }

        // Re-render items to update like icons
        renderItems();
    } catch (error) {
        console.error('Error toggling like:', error);
    }
}
async function loadUserSettings() {
    const userID = getCookie(); // Fetch the userID using getCookie to align with your secure cookie handling.
    if (!userID) return;

    const sanitizedUserID = sanitizeInput(userID); // Sanitize the userID to prevent XSS or unsafe characters
    
    try {
        const response = await fetch(`${API_URL}/get-user-settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID: sanitizedUserID }), // Send sanitized userID
        });

        const data = await response.json();
        if (data.success) {
            // Apply the settings
            const { dark_mode, color_scheme } = data.settings;

            // Sanitize color_scheme to ensure it is a valid value
            const sanitizedColorScheme = sanitizeInput(color_scheme);
            document.documentElement.style.setProperty('--primary-color', sanitizedColorScheme);

            // Ensure dark_mode is boolean and safe
            document.documentElement.style.setProperty('--secondary-color', dark_mode ? '#333' : 'light');
            document.documentElement.style.setProperty('--text-color', dark_mode ? '#FFFFFF' : 'black');
        }
        else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error fetching user settings:', error);
    }
}