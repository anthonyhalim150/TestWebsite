const API_URL = 'http://localhost:3000/transactions'; // Correct endpoint
let items = []; // Stores the transactions fetched from the server

async function fetch_products(sorted_items = null) {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (Array.isArray(data)) { // Check if data is an array of transactions
            items = sorted_items || data; // Use sorted items if provided, otherwise use fetched data

            const productContainer = document.getElementById('product-container tbody');
            productContainer.innerHTML = items.map(transaction => `
                <tr>
                    <td>${transaction.transaction_id}</td>
                    <td>${transaction.username}</td>
                    <td>$${transaction.total_amount}</td>
                    <td><pre>${transaction.description}</pre></td>
                    <td>${new Date(transaction.created_at).toLocaleString()}</td>
                </tr>
            `).join('');
        } else {
            console.error('Failed to fetch transactions: Invalid response format');
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

function search_users() {
    const query = document.getElementById('search-bar').value.trim().toLowerCase();
    if (query === '') { // If the search bar is empty, reload the original list
        fetch_products();
        return;
    }

    // Filter and sort items based on the query
    const filteredItems = items
        .map(item => {
            // Calculate the match score based on the username, description, and date
            const usernameMatch = item.username.toLowerCase().includes(query) ? 1 : 0;
            const descriptionMatch = item.description.toLowerCase().includes(query) ? 1 : 0;
            const dateMatch = new Date(item.created_at).toLocaleString().toLowerCase().includes(query) ? 1 : 0;

            // Total match score
            const matchScore = usernameMatch + descriptionMatch + dateMatch;

            return { ...item, matchScore };
        })
        .filter(item => item.matchScore > 0) // Filter out items with no match
        .sort((a, b) => {
            // Sort primarily by match score (descending), then by username (ascending)
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return a.username.localeCompare(b.username);
        });

    // Render the filtered items
    fetch_products(filteredItems);
}

document.addEventListener('DOMContentLoaded', () => {
    fetch_products(); // Fetch and display transactions on page load
});

const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', () => {
        search_users(); 
    });
}
