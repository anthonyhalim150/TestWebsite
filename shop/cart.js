async function renderCart() {
    const cartContent = document.getElementById('cart-content');
    const userID = localStorage.getItem('userID');

    if (!cartContent || !userID) return;

    try {
        const response = await fetch(`http://localhost:3000/cart-items?userID=${userID}`);
        const result = await response.json();

        if (!result.success || !result.cartItems || result.cartItems.length === 0) {
            cartContent.innerHTML = `
                <div class="empty-cart text-center">
                    <img src="https://via.placeholder.com/200" alt="Empty Cart" class="mb-3">
                    <p>Your cart is empty.</p>
                </div>
            `;
            return;
        }

        const cartItems = result.cartItems;

        cartContent.innerHTML = `
            <ul class="list-group">
                ${cartItems.map(item => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" class="img-thumbnail me-3" style="width: 50px; height: 50px;">
                            <div>
                                <p class="mb-0"><strong>${item.name}</strong></p>
                                <small>Price: $${item.price}</small>
                            </div>
                        </div>
                        <div class="d-flex align-items-center">
                            <div class="quantity-container me-3">
                                <div class="quantity-control">
                                    <button class="btn btn-secondary" onclick="event.stopPropagation(); changeQuantity('${item.id}', -1, ${item.stock})">-</button>
                                    <input type="number" id="quantity-${item.id}" value="${item.quantity}" min="1" max="${item.stock}" class="quantity-input" onchange="updateQuantity('${item.id}', ${item.stock})">
                                    <button class="btn btn-secondary" onclick="event.stopPropagation(); changeQuantity('${item.id}', 1, ${item.stock})">+</button>
                                </div>
                            </div>
                            <div class="price-container me-3">
                                <span class="price-text">$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            <button class="btn btn-sm btn-danger" onclick="removeItem('${item.id}')">Remove All</button>
                        </div>


                    </li>
                `).join('')}
            </ul>
            <div class="mt-3 text-end">
                <h4>Total: $${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</h4>
                <button class="btn btn-warning me-3" onclick="clearCart()">Clear Cart</button>
                <button class="btn btn-success" onclick="checkout()">Checkout</button>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching cart:', error);
        cartContent.innerHTML = `<p class="text-danger">Failed to load cart. Please try again later.</p>`;
    }
}


async function changeQuantity(itemID, delta, stock) {//From +-
    const quantityInput = document.getElementById(`quantity-${itemID}`);
    const newQuantity = parseInt(quantityInput.value) + delta;

    if (newQuantity < 1 || newQuantity > stock) return;

    quantityInput.value = newQuantity;
    await updateCart(itemID, newQuantity);
}


async function updateQuantity(itemID, stock) {
    const quantityInput = document.getElementById(`quantity-${itemID}`);
    const newQuantity = parseInt(quantityInput.value);

    if (newQuantity < 1 || newQuantity > stock) {
        quantityInput.value = stock; // Reset to max kalo invalid, this is from input.
        return;
    }

    await updateCart(itemID, newQuantity);
}

// Function to update the cart on the backend
async function updateCart(itemID, newQuantity) {
    const userID = localStorage.getItem('userID');
    try {
        const response = await fetch('http://localhost:3000/update-cart-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID, itemID, quantity: newQuantity })
        });

        const result = await response.json();

        if (!result.success) {
            alert('Failed to update cart. Please try again.');
        } else {
            renderCart(); // Refresh cart
        }
    } catch (error) {
        console.error('Error updating cart:', error);
        alert('An error occurred. Please try again.');
    }
}

async function removeItem(itemID) {
    const userID = localStorage.getItem('userID');
    try {
        const response = await fetch('http://localhost:3000/remove-cart-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID, itemID })
        });
        const result = await response.json();

        if (result.success) {
            alert('Item removed from cart.');
            renderCart(); // Refresh cart
        } else {
            alert('Failed to remove item. Please try again.');
        }
    } catch (error) {
        console.error('Error removing item:', error);
        alert('An error occurred. Please try again.');
    }
}

async function clearCart() {
    const userID = localStorage.getItem('userID');

    if (!userID) return;

    try {
        const response = await fetch('http://localhost:3000/clear-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID })
        });
        const result = await response.json();

        if (result.success) {
            alert('Cart cleared successfully.');
            renderCart(); // Refresh cart
        } else {
            alert('Failed to clear cart. Please try again.');
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        alert('An error occurred. Please try again.');
    }
}

async function checkout() {
    const userID = localStorage.getItem('userID');

    if (!userID) {
        alert('You must be logged in to checkout.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID })
        });
        const result = await response.json();

        if (result.success) {
            alert('Thank you for your purchase!');
            renderCart(); // Refresh cart
        } else {
            alert('Checkout failed: ' + result.error);
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('An error occurred during checkout. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});
