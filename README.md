# InkWise - Creative Writing Assistant

InkWise is a Flask and MongoDB web app for AI-assisted creative writing. It includes a landing page with login/signup modals and an authenticated chatbot where writers can choose a writing mode such as article, story, poem, screenplay, or manga-style comic.

## Features

- Session-based login, signup, and logout
- Protected chatbot route that asks visitors to login or register first
- Chat history stored per user in MongoDB
- Gemini-powered writing responses when `GEMINI_API_KEY` is configured
- Writing mode selector for poems, articles, stories, manga-style comics, scripts, letters, and more
- Responsive manga-inspired interface

## Project Structure

```text
Ink-wise/
  app.py                  Flask routes, auth, chat APIs, and Gemini integration
  requirements.txt        Python dependencies
  .env.example            Example environment variables
  static/
    css/styles.css        Shared styling
    js/script.js          Chatbot frontend logic
  templates/
    landing.html          Landing page and auth modals
    chatbot.html          Authenticated chatbot UI
```

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Create a local `.env` file from `.env.example`:

```env
SECRET_KEY=change-this-secret-key
MONGO_URI=mongodb://localhost:27017/inkwise
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

3. Start MongoDB.

4. Run the app:

```bash
python app.py
```

5. Open `http://localhost:5000`.

Unauthenticated users who try to open `/chatbot` are sent to the landing page with the login modal open. After login or signup, they are redirected back to the chatbot.

## Notes

- Keep `.env` private. It is ignored by Git and should not be committed.
- If Gemini is not configured, the app still runs, but AI responses show a setup message.
- Use the signup form to create users so passwords are hashed correctly.
