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

