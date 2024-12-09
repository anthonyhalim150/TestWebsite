const API_URL = 'http://localhost:3000/items';
const API_add_cart = 'http://localhost:3000/cart';
let items = [];
let cartItems = {};  // To store the quantities of items in the cart

// Function to update the login state
function update_login() {
    const navbarLinks = document.getElementById('navbar-links');
    const userID = localStorage.getItem('userID');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role'); 
    if (get_user_role() !== role){
        alert("Token changed, alert developer of the error!"); //Jangan sampe masuk sini
        window.location.href = 'shop.html';
    }
    if (userID) {
        if (role === 'admin') {
            window.location.href = 'admin.html';
        }
        // User is logged in
        navbarLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link text-white">Hello, ${username}!</a>
            </li>
            <li class="nav-item">
                <a class="nav-link text-white" href="cart.html">
                    <i class="fas fa-shopping-cart"></i> Cart
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link text-white" id="logout_nav" href="#">Logout</a>
            </li>
        `;
        clear_login();
    } else {
        // User is logged out
        navbarLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link text-white" href="#" id="cart_nav">
                    <i class="fas fa-shopping-cart"></i> Cart
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link text-white" href="login.html">Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link text-white" href="signup.html">Sign Up</a>
            </li>
        `;
        const cartNav = document.getElementById('cart_nav');
        cartNav.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent navigation
            window.location.href = 'signup.html';
            alert('You must be logged in to access your cart.');
        });
    }
}

// Function to clear login data
function clear_login() {
    const login = document.getElementById('logout_nav');
    login.addEventListener('click', () => {
        // Clear user info and refresh the page
        localStorage.clear();
        alert('You have logged out.');
        location.reload();
        window.location.href = 'login.html';
    });
}

// Fetch items from the backend
async function fetchItems() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success && data.items) {
            items = data.items; // Store items from the response
            await fetchCartItems(); // Fetch cart items after fetching shop items
            renderItems(); // Render items after they are fetched
        } else {
            console.error('Failed to fetch items:', data.error);
        }
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

// Fetch cart items to keep track of quantities
async function fetchCartItems() {
    const userID = localStorage.getItem('userID');
    if (!userID) return; // If the user is not logged in, skip fetching cart items

    try {
        const response = await fetch(`http://localhost:3000/cart-items?userID=${userID}`);
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
    const userID = localStorage.getItem('userID');
    const quantityInput = document.getElementById(`quantity-${itemID}`);
    const quantity = parseInt(quantityInput.value, 10);
    const item = items.find(i => i.id === itemID);

    if (!userID) {
        alert('You must be logged in to add items to the cart.');
        return;
    }

    if (quantity > item.stock - (cartItems[itemID] || 0)) {
        alert('Insufficient stock available.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID, itemID, quantity }),
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
    const query = document.getElementById('search-bar').value.toLowerCase();
    let desc_match = 0;
    let category_match = 0;
    if (query === ''){//Biar kalo ga ada search barnya, itemnya ga ke sort lgi
        location.reload();
        return;
    }
    // Filter and sort items based on the query
    const filteredItems = items
        .map(item => {
            // Calculate the match score based on the name and description
            const nameMatch = (item.name.toLowerCase().includes(query) ? 1 : 0);
            if (item.description !== null){
                desc_match = (item.description.toLowerCase().includes(query) ? 1 : 0);
            }
            if (item.category !== null){
                category_match = (item.category.toLowerCase().includes(query) ? 1 : 0);
            }
            console.log(category_match);

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
// Render shop items with updated stock
function renderItems(filteredItems = null) {
    const itemsToRender = filteredItems || items; // Use filtered items if provided, otherwise render all items
    const itemsContainer = document.getElementById('items');
    if (!itemsContainer) return;
    itemsContainer.innerHTML = itemsToRender.map(item => { 
        const cartQuantity = cartItems[item.id] || 0; // Quantity of the item in the cart
        const availableStock = item.stock - cartQuantity; // Stock available after subtracting cart quantity
        return `
            <div class="col-md-4 mb-4">
                <div class="card" onclick="showItemOverview(${item.id})">
                    <img src="${item.image}" class="card-img-top" alt="${item.name}">
                    <div class="card-body text-center">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text">$${item.price}</p>
                        <p class="card-text">Stock: ${availableStock}</p>
                        <div class="quantity-control">
                            <button class="btn btn-secondary" onclick="event.stopPropagation(); changeQuantity(${item.id}, -1)">-</button>
                            <input type="number" id="quantity-${item.id}" value="1" min="1" max="${availableStock}" class="quantity-input">
                            <button class="btn btn-secondary" onclick="event.stopPropagation(); changeQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="btn btn-primary mt-2" onclick="event.stopPropagation(); addToCart(${item.id})">Add to Cart</button>
                    </div>
                </div>
            </div>
        `; //Event propagation stops it from displaying the showItemOverview for specific buttons
    }).join('');
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
function get_user_role() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        return payload.role;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

function showItemOverview(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const overviewContainer = document.getElementById('item-overview');
    overviewContainer.innerHTML = `
        <h3>${item.name}</h3>
        <img src="${item.image}" alt="${item.name}" style="max-width: 100%; margin-bottom: 15px;">
        <p><strong>Description:</strong> ${item.description}</p>
        <p><strong>Price:</strong> $${item.price}</p>
        <p><strong>Stock:</strong> ${item.stock}</p>
        <p><strong>Category:</strong> ${item.category || 'N/A'}</p>
        <button class="btn btn-secondary" onclick="closeItemOverview()">Close</button>
    `;
    overviewContainer.classList.add('visible');
}

function closeItemOverview() {
    const overviewContainer = document.getElementById('item-overview');
    overviewContainer.classList.remove('visible');
}



// Initial rendering of items and cart
document.addEventListener('DOMContentLoaded', () => {
    update_login();
    fetchItems(); // Fetch items when page loads
});

document.getElementById('search-bar').addEventListener('input', (event) => {
    const query = event.target.value.trim();
    searchItems(query); 
});