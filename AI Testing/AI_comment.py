import os
from flask import Flask, jsonify, request, render_template
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from transformers import pipeline
from textblob import TextBlob
import mysql.connector
import openai

app = Flask(__name__)

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

openai.api_key = "your_openai_api_key_here"

def fetch_comments_from_db():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Vvs319338",
            database="ecommerce"
        )
        cursor = connection.cursor()
        cursor.execute("SELECT comment, user_id FROM comments")
        comments = [(row[0], row[1]) for row in cursor.fetchall()]
        connection.close()
        return comments
    except Exception as e:
        print(f"Database error: {e}")
        return []

def analyze_sentiment_and_intent(comment):
    analysis = TextBlob(comment)
    sentiment = "Neutral"
    if analysis.sentiment.polarity > 0:
        sentiment = "Positive"
    elif analysis.sentiment.polarity < 0:
        sentiment = "Negative"
    
    if "bug" in comment.lower() or "error" in comment.lower():
        intent = "Bug Report"
    elif "feature" in comment.lower():
        intent = "Feature Request"
    elif "slow" in comment.lower() or "lag" in comment.lower():
        intent = "Performance Issue"
    else:
        intent = "General Feedback"
    
    return sentiment, intent

def generate_developer_suggestions(comment):
    sentiment, intent = analyze_sentiment_and_intent(comment)
    
    if intent == "Bug Report":
        if sentiment == "Negative":
            suggestion = "Investigate the bug and prioritize fixing it. Ensure a patch is available in the next update."
        else:
            suggestion = "Ensure the bug is fixed promptly to maintain user trust and quality. Communicate the fix in release notes."
    
    elif intent == "Feature Request":
        if sentiment == "Positive":
            suggestion = "Evaluate the feasibility of adding this feature in the next release. Conduct a user survey for validation."
        else:
            suggestion = "This feature should be prioritized if it's requested by a significant number of users. Plan accordingly."
    
    elif intent == "Performance Issue":
        suggestion = "Analyze system performance and identify bottlenecks. Optimize code and resources to improve speed."
    
    else:
        suggestion = "Ensure general feedback is logged and reviewed for potential improvements to user experience."
    
    return suggestion

def process_comments_with_feedback(num_clusters=5):
    comments = fetch_comments_from_db()
    if not comments:
        return None, None, "No comments available or database connection failed."

    try:
        embeddings = embedding_model.encode([comment[0] for comment in comments])

        kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init='auto')
        kmeans.fit(embeddings)
        labels = kmeans.labels_

        clusters = {i: [] for i in range(num_clusters)}
        for label, (comment, user_id) in zip(labels, comments):
            clusters[label].append((comment, user_id))

        summaries = {}
        suggestions = {}
        for cluster_id, cluster_comments in clusters.items():
            text = " ".join([comment[0] for comment in cluster_comments])
            text = text[:1024]
            summary = summarizer(text, max_length=50, min_length=10, do_sample=False)
            summaries[cluster_id] = summary[0]['summary_text']

            feedbacks = [generate_developer_suggestions(comment[0]) for comment in cluster_comments]
            suggestions[cluster_id] = " ".join(feedbacks)

        return summaries, suggestions, None
    except Exception as e:
        print(f"Processing error: {e}")
        return None, None, "Error during comment processing."

def generate_response(user_input):
    try:
        response = openai.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are an assistant that provides helpful feedback on comments and conversations."},
                      {"role": "user", "content": user_input}]
        )
        return response['choices'][0]['message']['content']
    except Exception as e:
        print(f"OpenAI error: {e}")
        return "Sorry, I couldn't process that. Please try again."

@app.route('/')
def home():
    return render_template('AI_comment.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    summaries, suggestions, error = process_comments_with_feedback()
    if error:
        return jsonify({"status": "error", "message": error})
    
    return jsonify({
        "status": "success",
        "summaries": summaries,
        "suggestions": suggestions
    })

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '')
    if not user_message:
        return jsonify({"status": "error", "message": "No input provided."})
    
    bot_response = generate_response(user_message)
    return jsonify({"status": "success", "response": bot_response})

if __name__ == '__main__':
    app.run(debug=False)
