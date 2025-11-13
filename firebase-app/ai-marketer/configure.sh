#!/bin/bash

echo "🔥 AI Marketing Assistant - Firebase Configuration"
echo "================================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local with Firebase config template
cat > .env.local << 'EOF'
# Firebase Configuration for AI Marketing Assistant
# Replace these values with your actual Firebase project config

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=marketer-415a4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=marketer-415a4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=marketer-415a4.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=362216429181
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
EOF

echo "✅ Created .env.local template"
echo ""
echo "🔧 Next Steps:"
echo ""
echo "1. 📱 Enable Firebase Services:"
echo "   Go to: https://console.firebase.google.com/project/marketer-415a4"
echo ""
echo "   Enable these services:"
echo "   • Authentication → Sign-in method → Email/Password → Enable"
echo "   • Firestore Database → Create database → Start in test mode"
echo "   • Functions → Get started (if not already enabled)"
echo "   • Hosting → Get started (if not already enabled)"
echo ""
echo "2. 🔑 Get Web App Config:"
echo "   • Project Settings (gear icon) → General tab"
echo "   • Scroll to 'Your apps' section"
echo "   • If no web app: Click 'Add app' → Web (</>) → Register app"
echo "   • Copy the config object values"
echo ""
echo "3. ✏️  Update .env.local:"
echo "   • Replace 'your_api_key_here' with your actual API key"
echo "   • Replace 'your_app_id_here' with your actual App ID"
echo "   • Other values should be correct for your project"
echo ""
echo "4. 🚀 Deploy Functions:"
echo "   npm run firebase:deploy:functions"
echo ""
echo "5. 🧪 Test Locally:"
echo "   npm run firebase:emulators  # Terminal 1"
echo "   npm run dev                 # Terminal 2"
echo ""
echo "6. 🌍 Deploy to Production:"
echo "   npm run firebase:deploy"
echo ""
echo "📝 Your .env.local file is ready to edit!"
echo "   Open it and replace the placeholder values with your Firebase config."
EOF
