// Function to add a new product
async function addProduct(event) {
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', addProduct); // Prevent form reload
    }

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