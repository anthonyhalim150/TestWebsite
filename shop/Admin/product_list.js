const API_URL = 'http://localhost:3000/items'
let items = [];
async function fetch_products(sorted_items = null) {
    try {
        const response = await fetch(API_URL);
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
                    <td><img src="${product.image}" alt="Not Found!" style="width: 200px; height: 200px; object-fit: cover;"></td>
                    <td>${product.name}</td>
                    <td>$${product.price}</td>
                    <td>${product.stock}</td>
                    <td>${product.description || 'N/A'}</td>
                    <td>${product.category || 'N/A'}</td>
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
function searchItems() {
    const query = document.getElementById('search-bar').value.trim().toLowerCase();
    let desc_match = 0;
    let category_match = 0;
    if (query === ''){//Biar kalo ga ada search barnya, itemnya ga ke sort lgi
        location.reload();
        return;
    }
    // Filter and sort items based on the query
    const filteredItems = items
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
    fetch_products(filteredItems);
}

document.addEventListener('DOMContentLoaded', () => {
    fetch_products();
});
const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', (event) => {
        searchItems(); 
    });
} 
