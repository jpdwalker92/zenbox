
from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/emails.json')
def get_emails():
    with open('emails.json', 'r') as f:
        data = json.load(f)
    return jsonify(data)

@app.route('/summaries.json')
def get_summaries():
    with open('summaries.json', 'r') as f:
        data = json.load(f)
    return jsonify(data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
