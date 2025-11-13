#!/bin/bash

# AI Marketing Assistant - Firebase Deployment Script
echo "🚀 Starting Firebase deployment for AI Marketing Assistant..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the firebase-app/ai-marketer directory"
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI is not installed"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged in to Firebase"
    echo "Please run: firebase login"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Installing Cloud Functions dependencies..."
cd functions
npm install
cd ..

echo "🏗️  Building Next.js application..."
npm run build

echo "☁️  Building Cloud Functions..."
cd functions
npm run build
cd ..

echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app should be available at:"
firebase hosting:channel:list 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1 || echo "Run 'firebase open hosting:site' to see your live URL"
echo ""
echo "📊 To view your Firebase console:"
echo "firebase open"
