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
    if (userID) {
        if (role === 'admin') {
            //window.location.href = 'index.html';

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

// Render shop items with updated stock
function renderItems() {
    const itemsContainer = document.getElementById('items');
    if (!itemsContainer) return;
    itemsContainer.innerHTML = items.map(item => { 
        const cartQuantity = cartItems[item.id] || 0; // Quantity of the item in the cart
        const availableStock = item.stock - cartQuantity; // Stock available after subtracting cart quantity
        return `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${item.image}" class="card-img-top" alt="${item.name}">
                    <div class="card-body text-center">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text">$${item.price}</p>
                        <p class="card-text">Stock: ${availableStock}</p>
                        <div class="quantity-control">
                            <button class="btn btn-secondary" onclick="changeQuantity(${item.id}, -1)">-</button>
                            <input type="number" id="quantity-${item.id}" value="1" min="1" max="${availableStock}" class="quantity-input">
                            <button class="btn btn-secondary" onclick="changeQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="btn btn-primary mt-2" onclick="addToCart(${item.id})">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
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


// Initial rendering of items and cart
document.addEventListener('DOMContentLoaded', () => {
    update_login();
    fetchItems(); // Fetch items when page loads
    if (get_user_role() !== localStorage.getItem('role')){
        alert("Token changed"); //Jangan sampe masuk sini
    }
});
