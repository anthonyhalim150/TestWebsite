const API_URL = 'https://anthonyhalim-150-723848267249.us-central1.run.app';
let selectedRating = 0;
async function submitComment(event) {
    event.preventDefault(); // Prevent form reload
    const userID = localStorage.getItem('userID');
    if (!userID){//Jangan sampe masuk sini, error handling is present when the user presses the feedback button.
        alert('You must be logged in to give a comment! Alert Developer of this error!');
        window.location.href = 'login.html'
        return;
    }
    if(selectedRating === 0){
        alert('Please add a rating for the website!');
        return;
    }
    // Get form data
    const comment_text = document.getElementById('comment-text').value.trim();

    // Validate form input, jgn sampe sini karena ada form control required
    if (!comment_text) {
        alert('Comment cannot be empty.');
        return;
    }

    // Construct the comment object
    const newComment = {userID, comment_text, selectedRating};

    try {
        const response = await fetch(`${API_URL}/add-new-comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newComment),
        });

        const result = await response.json();
        if (result.success) {
            alert('Comment submitted successfully!');
            document.getElementById('comment-form').reset(); // Clear the form
            updateStars(0);
            selectedRating = 0;
        } else {
            alert('Failed to submit comment. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('An error occurred. Please try again later.');
    }
}

function updateStars(rating, stars) {
    stars.forEach(star => {
        const starValue = parseFloat(star.dataset.value);
        if (starValue <= rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}



document.addEventListener('DOMContentLoaded', () => {
    const userID = localStorage.getItem('userID');
    if (!userID){
        alert('You must be logged in to give a comment!');
        window.location.href = 'login.html'
        return;
    }
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', submitComment);
    }
    const stars = document.querySelectorAll('#star-rating span');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseFloat(star.dataset.value);
                updateStars(selectedRating, stars);
            });
        });
});
