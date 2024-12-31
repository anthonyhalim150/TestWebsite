const API_URL = 'http://localhost:3000/items';
const API_add_cart = 'http://localhost:3000/cart';
let items = [];
let cartItems = {};  // To store the quantities of items in the cart
let likedItems = [];
// Function to update the login state
async function update_login() {
    const navbarLinks = document.getElementById('navbar-links');
    const userID = localStorage.getItem('userID');
    const role = localStorage.getItem('role'); 
    if (get_user_role() !== role){
        alert("Token changed, alert developer of the error!"); //Jangan sampe masuk sini
        window.location.href = './index.html';
    }
    if (userID) {
        if (role === 'admin') {
            window.location.href = './Admin/index.html';
        }
        // User is logged in
        navbarLinks.innerHTML = `
        <ul class="navbar-icons">
            <li class="nav-item">
                <a class="cart-btn" href="cart.html" id="cart_nav">
                    <img src="Icons/cart.png" alt="Transparent Cart Icon">
                </a>
            </li>
            <li class="nav-item dropdown">
                <a class="dropdown-toggle" href="#" id="profileDropdown" role="button">
                    <img src="Icons/profile.png" alt="Profile Icon" class="profile-btn">
                </a>
                <ul class="dropdown-menu" aria-labelledby="profileDropdown">
                    <li><a class="dropdown-item" id="settings_nav" href="settings.html">Settings</a></li>
                    <li><a class="dropdown-item" id="likes_nav" href="#">Likes</a></li>
                    <li><a class="dropdown-item" id="logout_nav" href="#">Logout</a></li>
                </ul>
            </li>
            <li class="nav-item">
                <button id="customer-support" class="support-btn">
                    <img src="Icons/customer-support.png" alt="Feedback">
                </button>
            </li>
        </ul>
        `;
        const likesNav = document.getElementById('likes_nav');
        if (likesNav) {
            likesNav.addEventListener('click', (event) => {
                event.preventDefault(); 
                show_likes(userID);
            })
        }
        clear_login();
    } else {
        // User is logged out
        navbarLinks.innerHTML = `
        <ul class="navbar-icons">
            <li class="nav-item">
                <a class="cart-btn" href="#" id="cart_nav">
                    <img src="Icons/cart.png" alt="Transparent Cart Icon">
                </a>
            </li>
            <li class="nav-item dropdown">
                <a class="dropdown-toggle" href="#" id="profileDropdown" role="button">
                    <img src="Icons/profile.png" alt="Profile Icon" class="profile-btn">
                </a>
                <ul class="dropdown-menu" aria-labelledby="profileDropdown">
                    <li><a class="dropdown-item" href="login.html">Login</a></li>
                    <li><a class="dropdown-item" href="signup.html">Sign Up</a></li>
                </ul>
            </li>
            <li class="nav-item">
                <button id="customer-support" class="support-btn">
                    <img src="Icons/customer-support.png" alt="Feedback">
                </button>
            </li>
        </ul>
        `;
        prevent_cart(userID);
   
    }
    setup_icon(); 
}
function show_likes(userID){
    if (!userID) {//Jangan sampe masuk sini
        window.location.href = 'signup.html';
        alert('You must be logged in to access likes. Alert Developer of this error!');
        return;
    }
    // Save the current view as "likedItems"
    localStorage.setItem('currentView', 'likedItems');
    const heading = document.querySelector('h2');
    if (heading) {
        heading.textContent = 'Liked Items'; // Change the text to 'Liked Items'
    }
    renderItems(likedItems);
}

function prevent_cart(userID){
    const cartNav = document.getElementById('cart_nav');
        if (cartNav) {
            cartNav.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent navigation
                if (!userID) {
                    window.location.href = 'signup.html';
                    alert('You must be logged in to access your cart.');
                    return;
                }
            });
        }
}

function setup_icon() {

    // Attach profileDropdown event listener
    const profileDropdown = document.querySelector('#profileDropdown');
    if (profileDropdown) {
        profileDropdown.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior
            const dropdownMenu = this.nextElementSibling; // Get the dropdown menu
            // Toggle visibility
            dropdownMenu.style.display = 
                dropdownMenu.style.display === 'block' ? 'none' : 'block';
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

// Function to clear login data
function clear_login() {
    const login = document.getElementById('logout_nav');
    login.addEventListener('click', () => {
        // Clear user info and refresh the page
        localStorage.clear();
        alert('You have logged out.');
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
    const query = document.getElementById('search-bar').value.trim().toLowerCase();
    let desc_match = 0;
    let category_match = 0;
    if (query === ''){//Biar kalo ga ada search barnya, itemnya ga ke sort lgi
        location.reload();
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
async function renderItems(filteredItems = null) {
    const itemsToRender = filteredItems || items; // Use filtered items if provided, otherwise render all items
    const itemsContainer = document.getElementById('items');
    if (!itemsContainer) return;

    itemsContainer.innerHTML = itemsToRender.map(item => {
        const cartQuantity = cartItems[item.id] || 0; // Quantity of the item in the cart
        const availableStock = item.stock - cartQuantity; // Stock available after subtracting cart quantity

        // Check if the item is liked (use `likedItems` to track liked items)
        const isLiked = likedItems.some(liked => liked.id === item.id); // `likedItems` is a Set of liked item IDs

        return `
            <div class="col-md-4 mb-4">
                <div class="card" onclick="showItemOverview(${item.id})">
                    <div class="like-icon" onclick="event.stopPropagation(); toggleLike(${item.id})">
                        <img src="${isLiked ? 'Icons/red-heart.png' : 'Icons/white-heart.png'}" alt="Like" />
                    </div>
                    <img src="${item.image}" class="card-img-top" alt="${item.name} ">
                    <div class="card-body text-center">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text">$${item.price}</p>
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

async function updateQuantity(itemID, stock) {
    const quantityInput = document.getElementById(`quantity-${itemID}`);
    const newQuantity = parseInt(quantityInput.value);

    if (newQuantity < 1 || newQuantity > stock) {
        quantityInput.value = stock; // Reset to max kalo invalid, this is from input.
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
        <img src="${item.image}" alt="${item.name}" style="width: 180px; height: 180px; margin-bottom: 15px;">
        <p><strong>Description:</strong> ${item.description}</p>
        <p><strong>Price:</strong> $${item.price}</p>
        <p><strong>Stock:</strong> ${item.stock}</p>
        <p><strong>Category:</strong> ${item.category || 'N/A'}</p>
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
    overviewContainer.style.display = 'none';
}

function customer_support(){
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
    await fetchLikedItems(); //To show whats liked and whats not
    await update_login();
    await fetchItems(); // Fetch items when page loads
    const userID = localStorage.getItem('userID');
    const current_view = localStorage.getItem('currentView')
    if (current_view == 'likedItems') {
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
async function fetchLikedItems() {
    const currentUserID = localStorage.getItem('userID');
    try {
        const response = await fetch(`http://localhost:3000/like-list?userID=${currentUserID}`);
        const data = await response.json();
        if (data.success) {
            likedItems = data.likedItems;
        }
    } catch (error) {
        console.error('Error fetching liked items:', error);
    }
}


async function toggleLike(itemID) {
    const isLiked = likedItems.some(item => item.id === itemID);
    const currentUserID = localStorage.getItem('userID');
    if (!currentUserID){
        alert('Login to like an item!');
        window.location.href = 'signup.html';
        return;
    }
    try {
        if (isLiked) {
            // Unlike the item
            const response = await fetch('http://localhost:3000/delete-like', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: currentUserID, itemID }),
            });

            const data = await response.json();
            if (data.success) {
                likedItems = likedItems.filter(item => item.id !== itemID); // Remove item with matching ID
            } else {
                console.error(data.error);
            }
        } else {
            // Like the item
            const response = await fetch('http://localhost:3000/add-like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: currentUserID, itemID }),
            });

            const data = await response.json();
            if (data.success) {
                likedItems.push({ id: itemID});
                await fetchLikedItems();//Klo ga ada ini, nnti pas ke like pertama kali, bakal blm ke fetch liked itemsnya, karena di array cuma store id.
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
