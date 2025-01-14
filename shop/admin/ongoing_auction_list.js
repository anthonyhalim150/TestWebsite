// Existing API URL and items array remain unchanged
const API_URL = 'https://anthonyhalim-150-723848267249.us-central1.run.app';
let items = [];

async function fetch_products(sorted_items = null) {
    try {
        const response = await fetch(`${API_URL}/auction`);
        const data = await response.json();
        if (data.success && data.items) {
            items = data.items;
            if (sorted_items !== null) {
                items = sorted_items;
            }
            const productContainer = document.getElementById('product-container-tbody');
            productContainer.innerHTML = items.map(product => {
                const formattedStartingTime = product.starting_time ? formatDateTime(product.starting_time) : 'N/A';//Used to access product ID
                const formattedPrice = parseFloat(product.starting_price).toLocaleString('en-US');
                return `
                <tr data-id="${product.id}">
                    <td>
                        <img src="${product.image}" alt="Not Found!" 
                        original-image="${product.image}" class="product-image">
                    </td>
                    <td>${product.item_name}</td>
                    <td>$${formattedPrice}</td>
                    <td>${product.stock}</td>
                    <td>${product.description || 'N/A'}</td>
                    <td>${product.category || 'N/A'}</td>
                    <td>${product.duration || 'N/A'}</td>
                    <td>${formattedStartingTime|| 'N/A'}</td>
                    <td>
                        <a href="bid_history.html?product_id=${product.id}" class="picture-link">
                            <img src="../Icons/bid-history.png" alt="View Bid History" class="button-image">
                        </a>
                    </td>
                </tr>`;
            }).join('');

        }
    }
    catch (error) {
        console.error('Error fetching products:', error);
    }
}  
            

function searchItems() {
    const query = document.getElementById('search-bar').value.trim().toLowerCase();
    let desc_match = 0;
    let category_match = 0;

    if (query === '') {
        fetch_products();
        return;
    }

    const filteredItems = items
        .map(item => {
            const nameMatch = (item.item_name.toLowerCase().includes(query) ? 1 : 0);
            if (item.description !== null) {
                desc_match = (item.description.toLowerCase().includes(query) ? 1 : 0);
            }
            if (item.category !== null) {
                category_match = (item.category.toLowerCase().includes(query) ? 1 : 0);
            }

            const matchScore = nameMatch + desc_match + category_match;
            return { ...item, matchScore };
        })
        .filter(item => item.matchScore > 0)
        .sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return a.item_name.localeCompare(b.item_name);
        });

    fetch_products(filteredItems);
}

function formatDateTime(dateTime) {
    const date = new Date(dateTime);

    const options = {
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true // To use AM/PM format
    };

    return date.toLocaleString('en-US', options).replace(',', '');
}
// Existing event listeners remain unchanged
document.addEventListener('DOMContentLoaded', () => {
    fetch_products();
});

const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', () => {
        searchItems();
    });
}
