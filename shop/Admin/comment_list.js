const API_URL = 'http://localhost:3000/comments';
let items = [];

// Add flag button functionality
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
            const analysisResults = await fetchAnalysisResults();
            items.forEach(item => {
                const analysis = analysisResults.find(result => result.comment === item.comment);
                item.predicted_importance = analysis ? analysis.predicted_importance : 0;
                item.predicted_quality = analysis ? analysis.predicted_quality : 0;
            });

            // Render items with flag button
            const productContainer = document.getElementById('product-container-tbody');
            productContainer.innerHTML = items.map(item => {
                return `
                    <tr>
                        <td class="importance-rating">${renderExclamationMarks(item.predicted_importance)}</td>
                        <td>${item.username}</td>
                        <td>${item.comment}</td>
                        <td class="comment-rating">${renderStars(item.predicted_quality)}</td>
                        <td>${new Date(item.created_at).toLocaleString()}</td>
                        <td><button class="flag-btn" data-id="${item.comments_id}">Flag</button></td>
                    </tr>
                `;
            }).join('');

            // Add event listeners for flag buttons
            document.querySelectorAll('.flag-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const commentId = button.getAttribute('data-id');
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

    // Display the comment text (not editable)
    const commentText = document.createElement('p');
    commentText.textContent = comment.comment || 'No comment provided';

    // Render stars for quality and exclamation marks for importance
    const qualityStars = renderStars(comment.predicted_quality || 0);
    const importanceMarks = renderExclamationMarks(comment.predicted_importance || 0);

    // Inject the rendered ratings into the page
    const qualityContainer = document.createElement('div');
    qualityContainer.innerHTML = `
        <label>Website Rating:</label>
        <div>${qualityStars}</div>
        <input type="number" id="website-rating" min="1" max="5" step="0.01" value="${comment.predicted_quality || 0}" required>
    `;

    const importanceContainer = document.createElement('div');
    importanceContainer.innerHTML = `
        <label>Importance Rating:</label>
        <div>${importanceMarks}</div>
        <input type="number" id="importance-rating" min="1" max="5" step="0.01" value="${comment.predicted_importance || 0}" required>
    `;


    const form = document.getElementById('feedback-form');
    form.innerHTML = ''; // Clear previous content
    form.appendChild(commentText);  // Add the comment above ratings
    form.appendChild(qualityContainer);  // Add quality rating
    form.appendChild(importanceContainer); // Add importance rating

    // Add the Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Submit';
    form.appendChild(submitButton);

    // Handle form submission
    form.onsubmit = async function (e) {
        e.preventDefault();
        const importance = parseInt(document.getElementById('importance-rating').value, 10);
        const quality = parseInt(document.getElementById('website-rating').value, 10);

        if (importance === 0 || quality === 0 || !comment.comment) { // Validate inputs
            alert('Contact Developer of this error!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/feedback', {
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
