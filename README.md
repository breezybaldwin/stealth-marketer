# 🤖 AI Marketing Assistant

A modern, full-stack AI-powered marketing assistant built with Next.js, Firebase, and OpenAI. Features a ChatGPT-style interface with dual RAG contexts for both company marketing and personal branding strategies.

## ✨ Features

- **🤖 ChatGPT-Style Interface**: Modern dark theme with collapsible sidebar and conversation history
- **🔄 Dual RAG Contexts**: Switch between company marketing and personal branding modes
- **👤 Multi-User Support**: Firebase Authentication with personalized user profiles
- **💬 Conversation Management**: Persistent chat history with real-time synchronization
- **🎯 Personalized Responses**: Tailored to your specific business context and brand
- **⚡ Action Integration**: AI suggests and executes marketing actions
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔒 Secure & Scalable**: Built on Firebase with proper authentication and data security

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Firebase Cloud Functions (Node.js 20)
- **Database**: Firestore (NoSQL)
- **Authentication**: Firebase Auth (Email/Password)
- **Hosting**: Firebase Hosting
- **AI**: OpenAI GPT-4 with custom RAG contexts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI
- OpenAI API key (service account recommended)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd stealth-marketer/firebase-app/ai-marketer
   ```

2. **Install dependencies:**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install Cloud Functions dependencies
   cd functions
   npm install
   cd ..
   ```

3. **Set up Firebase:**
   ```bash
   # Login to Firebase
   firebase login
   
   # Initialize Firebase project (if not already done)
   firebase init
   
   # Set your OpenAI API key
   firebase functions:config:set openai.key="your_openai_service_account_key_here"
   ```

4. **Configure environment variables:**
   ```bash
   # Copy environment template
   cp env.example .env.local
   
   # Edit .env.local with your Firebase config
   nano .env.local
   ```

5. **Deploy Firebase Functions:**
   ```bash
   cd functions
   npm run deploy
   cd ..
   ```

6. **Run the development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Firebase Setup

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com)
2. **Enable Authentication** with Email/Password provider
3. **Create Firestore database** in production mode
4. **Upgrade to Blaze plan** for Cloud Functions
5. **Get your Firebase config** from Project Settings

### Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### OpenAI API Key

Set your OpenAI service account key in Firebase Functions:

```bash
firebase functions:config:set openai.key="sk-svcacct-your_service_account_key_here"
```

## 🎯 Usage

### Getting Started

1. **Sign Up**: Create an account with email/password
2. **Profile Setup**: Complete your personal and/or company profiles
3. **Choose Context**: Select between Company Marketing or Personal Branding
4. **Start Chatting**: Ask questions and get personalized marketing advice

### Context Switching

- **🏢 Company Marketing**: Business strategy, campaigns, growth tactics
- **👤 Personal Branding**: Thought leadership, networking, content creation

### Conversation Management

- **New Chat**: Start fresh conversations anytime
- **Chat History**: Access all previous conversations in the sidebar
- **Context Memory**: Each conversation remembers its context and history
- **Delete Chats**: Remove conversations you no longer need

### Profile Management

- **Personal Profile**: Name, profession, industry, expertise, goals
- **Company Profile**: Business details, products, services, target audience
- **Editable**: Update your profiles anytime through Settings

## 📁 Project Structure

```
firebase-app/ai-marketer/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   │   ├── AuthWrapper.tsx  # Authentication wrapper
│   │   ├── ChatInterface.tsx # Main chat interface
│   │   ├── LoginForm.tsx    # Authentication form
│   │   ├── MessageBubble.tsx # Chat message component
│   │   ├── ProfileManager.tsx # Profile editing
│   │   ├── ProfileSetup.tsx  # Initial profile setup
│   │   └── Sidebar.tsx      # Navigation sidebar
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Firebase auth context
│   ├── lib/               # Utilities
│   │   └── firebase.ts    # Firebase configuration
│   ├── types/             # TypeScript definitions
│   │   └── index.ts       # Centralized types
│   └── constants/         # App constants
│       └── index.ts       # Configuration constants
├── functions/             # Firebase Cloud Functions
│   └── src/
│       └── index.ts       # Backend API functions
├── public/               # Static assets
├── firebase.json         # Firebase configuration
├── firestore.rules      # Database security rules
└── package.json         # Dependencies and scripts
```

## 🔒 Security

### Firestore Rules

The app uses secure Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### Authentication

- Email/password authentication via Firebase Auth
- Protected routes and API endpoints
- User session management
- Secure token handling

## 🚀 Deployment

### Firebase Hosting

```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy
```

### Custom Domain

1. Add your domain in Firebase Hosting settings
2. Update DNS records as instructed
3. SSL certificates are automatically managed

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Cloud Functions

```bash
cd functions
npm run build        # Compile TypeScript
npm run serve        # Run functions emulator
npm run deploy       # Deploy functions
npm run logs         # View function logs
```

## 🧪 Testing

### Local Development

```bash
# Start Firebase emulators
firebase emulators:start

# Run development server with emulators
npm run dev
```

### Production Testing

```bash
# Build and test production build
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow the existing code structure
- Add proper error handling
- Update types and constants as needed
- Test thoroughly before submitting

## 🐛 Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Firebase Functions Errors:**
```bash
# Check function logs
firebase functions:log

# Redeploy functions
cd functions && npm run deploy
```

**Authentication Issues:**
- Verify Firebase config in `.env.local`
- Check Firebase Auth settings in console
- Ensure email/password provider is enabled

**Database Permission Errors:**
- Review Firestore rules
- Check user authentication status
- Verify data structure matches rules

### Performance Tips

- Use Firebase emulators for local development
- Optimize Firestore queries with proper indexing
- Implement proper loading states
- Use React.memo for expensive components

## 📊 Analytics & Monitoring

- Firebase Analytics for user engagement
- Cloud Functions monitoring for performance
- Error tracking with Firebase Crashlytics
- Custom metrics for conversation analytics

## 🔄 Updates & Maintenance

### Keeping Dependencies Updated

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update Firebase CLI
npm install -g firebase-tools@latest
```

### Database Maintenance

- Monitor Firestore usage and costs
- Implement data retention policies
- Regular security rule audits
- Performance optimization reviews


---

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

**Built with ❤️ using Next.js, Firebase, and OpenAI**