const API_URL = 'https://anthonyhalim-150-723848267249.us-central1.run.app';
async function addProduct(event) {
    event.preventDefault(); // Prevent form reload

    // Get form data
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value.replace(/,/g, ''));
    const description = document.getElementById('product-description').value;
    const stock = parseInt(document.getElementById('product-stock').value);
    const imageFile = document.getElementById('product-image').files[0]; // Get the selected file
    const category = document.getElementById('product-category').value;

    // Validate form inputs
    if (!name || !price || price <= 0 || !stock || stock <= 0 || !description || !imageFile || !category) {
        alert('All fields are required, and price/stock must be positive numbers.');
        return;
    }
    if (price > 99999999.99 || stock > 99999999 ){
        alert('Price/stock too high, please enter a number below 99.99 million.');
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
        const response = await fetch(`${API_URL}/add-new-product`, { // Adjust the endpoint as needed
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
        alert('Failed to add product. Please try again.');//Have to be changed later
    }
}

const productPriceInput = document.getElementById("product-price");
if (productPriceInput){
    productPriceInput.addEventListener("input", (event) => {
        let value = event.target.value.replace(/,/g, ''); // Remove commas for the purpose of processing
        // Check if it's a valid number, allowing for decimals
        if (!isNaN(value) && value !== "") {
            event.target.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Add commas as thousands separator
        }
    });

    productPriceInput.addEventListener("blur", (event) => {
        let value = event.target.value.replace(/,/g, ''); // Remove commas to handle the raw number
        if (value === "" || isNaN(value)) {
            event.target.value = ""; // Clear invalid input
        } else {
            // Ensure two decimal places on blur and format with commas
            event.target.value = parseFloat(value).toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2
            });
        }
    });
}



document.addEventListener('DOMContentLoaded', () => {
    const product_form = document.getElementById('product-form');
    if (product_form) {
        product_form.addEventListener('submit', addProduct);
    }
});
