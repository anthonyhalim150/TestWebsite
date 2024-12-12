API_URL = 'http://localhost:3000/add-new-product';
async function addProduct(){
    event.preventDefault(); // Prevent form reload

    // Get form data
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const stock = parseInt(document.getElementById('product-stock').value);
    const image = document.getElementById('product-image').value;
    const category = document.getElementById('product-category').value;

    // Validate form inputs
    if (!name || !price || price <= 0 || !stock || stock <= 0 || !description || !image || !category) {
        alert('All fields are required, and price/stock must be positive numbers.');
        return;
    }

    const newProduct = { name, category, price, stock, image, description};

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
        } else {
            alert('Failed to add product. Please try again.');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('An error occurred. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const product_form = document.getElementById('product-form');
    if (product_form) {
        product_form.addEventListener('submit', addProduct);
    }
});
