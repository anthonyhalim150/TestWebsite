import os
from flask import Flask, jsonify, request, render_template
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from transformers import pipeline
import mysql.connector

# Initialize Flask app
app = Flask(__name__)

# Load models
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Step 1: Connect to MySQL and Fetch Comments
def fetch_comments_from_db():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Vvs319338",
            database="ecommerce"
        )
        cursor = connection.cursor()
        cursor.execute("SELECT comment FROM comments")  # Replace with your table/column names
        comments = [row[0] for row in cursor.fetchall()]
        connection.close()
        return comments
    except Exception as e:
        print(f"Database error: {e}")
        return []

# Step 2: Preprocess Comments and Generate Clusters
def process_comments(num_clusters=5):
    comments = fetch_comments_from_db()
    if not comments:
        return None, None, "No comments available or database connection failed."

    try:
        # Generate embeddings
        embeddings = embedding_model.encode(comments)

        # Cluster comments
        kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init='auto')
        kmeans.fit(embeddings)
        labels = kmeans.labels_

        # Group comments by cluster
        clusters = {i: [] for i in range(num_clusters)}
        for label, comment in zip(labels, comments):
            clusters[label].append(comment)

        # Summarize each cluster
        summaries = {}
        for cluster_id, cluster_comments in clusters.items():
            text = " ".join(cluster_comments)
            text = text[:1024]  # Handle token limit for summarization
            summary = summarizer(text, max_length=50, min_length=10, do_sample=False)
            summaries[cluster_id] = summary[0]['summary_text']

        # Generate suggestions for each cluster
        suggestions = {
            cluster_id: (
                f"Consider addressing this feedback: {summary}" if "issue" in summary.lower() 
                else f"Build on this strength: {summary}"
            )
            for cluster_id, summary in summaries.items()
        }
        return summaries, suggestions, None
    except Exception as e:
        print(f"Processing error: {e}")
        return None, None, "Error during comment processing."

# Route for the web interface
@app.route('/')
def home():
    return render_template('AI_comment.html')

# Route for feedback analysis
@app.route('/analyze', methods=['POST'])
def analyze():
    summaries, suggestions, error = process_comments()
    if error:
        return jsonify({"status": "error", "message": error})
    
    return jsonify({
        "status": "success",
        "summaries": summaries,
        "suggestions": suggestions
    })

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
