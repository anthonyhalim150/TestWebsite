import mysql.connector
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from transformers import pipeline
import nltk
import re
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
from flask import Flask, jsonify, request, render_template

# Download NLTK tokenizer
nltk.download('punkt')

# Flask app for web integration
app = Flask(__name__)

# Step 1: Connect to MySQL and Fetch Comments
def fetch_comments_from_db():
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

# Step 2: Preprocess Comments
def clean_comment(comment):
    comment = re.sub(r'<.*?>', '', comment)  # Remove HTML tags
    comment = re.sub(r'[^\w\s]', '', comment)  # Remove punctuation
    comment = comment.lower()  # Convert to lowercase
    return comment

def preprocess_comments(comments):
    comments = [clean_comment(comment) for comment in comments]
    comments = list(set(filter(None, comments)))  # Remove duplicates and empty strings
    return comments

# Step 3: Cluster Comments
def determine_optimal_clusters(embeddings, max_k=10):
    from sklearn.metrics import silhouette_score
    scores = []
    for k in range(2, max_k + 1):
        kmeans = KMeans(n_clusters=k, random_state=42)
        kmeans.fit(embeddings)
        scores.append(silhouette_score(embeddings, kmeans.labels_))
    return scores.index(max(scores)) + 2  # Best k corresponds to the max score

def cluster_comments(embeddings, num_clusters):
    kmeans = KMeans(n_clusters=num_clusters, random_state=42)
    kmeans.fit(embeddings)
    return kmeans.labels_

def group_comments_by_cluster(labels, comments):
    clusters = {i: [] for i in range(max(labels) + 1)}
    for label, comment in zip(labels, comments):
        clusters[label].append(comment)
    return clusters

# Step 4: Summarize Each Cluster
def summarize_cluster(comments):
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    summaries = []
    for i in range(0, len(comments), 5):  # Summarize in chunks of 5 comments
        chunk = " ".join(comments[i:i + 5])
        chunk = chunk[:1024]  # Handle token limit
        summary = summarizer(chunk, max_length=50, min_length=10, do_sample=False)
        summaries.append(summary[0]['summary_text'])
    return " ".join(summaries)

def generate_cluster_summaries(clusters):
    return {cluster_id: summarize_cluster(cluster_comments) for cluster_id, cluster_comments in clusters.items()}

# Step 5: Generate Suggestions
def generate_suggestion(summary):
    sentiment_analyzer = pipeline("sentiment-analysis")
    sentiment = sentiment_analyzer(summary)[0]
    if sentiment['label'] == 'NEGATIVE':
        return f"Consider addressing this feedback: {summary}"
    elif sentiment['label'] == 'POSITIVE':
        return f"Build on this strength: {summary}"
    else:
        return f"Neutral feedback: {summary}"

def generate_suggestions(cluster_summaries):
    return {cluster_id: generate_suggestion(summary) for cluster_id, summary in cluster_summaries.items()}

# Step 6: Visualization
def plot_clusters(embeddings, labels):
    pca = PCA(n_components=2)
    reduced_data = pca.fit_transform(embeddings)
    plt.scatter(reduced_data[:, 0], reduced_data[:, 1], c=labels, cmap='viridis')
    plt.colorbar()
    plt.title("Feedback Clusters")
    plt.savefig("static/clusters.png")
    plt.close()

# Integration with Flask
@app.route('/')
def home():
    return render_template("index.html")

@app.route('/analyze', methods=['GET'])
def analyze_feedback():
    comments = fetch_comments_from_db()
    comments = preprocess_comments(comments)

    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = embedding_model.encode(comments)

    num_clusters = determine_optimal_clusters(embeddings)
    labels = cluster_comments(embeddings, num_clusters)
    clusters = group_comments_by_cluster(labels, comments)

    cluster_summaries = generate_cluster_summaries(clusters)
    suggestions = generate_suggestions(cluster_summaries)

    plot_clusters(embeddings, labels)

    return jsonify({
        "clusters": clusters,
        "summaries": cluster_summaries,
        "suggestions": suggestions,
        "visualization": "/static/clusters.png"
    })

if __name__ == '__main__':
    app.run(debug=True)
