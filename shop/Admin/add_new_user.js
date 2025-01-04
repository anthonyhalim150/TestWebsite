const API_URL = 'https://anthonyhalim-150-723848267249.us-central1.run.app';
async function addProduct(){
    event.preventDefault(); // Prevent form reload??

    // Get form data
    const username = document.getElementById('product-name').value;
    const password = document.getElementById('product-price').value;
    const role = document.getElementById('product-stock').value.toLowerCase();
    const email = document.getElementById('product-category').value;

    // Validate form inputs
    if (!username || !password || !role || !email) {
        alert('All fields are required!');
        return;
    }
    if (role != 'admin' && role != 'user'){
        alert('Role must be either admin or user');
        return;
    }

    const new_user = {username, password, role, email};

    try {
        const response = await fetch(`${API_URL}/add-new-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(new_user),
        });

        const result = await response.json();
        if (result.success) {
            alert('User added successfully!');
        } else {
            alert('Failed to add user. Please try again.');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        alert('An error occurred. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const product_form = document.getElementById('product-form');
    if (product_form) {
        product_form.addEventListener('submit', addProduct);
    }
});
