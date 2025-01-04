const API_URL = 'https://anthonyhalim-150-723848267249.us-central1.run.app';
let items = [];
async function fetch_products(sorted_items = null) {
    try {
        const response = await fetch(`${API_URL}/users`);
        const data = await response.json();

        if (data.success && data.items) {
            items = data.items;
            if (sorted_items !== null){
                items = sorted_items;
            }
            const productContainer = document.getElementById('product-container tbody');
            productContainer.innerHTML = items.map(product => {
                return `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.username}</td>
                    <td>${product.email}</td>
                    <td>${product.role}</td>
                </tr>
            `;
        }).join('');
        } else {
            console.error('Failed to fetch products:', data.error);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}
function search_users() {
    const query = document.getElementById('search-bar').value.trim().toLowerCase();
    if (query === ''){//Biar kalo ga ada search barnya, itemnya ga ke sort lgi
        fetch_products();
        return;
    }
    // Filter and sort items based on the query
    const filteredItems = items
        .map(item => {
            // Calculate the match score based on the name and description
            const nameMatch = (item.username.toLowerCase().includes(query) ? 1 : 0);
            // Total match score
            const matchScore = nameMatch;

            return { ...item, matchScore };
        })
        .filter(item => item.matchScore > 0) // Filter out items with no match
        .sort((a, b) => {
            // Sort primarily by match score (descending), then by name (ascending)
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return a.username.localeCompare(b.username);
        });

    // Render the filtered items
    fetch_products(filteredItems);
}

document.addEventListener('DOMContentLoaded', () => {
    fetch_products();
});
const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', (event) => {
        search_users(); 
    });
} 
