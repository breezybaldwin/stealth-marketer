# Chat Logging System

## Overview

This project includes a **permanent chat logging system** that saves all AI conversations locally. This ensures you never lose important context, decisions, or code changes due to Cursor's chat history bugs.

## Why This Exists

Cursor has a known issue where chat history can be lost due to:
- Cache corruption
- Improper shutdowns
- Memory pressure
- Bugs in the persistence layer

**Solution:** This system saves all conversations to local markdown files that are:
- ✅ Permanent and searchable
- ✅ Gitignored (never committed)
- ✅ Formatted for easy reading
- ✅ Indexed for quick searching

## Quick Start

### 1. Setup (One Time)

```bash
./scripts/setup-chat-logging.sh
```

### 2. Create a Log After Each Conversation

**Option A: Bash Script (Interactive)**
```bash
./scripts/log-chat.sh "Your Chat Title"
```
This will:
- Create a timestamped markdown file
- Open it in your default editor
- Include git context (branch, commit, uncommitted changes)

**Option B: Python Tool (More Features)**
```bash
# Create a new log
python3 scripts/chat-logger.py create "Your Chat Title"

# Create without opening editor
python3 scripts/chat-logger.py create "Your Chat Title" --no-open
```

### 3. Fill in the Log

Copy and paste:
- Your questions/requests
- AI responses
- Code changes
- Decisions made
- Follow-up tasks

## Usage Examples

### Create a Log

```bash
# After discussing a new feature
./scripts/log-chat.sh "Added job history to ProfileSetup"

# After fixing a bug
./scripts/log-chat.sh "Fixed Firebase auth redirect loop"

# After making architectural decisions
./scripts/log-chat.sh "Decided on RAG architecture for knowledge base"
```

### List Recent Logs

```bash
python3 scripts/chat-logger.py list

# Show more logs
python3 scripts/chat-logger.py list --limit 20
```

Output:
```
📝 Recent Chat Logs (showing 3 of 10):

1. Added job history to ProfileSetup
   Date: December 31, 2024 at 02:15 PM
   File: 2024-12-31_14-15-23_added-job-history-to-profilesetup.md
   Branch: feature/profile-enhancements (a1b2c3d)

2. Fixed Firebase auth redirect loop
   Date: December 31, 2024 at 11:30 AM
   File: 2024-12-31_11-30-45_fixed-firebase-auth-redirect-loop.md
   Branch: main (d4e5f6g)
```

### Search Logs

```bash
# Search for a topic
python3 scripts/chat-logger.py search "ProfileSetup"

# Case-sensitive search
python3 scripts/chat-logger.py search "ProfileSetup" --case-sensitive

# Or use grep directly
grep -r "job history" chat-logs/
grep -r -i "firebase" chat-logs/  # case-insensitive
```

## File Structure

```
chat-logs/
├── README.md                           # Documentation
├── index.json                          # Searchable index
├── 2024-12-31_14-15-23_topic.md       # Individual chat logs
└── .aliases                            # Optional shell aliases
```

## Log File Format

Each log is a markdown file with:

```markdown
# Chat Title

**Date:** December 31, 2024 at 02:15 PM
**Git Branch:** `feature/profile-enhancements`
**Git Commit:** `a1b2c3d`
**Uncommitted Changes:** 3 file(s)

---

## Context
What you were working on...

## Conversation
### User
Your question...

### AI Assistant
AI response...

## Files Modified
- src/components/ProfileSetup.tsx
- src/types/index.ts

## Code Changes Summary
Added job history fields with company, title, dates...

## Decisions Made
- Decided to use array of objects for job history
- Chose to make dates optional

## Follow-up Tasks
- [ ] Add validation for date ranges
- [ ] Test with multiple jobs

## Tags
#feature #profile #ui
```

## Shell Aliases (Optional)

For faster access, load the aliases:

```bash
source chat-logs/.aliases
```

Then use:
```bash
log-chat "Your Title"        # Create new log
list-chats                   # List recent logs
chatlog search "keyword"     # Search logs
```

## Best Practices

### When to Log

✅ **Always log:**
- Major feature implementations
- Bug fixes and their root causes
- Architectural decisions
- Complex refactorings
- API integrations
- Security-related changes

✅ **Consider logging:**
- Interesting debugging sessions
- Performance optimizations
- Configuration changes
- Deployment issues

❌ **Don't need to log:**
- Trivial typo fixes
- Simple formatting changes
- Quick questions with short answers

### How to Log Effectively

1. **Create the log immediately** after the conversation
2. **Copy the full conversation** - don't summarize
3. **Add context** - what were you trying to achieve?
4. **List files changed** - helps future searching
5. **Document decisions** - why did you choose this approach?
6. **Add tags** - makes searching easier
7. **Note follow-ups** - what's left to do?

### Organizing Logs

- Use descriptive titles
- Add relevant tags (#feature, #bugfix, #refactor, etc.)
- Reference related logs in the content
- Update logs if you continue the conversation

## Searching Tips

```bash
# Find all logs about a specific feature
grep -r "ProfileSetup" chat-logs/

# Find logs from a specific date
ls chat-logs/2024-12-31*

# Find logs with specific tags
grep -r "#feature" chat-logs/

# Find logs mentioning a file
grep -r "ProfileSetup.tsx" chat-logs/

# Find logs from a specific branch
grep -r "feature/profile" chat-logs/

# Complex search with context
grep -r -A 5 -B 5 "job history" chat-logs/
```

## Maintenance

### Backup Your Logs

While logs are local and gitignored, consider backing them up:

```bash
# Backup to external drive
cp -r chat-logs /Volumes/Backup/stealth-marketer-chats/

# Backup to cloud (if you have a private repo)
# Create a separate private git repo just for logs
cd chat-logs
git init
git remote add origin git@github.com:yourusername/private-chat-logs.git
git add .
git commit -m "Backup chat logs"
git push
```

### Clean Up Old Logs

```bash
# Find logs older than 6 months
find chat-logs -name "*.md" -mtime +180

# Archive old logs
mkdir chat-logs/archive-2024
mv chat-logs/2024-* chat-logs/archive-2024/
```

## Troubleshooting

### Scripts Not Executable

```bash
chmod +x scripts/*.sh scripts/*.py
```

### Python Script Fails

Make sure you have Python 3 installed:
```bash
python3 --version
```

### Logs Not Being Gitignored

Check `.gitignore`:
```bash
grep "chat-logs" .gitignore
```

Should show:
```
chat-logs/
**/chat-logs/
```

### Can't Find Old Logs

Check the index:
```bash
cat chat-logs/index.json | python3 -m json.tool
```

## Integration with Cursor

While Cursor doesn't have built-in hooks for chat logging, you can:

1. **Manual logging**: After each important chat, run the log script
2. **Periodic backups**: Set a reminder to log conversations daily
3. **Git hooks**: Add a pre-commit hook reminder to log recent chats

## Future Enhancements

Potential improvements:
- [ ] Automatic extraction from Cursor's database
- [ ] Web UI for browsing logs
- [ ] Export to PDF/HTML
- [ ] Integration with note-taking apps
- [ ] Automatic tagging using AI
- [ ] Cross-referencing between logs

## Support

If you encounter issues:
1. Check this documentation
2. Look at example logs in `chat-logs/`
3. Run setup script again: `./scripts/setup-chat-logging.sh`
4. Check file permissions: `ls -la scripts/`

---

**Remember:** The best logging system is the one you actually use. Make it a habit to log important conversations right after they happen!

