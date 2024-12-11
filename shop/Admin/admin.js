const API_URL = 'http://localhost:3000/items';
const API_SALES_URL = 'http://localhost:3000/sales'; // Assuming an API to get sales data


function crawler_check(){
    const userRole = localStorage.getItem('role'); 
    if (window.location.pathname === '/shop/admin.html' && (userRole !== 'admin' || get_user_role()!== 'admin')) {
        window.location.href = 'shop.html';  // Redirect to non-admins to homepage
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

// Admin Dashboard - Fetch shop metrics
async function fetchShopMetrics() {
    try {
        const response = await fetch(API_SALES_URL);
        const data = await response.json();

        if (data.success) {
            document.getElementById('total-sales').textContent = data.totalSales;
            document.getElementById('total-items-sold').textContent = data.totalItemsSold;
            document.getElementById('total-products-in-stock').textContent = data.totalProductsInStock;
        } else {
            console.error('Failed to fetch shop metrics:', data.error);
        }
    } catch (error) {
        console.error('Error fetching shop metrics:', error);
    }
}

// Function to add a new product
async function addProduct(event) {
    event.preventDefault(); // Prevent form submission

    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const stock = parseInt(document.getElementById('product-stock').value);
    const image = document.getElementById('product-image').value;
    const category = document.getElementById('product-category').value;

    const newProduct = {
        name,
        price,
        description,
        stock,
        image,
        category
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProduct),
        });

        const result = await response.json();
        if (result.success) {
            alert('Product added successfully!');
            fetchProducts(); // Reload product list
        } else {
            alert('Failed to add product. Please try again.');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('An error occurred. Please try again later.');
    }
}

// Function to fetch products
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success && data.items) {
            const products = data.items;
            const productContainer = document.getElementById('product-container');
            productContainer.innerHTML = products.map(product => {
                return `
                    <div class="product-card">
                        <img src="${product.image}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>Price: $${product.price}</p>
                        <p>Stock: ${product.stock}</p>
                        <p>Description: ${product.description}</p>
                        <p>Category: ${product.category || 'N/A'}</p>
                    </div>
                `;
            }).join('');
        } else {
            console.error('Failed to fetch products:', data.error);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function clear_login() {
    const login = document.getElementById('logout_nav');
    login.addEventListener('click', () => {
        // Clear user info and refresh the page
        localStorage.clear();
        alert('You have logged out.');
        window.location.href = 'login.html';
    });
}

function open_drop_down(){
    const drop_down_toggle = document.querySelector('.dropdown-toggle');
    const drop_down = document.querySelector('.dropdown');

    drop_down_toggle.addEventListener('click', (event) => {
        event.preventDefault();
        drop_down.classList.toggle('open');
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    open_drop_down();
    if (productForm) {
        productForm.addEventListener('submit', addProduct); // Prevent form reload
    }
    crawler_check();
    clear_login();
});
