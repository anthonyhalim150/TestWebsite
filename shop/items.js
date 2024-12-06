const items = [
    { id: 1, name: 'Laptop', price: 1000.00, image: 'https://via.placeholder.com/300', stock: 10 },
    { id: 2, name: 'Phone', price: 800.00, image: 'https://via.placeholder.com/300', stock: 15 },
];

// Safely initialize the cart with localStorage handling
const cart = (() => {
    const storedCart = localStorage.getItem('cart');
    try {
        return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
        console.error('Error parsing cart data from localStorage:', e);
        return [];
    }
})();

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
                    <p class="card-text">$${item.price.toFixed(2)}</p>
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

// Adjust the quantity value in the input field
function changeQuantity(itemId, delta) {
    const quantityInput = document.getElementById(`quantity-${itemId}`);
    const currentQuantity = parseInt(quantityInput.value, 10);
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

    item.stock -= quantity; // Deduct from stock
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
    renderItems();
    renderCart();
});
