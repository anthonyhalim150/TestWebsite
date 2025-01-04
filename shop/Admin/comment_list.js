const API_URL = 'https://anthonyhalim-150-723848267249.us-central1.run.app';
let items = [];

// Add flag button functionality
// Modify fetch_products to include red triangle warning
async function fetch_products(sorted_items = null) {
    try {
        const response = await fetch(`${API_URL}/comments`);
        const data = await response.json();

        if (data.success && data.items) {
            items = data.items;
            if (sorted_items !== null) {
                items = sorted_items;
            }

            // Fetch AI analysis results and attach them to the comments
            const analysisResults = await fetchAnalysisResults();
            items.forEach(item => {
                const analysis = analysisResults.find(result => result.comment === item.comment);
                item.predicted_importance = analysis ? analysis.predicted_importance : 0;
                item.predicted_quality = analysis ? analysis.predicted_quality : 0;
            });

            // Render items with a red triangle warning
            const productContainer = document.getElementById('product-container-tbody');
            productContainer.innerHTML = items.map(item => {
                return `
                    <tr>
                        <td class="importance-rating">${renderExclamationMarks(item.predicted_importance)}</td>
                        <td>${item.username}</td>
                        <td>
                        ${item.comment}
                        </td>
                        <td class="comment-rating">${renderStars(item.predicted_quality)}</td>
                        <td>${new Date(item.created_at).toLocaleString()}</td>
                        <td>
                            <span class="red-triangle" data-id="${item.comments_id}" title="Flag this comment">⚠️</span>
                        </td>
                    </tr>
                `;
            }).join('');

            // Add event listeners for the red triangle warning
            document.querySelectorAll('.red-triangle').forEach(triangle => {
                triangle.addEventListener('click', () => {
                    const commentId = triangle.getAttribute('data-id');
                    const comment = items.find(item => item.comments_id == commentId);
                    open_feedback_page(comment);
                });
            });
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}


function open_feedback_page(comment) {
    const feedbackPage = document.getElementById('feedback-page');

    // Display the comment text in a readonly <textarea>
    const commentText = document.createElement('div');
    commentText.innerHTML = `
        <label>Comment:</label>
        <textarea readonly class="feedback-comment">${comment.comment}</textarea>
    `;

    // Render stars for quality and exclamation marks for importance
    const qualityStars = renderStars(comment.predicted_quality || 0);
    const importanceMarks = renderExclamationMarks(comment.predicted_importance || 0);

    // Inject the rendered ratings into the page
    const qualityContainer = document.createElement('div');
    qualityContainer.innerHTML = `
        <label>Website Rating:</label>
        <div class="comment-rating">${qualityStars}</div>
        <input type="number" id="website-rating" min="1" max="5" step="0.01" value="${comment.predicted_quality || 0}" required>
    `;

    const importanceContainer = document.createElement('div');
    importanceContainer.innerHTML = `
        <label>Importance Rating:</label>
        <div class="importance-rating">${importanceMarks}</div>
        <input type="number" id="importance-rating" min="1" max="5" step="0.01" value="${comment.predicted_importance || 0}" required>
    `;

    // Clear previous content and append the updated content
    const form = document.getElementById('feedback-form');
    form.innerHTML = ''; // Clear previous content
    form.appendChild(commentText);  // Add the comment above ratings
    form.appendChild(document.createElement('br')); // Add spacing
    form.appendChild(qualityContainer);  // Add quality rating
    form.appendChild(document.createElement('br')); // Add spacing
    form.appendChild(importanceContainer); // Add importance rating

    // Add the Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Submit';
    form.appendChild(submitButton);

    // Handle form submission
    form.onsubmit = async function (e) {
        e.preventDefault();
        const importance = parseFloat(document.getElementById('importance-rating').value);
        const quality = parseFloat(document.getElementById('website-rating').value);

        if (importance === 0 || quality === 0 || !comment.comment) { // Validate inputs
            alert('Contact Developer of this error!');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comments_id: comment.comments_id,
                    true_importance: importance,
                    true_quality: quality,
                }),
            });

            const data = await response.json();
            if (data.success) {
                alert('Feedback updated successfully!');
                feedbackPage.classList.add('hidden');
                fetch_products(); // Refresh list
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error updating feedback:', error);
        }
    };

    feedbackPage.classList.remove('hidden');
}


// Close feedback page
document.getElementById('close-feedback').addEventListener('click', () => {
    document.getElementById('feedback-page').classList.add('hidden');
});

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
            marks += '<span class="full">!</span>';
        } else if (i - 0.5 <= rating && rating < i) {
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
            marks += '<span class="empty">!</span>';
        }
    }
    return marks;
}



// Function to fetch AI analysis results from the server
async function fetchAnalysisResults() {
    try {
        const response = await fetch(`${API_URL}/analyze-comments`, {
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

document.addEventListener('DOMContentLoaded', () => {
    fetch_products();
});

let importanceSortOrder = 'desc'; // Default order for Importance Rating
let qualitySortOrder = 'desc'; // Default order for Quality Rating

const importanceArrow = document.getElementById('importance-arrow');
const qualityArrow = document.getElementById('quality-arrow');
function sortTableByCriteria(criteria, sortOrder) {
    console.log('Starting sort by:', criteria, 'Order:', sortOrder);

    // Sort the items array
    items.sort((a, b) => {
        const aValue = a[`predicted_${criteria}`] || 0;
        const bValue = b[`predicted_${criteria}`] || 0;
        console.log(`Comparing a=${aValue} to b=${bValue}`);

        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Re-render the table
    fetch_products(items);
}


// Modify event listeners
importanceArrow.addEventListener('click', () => {
    importanceSortOrder = importanceSortOrder === 'asc' ? 'desc' : 'asc';
    importanceArrow.textContent = importanceSortOrder === 'asc' ? '⬆' : '⬇';
    sortTableByCriteria('importance', importanceSortOrder);
});

qualityArrow.addEventListener('click', () => {
    qualitySortOrder = qualitySortOrder === 'asc' ? 'desc' : 'asc';
    qualityArrow.textContent = qualitySortOrder === 'asc' ? '⬆' : '⬇';
    sortTableByCriteria('quality', qualitySortOrder);
});
