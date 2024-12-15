 // Fetch and display feedback analysis
 function fetchFeedback() {
    document.getElementById('loading-feedback').style.display = 'block';

    fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loading-feedback').style.display = 'none';

        if (data.status === "success") {
            let summaries = data.summaries;
            let suggestions = data.suggestions;

            let summaryHtml = '';
            let suggestionHtml = '';

            for (let clusterId in summaries) {
                summaryHtml += `<p><strong>Cluster ${parseInt(clusterId) + 1}:</strong> ${summaries[clusterId]}</p>`;
                suggestionHtml += `<p><strong>Suggestion:</strong> ${suggestions[clusterId]}</p>`;
            }

            document.getElementById('summaries').innerHTML = summaryHtml;
            document.getElementById('suggestions').innerHTML = suggestionHtml;
        } else {
            document.getElementById('error-feedback').style.display = 'block';
            document.getElementById('error-feedback').innerText = data.message;
        }
    })
    .catch(error => {
        document.getElementById('loading-feedback').style.display = 'none';
        document.getElementById('error-feedback').style.display = 'block';
        document.getElementById('error-feedback').innerText = 'An error occurred. Please try again.';
    });
}

// Handle sending chat messages to AI
function sendChat() {
    let userMessage = document.getElementById('user-input').value;
    if (!userMessage.trim()) {
        alert('Please enter a message.');
        return;
    }

    // Display the user message in the chat box
    let chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<div><strong>You:</strong> ${userMessage}</div>`;
    document.getElementById('user-input').value = '';

    document.getElementById('loading-chat').style.display = 'block';

    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loading-chat').style.display = 'none';

        if (data.status === 'success') {
            chatBox.innerHTML += `<div><strong>AI:</strong> ${data.response}</div>`;
        } else {
            chatBox.innerHTML += `<div><strong>AI:</strong> Sorry, I couldn't process that. Please try again.</div>`;
        }

        // Scroll to the bottom of the chat box
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => {
        document.getElementById('loading-chat').style.display = 'none';
        chatBox.innerHTML += `<div><strong>AI:</strong> An error occurred. Please try again.</div>`;
    });
}

// Initialize the page

document.addEventListener('DOMContentLoaded', () => {
    const testing = document.getElementById('send-chat');
if (testing){
    document.getElementById('send-chat').addEventListener('click', sendChat);
}
});


// Fetch feedback on page load
window.onload = function() {
    fetchFeedback();
};