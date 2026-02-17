
# InkWise - Creative Writing Assistant

InkWise is an AI-powered creative writing assistant with a manga-inspired interface. It features a modern Flask backend, MongoDB authentication (with secure password hashing), and a stylish, interactive frontend to help writers overcome writer's block and craft amazing stories.

## 🎨 Features

- **AI Writing Assistant**: Get intelligent suggestions for plot development, character creation, and dialogue writing
- **Manga-Style UI**: Unique comic-inspired design with panels, speech bubbles, and visual effects
- **Writer's Block Solutions**: Tools and prompts to help overcome creative obstacles
- **Interactive Chat Interface**: Real-time conversation with your AI writing companion
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Multiple Writing Styles**: Choose from different creative writing approaches


## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- [Python 3.10+](https://www.python.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally or remotely

### Installation

1. **Download or Clone the Project**
   ```bash
   git clone <repository-url>
   cd Ink-wise
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in the project root (see `.env.example`):
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   SECRET_KEY=your_flask_secret_key
   MONGO_URI=your_mongodb_uri
   ```

3. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start MongoDB**
   - Make sure MongoDB is running (default: `mongodb:your_mongodb_uri`).

5. **Run the Flask Server**
   ```bash
   python app.py
   ```

6. **Open in Browser**
   - Go to: `http://localhost:5000` (landing page)
   - After login/signup, you will be redirected to the chatbot interface.

## 📁 Project Structure

```
Ink-wise/
├── app.py                # Flask backend (all routes, API, MongoDB, AI integration)
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (not committed)
├── static/
│   ├── css/styles.css    # Custom styles
│   └── js/script.js      # Main frontend logic
├── templates/
│   ├── landing.html      # Landing page (login/signup modals)
│   └── chatbot.html      # Authenticated chat UI
└── README.md             # This file
```

## 🎯 Usage

### Landing Page
- **Explore Features**: Learn about InkWise capabilities
- **View Examples**: See before/after story improvements
- **Read Reviews**: Check user testimonials
- **Get Started**: Click "BOOM! GET STARTED" to launch the app

### Writing Assistant
- **New Project**: Start a fresh creative writing session
- **Chat Interface**: Interact with AI for writing help
- **Style Selection**: Choose writing tone and approach
- **Back to Home**: Return to landing page anytime

## ⚙️ Configuration


### API Setup
1. Get a Gemini API key from Google AI Studio
2. Add it to your `.env` file as `GEMINI_API_KEY`
3. Set your Flask `SECRET_KEY` and MongoDB URI as needed

### Customization
- **Fonts**: Modify Google Fonts imports in HTML head
- **Colors**: Adjust Tailwind CSS configuration
- **Images**: Replace placeholder images with your own
- **Content**: Update text and examples to match your brand

## 🛠️ Technical Details


### Technologies Used
- **Backend**: Python 3, Flask, MongoDB (PyMongo), Jinja2, Google Gemini AI
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Tailwind CSS, Custom CSS
- **Authentication**: Secure password hashing (Werkzeug), session-based login
- **Fonts**: Google Fonts (Bangers, Comic Neue, Pacifico)
- **Icons**: Remix Icon library

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🐛 Troubleshooting

### Common Issues


**Login/Signup Not Working**
- Make sure MongoDB is running and accessible
- Passwords are securely hashed—do not insert users manually with plain text passwords
- Always use the signup form to create new users

**API Key Not Found**
- Ensure `.env` file exists and contains valid `GEMINI_API_KEY`
- Check console for loading errors

**Server/Port Issues**
- Always use the Flask server (`python app.py`)
- Do not open HTML files directly or use a static server for dynamic features

**Styling Problems**
- Check Tailwind CSS CDN connection
- Verify custom font loading
- Inspect browser developer tools for CSS errors

## 📝 Development

### Adding New Features
1. Create feature branch
2. Test thoroughly in multiple browsers
3. Update documentation
4. Submit pull request

### Code Style
- Use consistent indentation (2 spaces)
- Follow semantic HTML practices
- Use meaningful class names
- Comment complex JavaScript functions

## 🔐 Security Notes

- Never commit API keys to version control
- Add `.env` to `.gitignore`
- Use environment variables in production
- Validate all user inputs
- Implement rate limiting for API calls

## 📄 License

This project is for educational and demonstration purposes. Please replace any public API keys and images with your own for production use.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review browser console for error messages
- Ensure all prerequisites are met

---

**Made with ❤️ for creative writers everywhere!**
