// Existing API URL and items array remain unchanged
const API_URL = 'https://anthonyhalim-150-723848267249.us-central1.run.app';
let items = [];

async function fetch_products(sorted_items = null) {
    try {
        const response = await fetch(`${API_URL}/expired-auction`);
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
                    <td>Ongoing</td>
                    <td>
                        <a href="bid_history.html?product_id=${product.id}" class="picture-link">
                            <img src="../Icons/bid-history.png" alt="View Bid History" class="button-image">
                        </a>
                    </td>
                </tr>`;
            }).join('');

            // Add click event listeners to rows
            document.querySelectorAll('#product-container tbody tr').forEach(row => {
                row.addEventListener('click', () => {
                    const productId = row.getAttribute('data-id');
                    const product = items.find(item => item.id == productId);
                    displayProductOverview(product);
                }); 
            })
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

function displayProductOverview(product) {
    const overviewSection = document.getElementById('product-overview');
    overviewSection.style.display = 'block';

    // Populate the overview card with product details
    document.getElementById('product-image').src = product.image;
    document.getElementById('product-name').value = product.item_name;
    document.getElementById('product-price').value = parseFloat(product.starting_price).toLocaleString('en-US');
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-duration').value = product.duration;
    const startingTime = new Date(product.starting_time);

    // Use toLocaleString() to get the formatted local time, hour12: is false, since datetime-local input ga support AM/PM, but it will automatically convert things like 13:00 to 1:00 PM
    const formattedTime = startingTime.toLocaleString('en-CA', { hour12: false }).replace(',', '').slice(0, 16);

    // Set the formatted value to the datetime-local input
    document.getElementById('product-start').value = formattedTime;

}

const productPriceInput = document.getElementById("product-price");
if (productPriceInput){
    productPriceInput.addEventListener("input", (event) => {
        let rawValue = event.target.value.replace(/,/g, ''); // Remove commas
        if (!isNaN(rawValue) && rawValue !== "") {
            const [whole, decimal] = rawValue.split('.'); // Split into whole and decimal parts
            // Format whole part with commas and append decimal part if exists
            event.target.value = decimal !== undefined 
                ? parseFloat(whole).toLocaleString('en-US') + '.' + decimal 
                : parseFloat(whole).toLocaleString('en-US');
        } else {
            event.target.value = ""; // Clear invalid input
        }
    });
    
    productPriceInput.addEventListener("blur", (event) => {
        let rawValue = event.target.value.replace(/,/g, ''); // Remove commas for raw value
        if (!isNaN(rawValue) && rawValue !== "") {
            event.target.value = parseFloat(rawValue).toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            }); // Format with two decimal places
        } else {
            event.target.value = ""; // Clear invalid input
        }
    });
    
}
// Hide product overview when clicking outside
document.addEventListener('click', (event) => {
    const overviewSection = document.getElementById('product-overview');
    const closeBtn = event.target.closest('.close-btn');
    if (!overviewSection.contains(event.target) && !event.target.closest('tr') || closeBtn) {
        overviewSection.style.display = 'none';
    }
});

// Add row click events dynamically
document.querySelectorAll('#product-container tbody tr').forEach(row => {
    row.addEventListener('click', () => {
        const productId = row.getAttribute('data-id');
        const product = items.find(item => item.id == productId);

        // Highlight the selected row
        document.querySelectorAll('#product-container tbody tr').forEach(r => r.classList.remove('highlight-row'));
        row.classList.add('highlight-row');

        displayProductOverview(product);
    });
});

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
