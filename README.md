# InkWise - Creative Writing Assistant

InkWise is an AI-powered creative writing assistant with a manga-inspired interface that helps writers overcome writer's block and craft amazing stories.

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
- [Node.js](https://nodejs.org/) (for local development)
- API key for AI service (Google AI/OpenAI)

### Installation

1. **Download or Clone the Project**
   ```bash
   git clone <repository-url>
   cd inkwise
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in the project root:
   ```
   API_KEY=your_api_key_here
   ```

3. **Start Local Server**
   ```bash
   # Using Node.js http-server
   npx http-server
   
   # Or using Python
   python -m http.server 8000
   ```

4. **Open in Browser**
   - Landing page: `http://localhost:8080/landing.html`
   - Main app: `http://localhost:8080/index.html`

## 📁 Project Structure

```
inkwise/
├── index.html          # Main writing assistant interface
├── landing.html        # Home/landing page
├── .env               # Environment variables (API keys)
├── .env-config.js     # Frontend environment configuration
├── script.js          # Main application logic
├── styles.css         # Additional custom styles
└── README.md          # This file
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
1. Get an API key from your preferred AI service
2. Add it to your `.env` file
3. Ensure `.env-config.js` loads the key properly

### Customization
- **Fonts**: Modify Google Fonts imports in HTML head
- **Colors**: Adjust Tailwind CSS configuration
- **Images**: Replace placeholder images with your own
- **Content**: Update text and examples to match your brand

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS, Custom CSS
- **Fonts**: Google Fonts (Bangers, Comic Neue, Pacifico)
- **Icons**: Remix Icon library
- **API**: RESTful API calls to AI services

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🐛 Troubleshooting

### Common Issues

**API Key Not Found**
- Ensure `.env` file exists and contains valid `API_KEY`
- Check console for loading errors
- Verify `.env-config.js` is loaded before main scripts

**MIME Type Errors**
- Always use a local server (never open files directly)
- Check file extensions and server configuration

**Navigation Issues**
- Verify file paths in onclick handlers
- Ensure all HTML files are in the same directory

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
