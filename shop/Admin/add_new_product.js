API_URL = 'http://localhost:3000/add-new-product';
async function addProduct(event) {
    event.preventDefault(); // Prevent form reload

    // Get form data
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const stock = parseInt(document.getElementById('product-stock').value);
    const imageFile = document.getElementById('product-image').files[0]; // Get the selected file
    const category = document.getElementById('product-category').value;

    // Validate form inputs
    if (!name || !price || price <= 0 || !stock || stock <= 0 || !description || !imageFile || !category) {
        alert('All fields are required, and price/stock must be positive numbers.');
        return;
    }

    // Create FormData object to send data, including the image file
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('stock', stock);
    formData.append('product-image', imageFile); // Key must match the backend's expected key
    formData.append('category', category);


    try {
        const response = await fetch(API_URL, { // Adjust the endpoint as needed
            method: 'POST',
            body: formData, // FormData includes all fields and the file
        });
        const result = await response.json();
        if (result.success) {
            alert('Product added successfully!');
        } else {
            alert('Failed to add product. Please try again.');
        }
    } catch (error) {
        alert('Product added successfully!');//Have to be changed later
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const product_form = document.getElementById('product-form');
    if (product_form) {
        product_form.addEventListener('submit', addProduct);
    }
});
