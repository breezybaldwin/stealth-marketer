#!/bin/bash

# Chat Logger - Save Cursor AI conversations locally
# Usage: ./scripts/log-chat.sh "Chat Title" [optional-file-path]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHAT_LOGS_DIR="$PROJECT_ROOT/chat-logs"
INDEX_FILE="$CHAT_LOGS_DIR/index.json"

# Create chat-logs directory if it doesn't exist
mkdir -p "$CHAT_LOGS_DIR"

# Initialize index.json if it doesn't exist
if [ ! -f "$INDEX_FILE" ]; then
    echo '{"chats": []}' > "$INDEX_FILE"
fi

# Get chat title from argument or prompt
if [ -z "$1" ]; then
    echo -e "${YELLOW}Enter chat title:${NC}"
    read -r CHAT_TITLE
else
    CHAT_TITLE="$1"
fi

# Sanitize title for filename (remove special chars, replace spaces with dashes)
SAFE_TITLE=$(echo "$CHAT_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 -]//g' | tr ' ' '-' | cut -c1-50)

# Generate timestamp
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
HUMAN_DATE=$(date "+%B %d, %Y at %I:%M %p")

# Create filename
FILENAME="${TIMESTAMP}_${SAFE_TITLE}.md"
FILEPATH="$CHAT_LOGS_DIR/$FILENAME"

# Get git status for context
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Check for uncommitted changes
UNCOMMITTED_CHANGES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

echo -e "${BLUE}Creating chat log: $FILENAME${NC}"

# Create the markdown file with template
cat > "$FILEPATH" << EOF
# $CHAT_TITLE

**Date:** $HUMAN_DATE  
**Git Branch:** \`$GIT_BRANCH\`  
**Git Commit:** \`$GIT_COMMIT\`  
**Uncommitted Changes:** $UNCOMMITTED_CHANGES file(s)

---

## Context

<!-- Add context about what you're working on -->

---

## Conversation

### User
<!-- Paste your question/request here -->

### AI Assistant
<!-- Paste AI response here -->

---

## Files Modified

<!-- List files that were changed during this conversation -->

\`\`\`
# Run this to see files changed:
git status --short
\`\`\`

---

## Code Changes Summary

<!-- Summarize what was implemented/changed -->

---

## Decisions Made

<!-- Document any important decisions or approaches chosen -->

---

## Follow-up Tasks

<!-- Note any remaining tasks or future work -->

---

## Tags

<!-- Add tags for easy searching: #feature #bugfix #refactor #setup etc -->

EOF

# Update index.json
python3 - << PYTHON_SCRIPT
import json
import sys

index_file = "$INDEX_FILE"
with open(index_file, 'r') as f:
    data = json.load(f)

new_entry = {
    "filename": "$FILENAME",
    "title": "$CHAT_TITLE",
    "timestamp": "$TIMESTAMP",
    "date": "$HUMAN_DATE",
    "git_branch": "$GIT_BRANCH",
    "git_commit": "$GIT_COMMIT"
}

data['chats'].insert(0, new_entry)  # Add to beginning

with open(index_file, 'w') as f:
    json.dump(data, f, indent=2)

print("Index updated")
PYTHON_SCRIPT

echo -e "${GREEN}✅ Chat log created: $FILEPATH${NC}"
echo -e "${BLUE}Opening in default editor...${NC}"

# Open in default editor (or specify your preferred editor)
if [ -n "$2" ]; then
    # If second argument provided, don't open editor
    echo -e "${YELLOW}File created but not opened (scripted mode)${NC}"
else
    # Try to open with common editors
    if command -v code &> /dev/null; then
        code "$FILEPATH"
    elif command -v cursor &> /dev/null; then
        cursor "$FILEPATH"
    elif command -v nano &> /dev/null; then
        nano "$FILEPATH"
    else
        echo -e "${YELLOW}Please open manually: $FILEPATH${NC}"
    fi
fi

echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo "  - Copy/paste your conversation into the file"
echo "  - Document decisions and code changes"
echo "  - Add tags for easy searching later"
echo "  - Search logs: grep -r 'keyword' chat-logs/"
echo ""

