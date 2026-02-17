"""
InkWise — Creative Writing Assistant
Flask backend with MongoDB authentication and Gemini AI integration.
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import datetime
from functools import wraps
import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  APP CONFIG
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'inkwise-dev-secret-change-in-production')

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MONGODB
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/inkwise')
client = MongoClient(MONGO_URI)
db = client['inkwise']
users_col = db['users']
chats_col = db['chats']

users_col.create_index('email', unique=True)
chats_col.create_index('user_id')

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GEMINI AI
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GEMINI_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
    ai_model = genai.GenerativeModel('gemini-1.5-pro-latest')
else:
    ai_model = None
    print('\n  WARNING: GEMINI_API_KEY not found in .env — AI responses disabled.\n')

WRITING_STYLES = {
    'poem':      'a poetic form with rhythmic language and vivid imagery',
    'article':   'a journalistic article with clear paragraphs and an informative tone',
    'academic':  'an academic paper with formal language and structured arguments',
    'story':     'a short story with narrative elements, characters, and plot',
    'comedy':    'a humorous piece with jokes and lighthearted tone',
    'script':    'a screenplay/dialogue format with character names and stage directions',
    'fairytale': 'a whimsical fairytale with magical elements and folkloric style',
    'letter':    'a personal or formal letter with appropriate greetings and closings',
    'sonnet':    'a 14-line poetic form following a specific rhyme scheme',
    'haiku':     'a three-line Japanese poetry format (5-7-5 syllables)',
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AUTH HELPERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def login_required(f):
    """Redirect unauthenticated visitors; return 401 for AJAX calls."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            if request.is_json:
                return jsonify({'error': 'Authentication required'}), 401
            return redirect(url_for('landing'))
        return f(*args, **kwargs)
    return decorated


def current_user():
    uid = session.get('user_id')
    if uid:
        user = users_col.find_one({'_id': ObjectId(uid)})
        if user:
            user['_id'] = str(user['_id'])
            return user
    return None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PAGE ROUTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@app.route('/')
def landing():
    return render_template('landing.html')


@app.route('/chatbot')
@login_required
def chatbot():
    user = current_user()
    return render_template('chatbot.html', user=user)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AUTH API
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')
    confirm  = data.get('confirm_password', '')

    if not all([name, email, password]):
        return jsonify({'error': 'All fields are required.'}), 400
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        return jsonify({'error': 'Please enter a valid email address.'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400
    if password != confirm:
        return jsonify({'error': 'Passwords do not match.'}), 400
    if users_col.find_one({'email': email}):
        return jsonify({'error': 'An account with this email already exists.'}), 409

    doc = {
        'name': name,
        'email': email,
        'password': generate_password_hash(password),
        'created_at': datetime.utcnow(),
    }
    result = users_col.insert_one(doc)

    session['user_id']   = str(result.inserted_id)
    session['user_name'] = name
    return jsonify({'message': 'Account created!', 'redirect': url_for('chatbot')}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = users_col.find_one({'email': email})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    session['user_id']   = str(user['_id'])
    session['user_name'] = user['name']
    return jsonify({'message': 'Welcome back!', 'redirect': url_for('chatbot')}), 200


@app.route('/api/logout')
def logout():
    session.clear()
    return redirect(url_for('landing'))


@app.route('/api/user')
@login_required
def get_user():
    user = current_user()
    if user:
        return jsonify({'name': user['name'], 'email': user['email']})
    return jsonify({'error': 'User not found'}), 404


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CHAT API
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@app.route('/api/chats', methods=['GET'])
@login_required
def list_chats():
    results = list(chats_col.find(
        {'user_id': session['user_id']},
        {'messages': 0}
    ).sort('updated_at', -1))
    for c in results:
        c['_id'] = str(c['_id'])
    return jsonify(results)


@app.route('/api/chats', methods=['POST'])
@login_required
def create_chat():
    now = datetime.utcnow()
    doc = {
        'user_id':    session['user_id'],
        'title':      'New Chat',
        'messages':   [],
        'created_at': now,
        'updated_at': now,
    }
    result = chats_col.insert_one(doc)
    doc['_id'] = str(result.inserted_id)
    doc.pop('messages', None)
    return jsonify(doc), 201


@app.route('/api/chats/<chat_id>', methods=['PUT'])
@login_required
def update_chat(chat_id):
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Title required'}), 400
    chats_col.update_one(
        {'_id': ObjectId(chat_id), 'user_id': session['user_id']},
        {'$set': {'title': title, 'updated_at': datetime.utcnow()}}
    )
    return jsonify({'message': 'Updated'})


@app.route('/api/chats/<chat_id>', methods=['DELETE'])
@login_required
def delete_chat(chat_id):
    chats_col.delete_one({'_id': ObjectId(chat_id), 'user_id': session['user_id']})
    return jsonify({'message': 'Deleted'})


@app.route('/api/chats/<chat_id>/messages', methods=['GET'])
@login_required
def get_messages(chat_id):
    chat = chats_col.find_one(
        {'_id': ObjectId(chat_id), 'user_id': session['user_id']}
    )
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    return jsonify({
        'messages': chat.get('messages', []),
        'title':    chat.get('title', 'New Chat'),
    })


@app.route('/api/chats/<chat_id>/messages', methods=['POST'])
@login_required
def send_message(chat_id):
    data  = request.get_json() or {}
    topic = data.get('message', '').strip()
    style = data.get('style', 'article').strip()

    if not topic:
        return jsonify({'error': 'Message required'}), 400

    chat = chats_col.find_one(
        {'_id': ObjectId(chat_id), 'user_id': session['user_id']}
    )
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404

    user_msg = {
        'role':      'user',
        'content':   topic,
        'timestamp': datetime.utcnow().isoformat(),
    }

    try:
        ai_text = _generate(topic, style)
    except Exception as exc:
        ai_text = f'Sorry, an error occurred: {exc}'

    assistant_msg = {
        'role':      'assistant',
        'content':   ai_text,
        'timestamp': datetime.utcnow().isoformat(),
    }

    update = {
        '$push': {'messages': {'$each': [user_msg, assistant_msg]}},
        '$set':  {'updated_at': datetime.utcnow()},
    }

    new_title = chat.get('title', 'New Chat')
    if not chat.get('messages'):
        words = topic.split()
        new_title = ' '.join(words[:5]) + ('...' if len(words) > 5 else '')
        update['$set']['title'] = new_title

    chats_col.update_one({'_id': ObjectId(chat_id)}, update)

    return jsonify({
        'user_message':      user_msg,
        'assistant_message': assistant_msg,
        'title':             new_title,
    })


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AI GENERATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def _generate(topic: str, style: str) -> str:
    if ai_model is None:
        return ('The AI service is not configured. '
                'Please set GEMINI_API_KEY in your .env file.')

    style_desc = WRITING_STYLES.get(style, 'a creative piece')
    prompt = (
        f"You are InkWise, a creative writing assistant.\n"
        f"Write {style_desc} about: {topic}\n\n"
        f"Guidelines:\n"
        f"1. Follow the conventions of {style_desc}\n"
        f"2. Be creative, vivid, and engaging\n"
        f"3. Appropriate length for the style\n"
        f"4. No meta-commentary — just the writing itself\n"
    )
    response = ai_model.generate_content(prompt)
    return response.text


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  RUN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if __name__ == '__main__':
    print('\n  InkWise server starting...')
    print(f'   MongoDB : mongodb://localhost:27017/inkwise')
    print(f'   Gemini  : {"configured" if ai_model else "NOT configured"}')
    print(f'   URL     : http://localhost:5000\n')
    app.run(debug=True, host='0.0.0.0', port=5000)
