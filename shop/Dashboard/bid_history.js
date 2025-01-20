// Define the API URL and bids array
const API_URL = 'https://anthonyhalim-150-723848267249.us-central1.run.app';
let bids = [];

// Fetch bid history for a specific auction item
async function fetch_bid_history(auction_item_id, sorted_bids = null) {
    try {
        const response = await fetch(`${API_URL}/bid-list?auction_item_id=${auction_item_id}`);
        const data = await response.json();

        if (data.success && data.bids) {
            bids = data.bids;
            if (sorted_bids !== null) {
                bids = sorted_bids;
            }

            const bidContainer = document.getElementById('product-container-tbody');
            bidContainer.innerHTML = bids.map(bid => {
                const formattedBidTime = bid.bid_time ? formatDateTime(bid.bid_time) : 'N/A';
                const formattedBidAmount = parseFloat(bid.bid_amount).toLocaleString('en-US');

                return `
                <tr data-id="${bid.id}">
                    <td>${bid.username}</td>
                    <td>$${formattedBidAmount}</td>
                    <td>${formattedBidTime}</td>
                </tr>`;
            }).join('');

        } else {
            console.error('No bids found');
        }
    } catch (error) {
        console.error('Error fetching bid history:', error);
    }
}

// Search through bids based on username
function searchBids() {
    const query = document.getElementById('search-bar').value.trim().toLowerCase();

    if (query === '') {
        fetch_bid_history();
        return;
    }

    const filteredBids = bids
        .map(bid => {
            const usernameMatch = bid.username.toLowerCase().includes(query) ? 1 : 0;
            const matchScore = usernameMatch;
            return { ...bid, matchScore };
        })
        .filter(bid => bid.matchScore > 0)
        .sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return a.username.localeCompare(b.username);
        });

    fetch_bid_history(filteredBids);
}

// Format datetime for display
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

// Fetch bid history when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const auction_item_id = urlParams.get('product_id');
    if (auction_item_id) {
        fetch_bid_history(auction_item_id);
    } else {
        console.error('Auction item ID is missing');
    }
});

// Add event listener for search input
const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', () => {
        searchBids();
    });
}
