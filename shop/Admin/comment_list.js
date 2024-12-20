const API_URL = 'http://localhost:3000/comments';
let items = [];

// Function to fetch products and render them along with AI analysis results
async function fetch_products(sorted_items = null) {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success && data.items) {
            items = data.items;
            if (sorted_items !== null) {
                items = sorted_items;
            }

            // Fetch AI analysis results and attach them to the comments
            const analysisResults = await fetchAnalysisResults(); // Fetch analysis results from the server
            items.forEach(item => {
                // Match the analysis results with the corresponding comment
                const analysis = analysisResults.find(result => result.comment == item.comment);
                if (analysis) {
                    item.predicted_importance = analysis.predicted_importance;
                    item.predicted_quality = analysis.predicted_quality;
                } else {
                    item.predicted_importance = 0; // Default value if no analysis available
                    item.predicted_quality = 0;
                }
            });

            // Render the items along with the analysis results
            const productContainer = document.getElementById('product-container tbody');
            productContainer.innerHTML = items.map(item => {
                return `
                    <tr>
                        <td class="importance-rating">${renderExclamationMarks(item.predicted_importance)}</td> <!-- Importance Rating -->
                        <td>${item.username}</td>
                        <td>${item.comment}</td>
                        <td class="comment-rating" id="comment-rating">${renderStars(item.predicted_quality)}</td> <!-- Quality Rating -->
                        <td>${new Date(item.created_at).toLocaleString()}</td>
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

// Function to render star ratings based on numeric values
function renderStars(rating) {
    const fullStar = '★';
    const emptyStar = '☆';
    const halfStar = '⯪';  // Or use '½' for half star

    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += fullStar; // Full star
        } else if (i - 0.5 <= rating && rating < i) {
            stars += halfStar; // Half star
        } else {
            stars += emptyStar; // Empty star
        }
    }
    return stars;
}

function renderExclamationMarks(rating) {
    let marks = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            // Full red
            marks += '<span class="full">!</span>';
        } else if (i - 0.5 <= rating && rating < i) {
            // Half-filled red with calculated gradient
            const fillPercentage = Math.round((rating - Math.floor(rating)) * 100); // Calculate percentage
            marks += `
                <span 
                    class="half" 
                    style="background: linear-gradient(to right, red ${fillPercentage}%, rgb(232, 230, 230) ${fillPercentage}%); 
                           -webkit-background-clip: text; 
                           background-clip: text; 
                           color: transparent;">
                    !
                </span>`;
        } else {
            // Light gray for empty
            marks += '<span class="empty">!</span>';
        }
    }
    return marks;
}


// Function to fetch AI analysis results from the server
async function fetchAnalysisResults() {
    try {
        const response = await fetch('http://localhost:3000/analyze-comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'success') {
            return data.ratings;
        } else {
            console.error('Failed to fetch analysis results:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching analysis results:', error);
        return [];
    }
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    fetch_products();
});

// Search functionality
function search_users() {
    const query = document.getElementById('search-bar').value.trim().toLowerCase();
    if (query === '') {
        fetch_products();
        return;
    }

    const filteredItems = items
        .map(item => {
            const nameMatch = item.username.toLowerCase().includes(query) ? 1 : 0;
            const commentMatch = item.comment.toLowerCase().includes(query) ? 1 : 0;
            const matchScore = nameMatch + commentMatch;

            return { ...item, matchScore };
        })
        .filter(item => item.matchScore > 0)
        .sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return a.username.localeCompare(b.username);
        });

    fetch_products(filteredItems);
}

const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', search_users);
}
