async function renderCart() {
    const cartContent = document.getElementById('cart-content');
    const userID = localStorage.getItem('userID');

    if (!cartContent || !userID) return;

    try {
        const response = await fetch(`${API_URL}/cart-items?userID=${userID}`);
        const result = await response.json();

        if (!result.success || !result.cartItems || result.cartItems.length === 0) {
            cartContent.innerHTML = `
                <div class="empty-cart text-center">
                    <img src="icons/empty-cart.png" alt="Empty Cart" class="empty-cart">
                    <p>Your cart is empty!</p>
                </div>
            `;
            return;
        }

        const cartItems = result.cartItems;
        //You can use the functions from another js file as long as your html has it.
        cartContent.innerHTML = `
            <ul class="list-group">
                ${cartItems.map(item => `
                    <div class="card" onclick="showItemOverview(${item.id})">
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
                                        <button class="btn btn-secondary" onclick="handleClick(event,'${item.id}', -1, ${item.stock})">-</button>
                                        <input type="number" id="quantity-${item.id}" value="${item.quantity}" min="0" max="${item.stock}" class="quantity-input" onclick="event.stopPropagation();" onchange="updateQuantity('${item.id}', ${item.stock})">
                                        <button class="btn btn-secondary" onclick="handleClick(event, '${item.id}', 1, ${item.stock})">+</button>
                                    </div>
                                </div>
                                <div class="price-container me-3">
                                    <span class="price-text" onclick="event.stopPropagation();">$${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                                <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); removeItem('${item.id}')">Remove All</button>
                            </div>
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

let timeoutID = null;

function handleClick(event ,itemId, change, stock) {
    const button = event.target;
    event.stopPropagation();
    button.disabled = true;  // Disable the button

    // Clear any existing timeouts
    if (timeoutID) {
        clearTimeout(timeoutID);
    }

    // Schedule the changeQuantity function
    timeoutID = setTimeout(() => {
        changeQuantity(itemId, change, stock);
        button.disabled = false;  // Re-enable the button after the delay
    }, 200);  // Delay of 1000 milliseconds (1 second)
}



async function changeQuantity(itemID, delta, stock) {//From +-
    const quantityInput = document.getElementById(`quantity-${itemID}`);
    const newQuantity = parseInt(quantityInput.value) + delta;

    if (newQuantity < 0 || newQuantity > stock) return;

    quantityInput.value = newQuantity;
    if (newQuantity === 0){
        const removed = await removeItem(itemID); // Await cannot use let, must use const
        if (!removed){
            quantityInput.value = 1; 
        }
    }
    else{
        await updateCart(itemID, newQuantity);
    }
}


async function updateQuantity(itemID, stock) {
    const quantityInput = document.getElementById(`quantity-${itemID}`);
    const newQuantity = parseInt(quantityInput.value);
    if (newQuantity < 0){//Note: Cannot use !newQuantity here as it will think 0 is false
        quantityInput.value = 1; 
        return;
    }
    if (newQuantity > stock) {
        quantityInput.value = stock; // Reset to max kalo invalid, this is from input.
        return;
    }
    if (newQuantity === 0 || !newQuantity){
        const removed = await removeItem(itemID); // Await cannot use let, must use const
        if (!removed){
            quantityInput.value = 1; 
        }
    }
    else{
        await updateCart(itemID, newQuantity);
    }
}

// Function to update the cart on the backend
async function updateCart(itemID, newQuantity) {
    const userID = localStorage.getItem('userID');
    try {
        const response = await fetch(`${API_URL}/update-cart-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID, itemID, quantity: newQuantity })
        });

        const result = await response.json();

        if (!result.success) {
            alert('Failed to update cart. Please try again.');
        } else {
            renderCart(); // Refresh cart
            return true;
        }
    } catch (error) {
        console.error('Error updating cart:', error);
        alert('An error occurred. Please try again.');
    }
}

async function removeItem(itemID) {
    let user_response = confirm('Are you sure to remove this item?');
    const userID = localStorage.getItem('userID');
    if (!user_response){
        return false;
    }
    try {
        const response = await fetch(`${API_URL}/remove-cart-item`, {
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
        const response = await fetch(`${API_URL}/clear-cart`, {
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
        const response = await fetch(`${API_URL}/checkout`, {
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

async function create_checkout_page(){
    const userID = localStorage.getItem('userID');
    if (!userID) {
        alert('You must be logged in to checkout.');
        return;
    }

    try {
        // Create a checkout session
        const response = await fetch(`${API_URL}/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID }),
        });

        const result = await response.json();

        if (!result.success) {
            alert('Failed to start the checkout process: ' + result.error);
            return;
        }
        const stripe = Stripe('your_publishable_key'); // Use your Stripe publishable key
        await stripe.redirectToCheckout({ sessionId: result.sessionId });
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('An error occurred during checkout. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});
