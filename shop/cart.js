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
                        ${item.name} (${item.quantity})
                        <span>$${item.price}</span>
                    </li>
                `).join('')}
            </ul>
            <div class="mt-3">
                <h4>Total: $${cartItems.reduce((sum, item) => sum + item.price*item.quantity, 0)}</h4>
                <button class="btn btn-success" onclick="checkout()">Checkout</button>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching cart:', error);
        cartContent.innerHTML = `<p class="text-danger">Failed to load cart. Please try again later.</p>`;
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
            localStorage.setItem('cart', JSON.stringify([])); // Clear the local cart
            location.reload(); // Reload the page to refresh cart state
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