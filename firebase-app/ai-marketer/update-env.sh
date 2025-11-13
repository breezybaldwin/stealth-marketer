#!/bin/bash

echo "🔥 Updating .env.local with Firebase configuration..."

# Create .env.local with the correct Firebase config
cat > .env.local << 'EOF'
# Firebase Configuration for AI Marketing Assistant
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCt7-d8HNCGNoGcRz4NLrYyFEAxQFrA8CY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=marketer-415a4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=marketer-415a4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=marketer-415a4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=362216429181
NEXT_PUBLIC_FIREBASE_APP_ID=1:362216429181:web:fe774ced24f57aa9d54314
EOF

echo "✅ .env.local updated successfully!"
echo ""
echo "🚀 Your AI Marketing Assistant is now configured!"
echo ""
echo "Next steps:"
echo "1. Start development server: npm run dev"
echo "2. Or deploy to production: npm run firebase:deploy"
echo ""
