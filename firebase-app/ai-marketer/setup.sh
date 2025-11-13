#!/bin/bash

# AI Marketing Assistant - Firebase Setup Script
echo "🔥 Setting up AI Marketing Assistant (Firebase Edition)"
echo "=================================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please log in to Firebase..."
    firebase login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd functions && npm install && cd ..

# Check for environment file
if [ ! -f ".env.local" ]; then
    echo "⚠️  Creating .env.local from template..."
    cp env.example .env.local
    echo "📝 Please edit .env.local with your Firebase configuration"
    echo "   You can find these values in Firebase Console → Project Settings → General"
fi

# Initialize Firebase (if not already done)
if [ ! -f "firebase.json" ]; then
    echo "🔥 Initializing Firebase project..."
    firebase init
else
    echo "✅ Firebase project already initialized"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Edit .env.local with your Firebase configuration"
echo "2. Set your OpenAI API key:"
echo "   firebase functions:config:set openai.key=\"your_openai_api_key\""
echo ""
echo "3. Deploy Cloud Functions:"
echo "   npm run firebase:deploy:functions"
echo ""
echo "4. Start development:"
echo "   npm run firebase:emulators  # Terminal 1"
echo "   npm run dev                 # Terminal 2"
echo ""
echo "5. Deploy to production:"
echo "   npm run firebase:deploy"
echo ""
