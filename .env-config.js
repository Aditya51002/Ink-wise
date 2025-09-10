// .env-config.js - A simple script to load environment variables from .env file
(function() {
    // Initialize environment object
    window.ENV = {
        API_KEY: 'AIzaSyB7KmYcQukne-YVuuRa03x5k7OLWqhh42Y'
    };
    
    // Check if API_KEY exists in sessionStorage first
    const storedApiKey = sessionStorage.getItem('API_KEY');
    if (storedApiKey) {
        window.ENV.API_KEY = storedApiKey;
        return; // Exit if we already have the key
    }
    
    // Function to load and parse .env file
    async function loadEnvFile() {
        try {
            const response = await fetch('.env');
            if (!response.ok) throw new Error('Failed to load .env file');
            
            const text = await response.text();
            const lines = text.split('\n');
            
            // Parse each line and add to window.ENV
            lines.forEach(line => {
                if (line && !line.startsWith('//')) {
                    const [key, value] = line.split('=');
                    if (key && value) {
                        window.ENV[key.trim()] = value.trim();
                    }
                }
            });
            
            console.log('Environment variables loaded successfully');
            
            // Store API_KEY in sessionStorage for future page loads
            if (window.ENV.API_KEY) {
                sessionStorage.setItem('API_KEY', window.ENV.API_KEY);
            }
        } catch (error) {
            console.error('Error loading .env file:', error);
            // Fallback to sessionStorage
            const storedApiKey = sessionStorage.getItem('API_KEY');
            if (storedApiKey) {
                window.ENV.API_KEY = storedApiKey;
            }
        }
    }
    
    // Load environment variables
    loadEnvFile();
})();