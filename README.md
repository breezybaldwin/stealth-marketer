# 🤖 AI Marketing Assistant

A conversational AI-powered marketing assistant with dual RAG contexts for both company marketing and personal branding strategies.

## ✨ Features

- **🤖 Conversational AI**: Natural chat interface with conversation memory
- **🔄 Dual RAG Contexts**: Switch between company marketing and personal branding
- **🎯 Personalized Responses**: Tailored to your specific business and brand
- **⚡ Action Integration**: Suggests and executes marketing actions (web scraping, social posting)
- **📊 Context Awareness**: Remembers conversation history and adapts responses

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- OpenAI API key
- pip3 (or pip)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd stealth-marketer
   ```

2. **Install dependencies:**
   ```bash
   pip3 install -r requirements.txt
   python3 -m playwright install
   ```

3. **Set up your API key:**
   ```bash
   echo "OPENAI_API_KEY=your_actual_api_key_here" > .env
   ```

4. **Run the app:**
   ```bash
   python3 -m streamlit run app.py
   ```

5. **Open your browser:**
   Navigate to `http://localhost:8501`

## 🎯 Configuration

### Customizing Your Context

The app uses two RAG contexts that you can customize:

#### 🏢 Company Marketing Context (`company_context.py`)
Edit this file to personalize your business marketing context:
```python
USER_CONTEXT = {
    "name": "Your Name",
    "profession": "Your Role", 
    "company": "Your Company",
    "industry": "Your Industry",
    # ... customize your business details
}

BUSINESS_CONTEXT = {
    "products": ["Your Products"],
    "services": ["Your Services"],
    "target_audience": "Your Customers",
    # ... add your business specifics
}
```

#### 👤 Personal Branding Context (`personal_context.py`)
Edit this file for personal brand development:
```python
USER_CONTEXT = {
    "name": "Your Name",
    "profession": "Your Professional Title",
    "voice": "Your authentic voice",
    "goals": "Your personal brand goals",
    # ... customize your personal brand
}

PERSONAL_BRAND_CONTEXT = {
    "content_themes": ["Your expertise areas"],
    "platforms": ["LinkedIn", "Twitter", "etc"],
    "speaking_topics": ["Your speaking topics"],
    # ... add your personal brand details
}
```

## 🔄 Using the App

### Context Switching
- Use the dropdown to switch between "🏢 Company Marketing" and "👤 Personal Branding"
- Each context maintains separate conversation history
- Switch contexts anytime to get different types of advice

### Conversation Flow
- **Natural Chat**: Type messages naturally - no special formatting needed
- **Action Suggestions**: The AI may suggest actions like web scraping or social posting
- **Memory**: The assistant remembers your entire conversation
- **Personalized**: Responses adapt to your specific context and business

### Example Conversations

**Company Marketing Mode:**
- "Help me create a marketing campaign for tech startups"
- "What's the best way to scale our marketing operations?"
- "Analyze our competitor's social media strategy"

**Personal Branding Mode:**
- "Help me build my personal brand on LinkedIn"
- "What content should I create to establish thought leadership?"
- "How can I network with other marketing professionals?"

## 🛠️ Troubleshooting

### Common Issues

**"pip not found" error:**
```bash
# Use pip3 instead
pip3 install -r requirements.txt
```

**"OpenAI API key not found" error:**
```bash
# Create .env file with your API key
echo "OPENAI_API_KEY=your_key_here" > .env
```

**Rate limit errors:**
- Check your OpenAI account billing and usage limits
- The app will show helpful error messages for quota issues

**Playwright browser issues:**
```bash
# Reinstall Playwright browsers
python3 -m playwright install
```

### Performance Tips
- Install watchdog for better file watching: `pip install watchdog`
- Use virtual environments for cleaner dependency management

## 📁 Project Structure

```
stealth-marketer/
├── app.py                 # Main Streamlit application
├── worker.py              # Action execution worker
├── company_context.py     # Company marketing RAG context
├── personal_context.py    # Personal branding RAG context
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create this)
└── README.md             # This file
```

## 🔧 Advanced Usage

### Custom Actions
The app supports custom actions through `worker.py`. Currently supports:
- `scrape_url`: Web scraping with Playwright
- `post_tweet`: Social media posting (requires credentials)

### Environment Variables
Create a `.env` file with:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Docker Support
A `Dockerfile` is included for containerized deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Add your license information here]

---

**Need help?** Check the troubleshooting section or open an issue on GitHub.
