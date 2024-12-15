const COMMENTS_API_URL = 'http://localhost:3000/add-new-comment';

async function submitComment(event) {
    event.preventDefault(); // Prevent form reload
    const userID = localStorage.getItem('userID');
    if (!userID){
        alert('You must be logged in to give a comment!');
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
    const newComment = {userID, comment_text};

    try {
        const response = await fetch(COMMENTS_API_URL, {
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
        } else {
            alert('Failed to submit comment. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('An error occurred. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', submitComment);
    }
});
