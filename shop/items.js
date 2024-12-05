const items = [
    { id: 1, name: 'Laptop', price: 1000.00, image: 'https://via.placeholder.com/300' },
    { id: 2, name: 'Phone', price: 800.00, image: 'https://via.placeholder.com/300' },
];

const cart = JSON.parse(localStorage.getItem('cart')) || [];

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
                    <button class="btn btn-primary" onclick="addToCart(${item.id})">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCart() {
    const cartContent = document.getElementById('cart-content');
    if (!cartContent) return;

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <img src="https://via.placeholder.com/200" alt="Empty Cart">
                <p>Your cart is empty.</p>
            </div>
        `;
        return;
    }

    cartContent.innerHTML = `
        <ul class="list-group">
            ${cart.map(item => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${item.name} 
                    <span>$${item.price.toFixed(2)}</span>
                </li>
            `).join('')}
        </ul>
        <div class="mt-3">
            <h4>Total: $${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</h4>
            <button class="btn btn-success" onclick="checkout()">Checkout</button>
        </div>
    `;
}

function addToCart(id) {
    const item = items.find(i => i.id === id);
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${item.name} added to cart.`);
}

function checkout() {
    alert('Thank you for your purchase!');
    localStorage.setItem('cart', JSON.stringify([]));
    location.reload();
}

document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin123') {
        alert('Welcome Admin!');
    } else if (username === 'customer' && password === 'customer123') {
        alert('Welcome Customer!');
    } else {
        alert('Invalid login!');
    }
});

renderItems();
renderCart();