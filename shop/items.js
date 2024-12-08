const API_URL = 'http://localhost:3000/items';
let items = [];

function update_login() {
    const navbarLinks = document.getElementById('navbar-links');
    const userID = localStorage.getItem('userID');
    const username = localStorage.getItem('username');
    
    if (userID) {
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
                <a class="nav-link text-white" id = "logout_nav" href="#">Logout</a>
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

function clear_login(){
    const login = document.getElementById('logout_nav');
    login.addEventListener('click', () => {
        // Clear user info and refresh the page
        localStorage.clear();
        alert('You have logged out.');
        location.reload();
    });
}

async function fetchItems() {
    try {
        // Fetch items from the backend
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success && data.items) {
            items = data.items; // Store items from the response
            renderItems(); // Render items after they are fetched
        } else {
            console.error('Failed to fetch items:', data.error);
        }
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

// Render shop items with stock and quantity controls
function renderItems() {
    const itemsContainer = document.getElementById('items');
    if (!itemsContainer) return;
    itemsContainer.innerHTML = items.map(item => `
        <div class="col-md-4 mb-4">
            <div class="card">
                <img src="${item.image}" class="card-img-top" alt="${item.name}">
                <div class="card-body text-center">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">$${item.price}</p>
                    <p class="card-text">Stock: ${item.stock}</p>
                    <div class="quantity-control">
                        <button class="btn btn-secondary" onclick="changeQuantity(${item.id}, -1)">-</button>
                        <input type="number" id="quantity-${item.id}" value="1" min="1" max="${item.stock}" class="quantity-input">
                        <button class="btn btn-secondary" onclick="changeQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="btn btn-primary mt-2" onclick="addToCart(${item.id})">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

const cart = (() => {
    const storedCart = localStorage.getItem('cart');
    try {
        return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
        console.error('Error parsing cart data from localStorage:', e);
        return [];
    }
})();

// Adjust the quantity value in the input field
function changeQuantity(itemId, delta) {
    const quantityInput = document.getElementById(`quantity-${itemId}`);
    const currentQuantity = parseInt(quantityInput.value, 10);//10 means to parse it as decimal(base 10).
    const item = items.find(i => i.id === itemId);
    const newQuantity = currentQuantity + delta;

    if (newQuantity >= 1 && newQuantity <= item.stock) {
        quantityInput.value = newQuantity;
    }
}

// Add an item to the cart
function addToCart(itemId) {
    const quantityInput = document.getElementById(`quantity-${itemId}`);
    const quantity = parseInt(quantityInput.value, 10);
    const item = items.find(i => i.id === itemId);

    if (quantity > item.stock) {
        alert("Insufficient stock available.");
        return;
    }

    const cartItem = cart.find(i => i.id === itemId);

    if (cartItem) {
        cartItem.quantity += quantity;
    } else {
        cart.push({ ...item, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${item.name} added to cart.`);
    renderItems(); // Update stock display
}

// Render the cart contents
function renderCart() {
    const cartContent = document.getElementById('cart-content');
    if (!cartContent) return;

    const validCart = cart.filter(item => item && item.name && item.price);

    if (validCart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart text-center">
                <img src="https://via.placeholder.com/200" alt="Empty Cart" class="mb-3">
                <p>Your cart is empty.</p>
            </div>
        `;
        return;
    }

    cartContent.innerHTML = `
        <ul class="list-group">
            ${validCart.map(item => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${item.name} (${item.quantity})
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </li>
            `).join('')}
        </ul>
        <div class="mt-3">
            <h4>Total: $${validCart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</h4>
            <button class="btn btn-success" onclick="checkout()">Checkout</button>
        </div>
    `;
}

// Handle the checkout process
function checkout() {
    alert('Thank you for your purchase!');
    localStorage.setItem('cart', JSON.stringify([]));  // Clear the cart after checkout
    location.reload();  // Reload the page
}

// Initial rendering of items and cart
document.addEventListener('DOMContentLoaded', () => {
    update_login();
    fetchItems(); // Fetch items when page loads
    renderCart();
});
