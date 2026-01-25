#!/bin/bash

# Setup Chat Logging System
# Run this once to set up the chat logging infrastructure

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}🚀 Setting up Chat Logging System${NC}\n"

# Create chat-logs directory
echo -e "${YELLOW}Creating chat-logs directory...${NC}"
mkdir -p "$PROJECT_ROOT/chat-logs"

# Initialize index.json
if [ ! -f "$PROJECT_ROOT/chat-logs/index.json" ]; then
    echo '{"chats": []}' > "$PROJECT_ROOT/chat-logs/index.json"
    echo -e "${GREEN}✅ Created index.json${NC}"
else
    echo -e "${GREEN}✅ index.json already exists${NC}"
fi

# Make scripts executable
echo -e "${YELLOW}Making scripts executable...${NC}"
chmod +x "$PROJECT_ROOT/scripts/log-chat.sh"
chmod +x "$PROJECT_ROOT/scripts/chat-logger.py"
echo -e "${GREEN}✅ Scripts are executable${NC}"

# Create aliases helper
cat > "$PROJECT_ROOT/chat-logs/.aliases" << 'EOF'
# Chat Logging Aliases
# Source this file in your shell: source chat-logs/.aliases

# Get the project root
CHAT_PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Quick log creation
alias log-chat="$CHAT_PROJECT_ROOT/scripts/log-chat.sh"
alias chatlog="$CHAT_PROJECT_ROOT/scripts/chat-logger.py"

# Quick search
alias search-chats="grep -r -i --color=always"

# List recent logs
alias list-chats="$CHAT_PROJECT_ROOT/scripts/chat-logger.py list"

echo "Chat logging aliases loaded!"
echo "  log-chat 'title'     - Create new chat log"
echo "  chatlog create 'title' - Create with Python tool"
echo "  list-chats          - List recent logs"
echo "  chatlog search 'term' - Search all logs"
EOF

echo -e "${GREEN}✅ Created shell aliases${NC}"

# Test Python script
echo -e "${YELLOW}Testing Python script...${NC}"
if python3 "$PROJECT_ROOT/scripts/chat-logger.py" list > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Python script works${NC}"
else
    echo -e "${YELLOW}⚠️  Python script test failed (this is OK if no logs exist yet)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Chat logging system is ready!${NC}"
echo ""
echo -e "${BLUE}Usage:${NC}"
echo ""
echo -e "  ${YELLOW}Create a new log:${NC}"
echo "    ./scripts/log-chat.sh 'Your Chat Title'"
echo "    ./scripts/chat-logger.py create 'Your Chat Title'"
echo ""
echo -e "  ${YELLOW}List recent logs:${NC}"
echo "    ./scripts/chat-logger.py list"
echo ""
echo -e "  ${YELLOW}Search logs:${NC}"
echo "    ./scripts/chat-logger.py search 'keyword'"
echo "    grep -r 'keyword' chat-logs/"
echo ""
echo -e "  ${YELLOW}Load shell aliases (optional):${NC}"
echo "    source chat-logs/.aliases"
echo ""
echo -e "${BLUE}💡 Tip:${NC} After each important conversation, run:"
echo "    ./scripts/log-chat.sh 'Conversation Topic'"
echo "    Then copy/paste the conversation into the opened file"
echo ""

