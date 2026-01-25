# 🔥 AI Marketing Assistant - Firebase Edition

A modern, real-time AI-powered marketing assistant built with Next.js, Firebase, and OpenAI. Features user authentication, real-time chat, and dual marketing contexts (personal branding vs company marketing).

## ✨ Features

- 🔥 **Real-time Chat** - Instant messaging with Firebase Firestore
- 🔐 **User Authentication** - Secure login/signup with Firebase Auth
- 🎯 **Dual Contexts** - Switch between personal branding and company marketing
- ⚡ **Action System** - AI can suggest and execute marketing actions
- 📱 **Responsive Design** - Works on desktop and mobile
- 🚀 **Serverless Backend** - Firebase Cloud Functions for scalability

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase CLI
- OpenAI API key
- Firebase project

### 1. Clone and Install
```bash
git clone <your-repo>
cd ai-marketer
npm install
```

### 2. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Enable Cloud Functions

#### Get Firebase Config
1. Go to Project Settings → General → Your apps
2. Add a web app and copy the config object
3. Create `.env.local` file:

```bash
# Copy from env.example
cp env.example .env.local
```

Fill in your Firebase config in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Deploy Cloud Functions

#### Set OpenAI API Key
```bash
firebase functions:config:set openai.key="your_openai_api_key_here"
```

#### Deploy Functions
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### 4. Deploy Frontend
```bash
npm run build
firebase deploy --only hosting
```

### 5. Run Locally (Development)
```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start

# Terminal 2: Start Next.js dev server  
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
ai-marketer/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   │   ├── AuthWrapper.tsx  # Authentication guard
│   │   ├── ChatInterface.tsx # Main chat UI
│   │   ├── LoginForm.tsx    # Login/signup form
│   │   └── MessageBubble.tsx # Chat message component
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state
│   └── lib/
│       └── firebase.ts      # Firebase configuration
├── functions/               # Cloud Functions
│   └── src/
│       └── index.ts         # Main functions (chatWithAI, executeAction)
├── firebase.json           # Firebase configuration
├── firestore.rules        # Database security rules
└── firestore.indexes.json # Database indexes
```

## 🔧 Configuration

### User Contexts
When users first sign up, they get default contexts that can be customized:

**Personal Branding Context:**
- Name, profession, industry
- Voice, goals, preferences  
- Expertise areas
- Target audience
- Brand values

**Company Marketing Context:**
- Company details
- Products/services
- Target customers
- Business model
- Marketing goals

### Firestore Collections

**users/{userId}**
```javascript
{
  email: "user@example.com",
  displayName: "User Name", 
  contexts: {
    personal: { user: {...}, business: {...} },
    company: { user: {...}, business: {...} }
  },
  createdAt: timestamp
}
```

**conversations/{conversationId}**
```javascript
{
  userId: "user123",
  contextType: "company", // or "personal"
  messages: [
    { role: "user", content: "...", timestamp: ... },
    { role: "assistant", content: "...", timestamp: ... }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🔐 Security

- **Authentication Required** - All data access requires user login
- **User Isolation** - Users can only access their own data
- **Firestore Rules** - Database-level security enforcement
- **API Key Protection** - OpenAI key stored securely in Cloud Functions

## 🚀 Deployment

### Production Deployment
```bash
# Build and deploy everything
npm run build
firebase deploy
```

### Environment-Specific Deployments
```bash
# Deploy to staging
firebase use staging
firebase deploy

# Deploy to production  
firebase use production
firebase deploy
```

## 🛠️ Development

### Local Development with Emulators

**Important:** The emulators support data persistence so you don't lose your data between restarts!

```bash
# Start emulators with persistent data (RECOMMENDED)
./start-emulators.sh

# OR start without persistence (fresh database each time)
firebase emulators:start

# In another terminal, start the Next.js dev server
npm run dev
```

**Data Persistence:**
- Emulator data is saved to `.emulator-data/` directory
- Data persists between emulator restarts
- Auth users, Firestore data, and all emulator state are preserved
- To reset to a fresh state, delete the `.emulator-data/` directory

**Emulator UI:**
- Access at `http://localhost:4000`
- View Auth users, Firestore data, and Functions logs
- Test and debug your app in a safe sandbox environment

### Cloud Functions Development
```bash
cd functions
npm run build:watch  # Auto-rebuild on changes
```

**Note:** After rebuilding functions, you need to restart the emulators to pick up the changes.

### Adding New Actions
1. Add action type to Cloud Functions (`functions/src/index.ts`)
2. Implement action handler
3. Update frontend to handle new action type

## 📊 Monitoring

- **Firebase Console** - Real-time database and auth monitoring
- **Cloud Functions Logs** - `firebase functions:log`
- **Performance** - Firebase Performance Monitoring (optional)

## 🔄 Migration from Streamlit

This Firebase version replaces the original Streamlit app with:

- ✅ **Real-time sync** instead of session state
- ✅ **User accounts** instead of hardcoded contexts  
- ✅ **Cloud Functions** instead of local Python server
- ✅ **Firestore** instead of in-memory storage
- ✅ **Modern React UI** instead of Streamlit components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Firebase emulators
5. Submit a pull request

## 📄 License

[Add your license information here]

---

**Need help?** Check the Firebase documentation or open an issue on GitHub.