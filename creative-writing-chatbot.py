from flask import Flask, render_template, request, jsonify
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Initialize the model
model = genai.GenerativeModel('gemini-1.5-pro-latest')

app = Flask(__name__)

# Available writing styles
WRITING_STYLES = {
    'poem': 'a poetic form with rhythmic language and vivid imagery',
    'article': 'a journalistic article with clear paragraphs and an informative tone',
    'academic': 'an academic paper with formal language, citations, and structured arguments',
    'story': 'a short story with narrative elements, characters, and plot',
    'comedy': 'a humorous piece with jokes and lighthearted tone',
    'script': 'a screenplay or dialogue format with character names and actions',
    'fairytale': 'a whimsical fairytale with magical elements and folkloric style',
    'letter': 'a personal or formal letter with appropriate greetings and closings',
    'sonnet': 'a 14-line poetic form with a specific rhyme scheme',
    'haiku': 'a three-line Japanese poetry format with 5-7-5 syllable structure'
}

def get_creative_writing(topic, style):
    """
    Get creative writing content using Gemini AI based on topic and style.
    """
    # Return a welcome message for empty inputs
    if not topic.strip() or topic.strip().isdigit():
        styles_list = ', '.join(WRITING_STYLES.keys())
        return f"""✍️ Welcome to your Creative Writing Bot!

I can write about any topic in different styles:
• {styles_list}

Please provide a topic and select a writing style!"""

    # Check if the input is a greeting or non-writing request
    greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']
    irrelevant_topics = ['weather', 'time', 'date', 'tell me about yourself', 'who are you', 'what can you do',
                         'help me with', 'solve', 'calculate', 'explain']
    
    if any(greeting in topic.lower() for greeting in greetings) or any(irr in topic.lower() for irr in irrelevant_topics):
        return """✍️ Hello! I'm a Creative Writing Assistant.

I can write creatively on any topic in various styles. 
Please provide a topic and select a writing style from the dropdown menu.

For example: "Write about autumn leaves" in the style "poem" or "haiku".

I'm designed to focus exclusively on creative writing tasks. What would you like me to write about today?"""

    # Get the style description or default to a general creative piece
    style_description = WRITING_STYLES.get(style.lower(), 'a creative piece')
    
    # Create the prompt for Gemini API
    prompt = f"""
    You are a creative writing assistant. Write {style_description} about the following topic: {topic}.
    
    Guidelines for this {style}:
    1. Stay true to the conventions and format of {style_description}
    2. Be creative, vivid, and engaging
    3. Keep the length appropriate for the style (shorter for poems/haiku, longer for stories/articles)
    4. Focus exclusively on the creative writing task
    5. Do not include any explanations, introductions, or meta-commentary about the writing
    
    Topic: {topic}
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"An error occurred while generating creative content: {str(e)}"

@app.route('/')
def home():
    return render_template('getr.html')

@app.route('/get_creative_writing', methods=['POST'])
def get_creative_writing_route():
    data = request.get_json()
    topic = data.get('topic', '').strip()
    style = data.get('style', 'article').strip()  # Default to article if no style specified

    if not topic:
        return jsonify({'error': 'Please enter a topic'})
    
    if style not in WRITING_STYLES:
        return jsonify({'error': f'Invalid style. Available styles: {", ".join(WRITING_STYLES.keys())}'})

    creative_content = get_creative_writing(topic, style)
    return jsonify({'response': creative_content})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5500)
