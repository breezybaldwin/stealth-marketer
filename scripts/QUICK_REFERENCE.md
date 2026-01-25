# Chat Logging - Quick Reference

## 🚀 Setup (One Time)

```bash
./scripts/setup-chat-logging.sh
```

## 📝 Create a Log

```bash
# Bash (opens in editor)
./scripts/log-chat.sh "Chat Title"

# Python (more control)
python3 scripts/chat-logger.py create "Chat Title"
python3 scripts/chat-logger.py create "Chat Title" --no-open
```

## 📋 List Logs

```bash
python3 scripts/chat-logger.py list
python3 scripts/chat-logger.py list --limit 20
```

## 🔍 Search Logs

```bash
# Python tool
python3 scripts/chat-logger.py search "keyword"
python3 scripts/chat-logger.py search "keyword" --case-sensitive

# Or use grep
grep -r "keyword" chat-logs/
grep -r -i "ProfileSetup" chat-logs/
```

## 💡 Best Practice

**After EVERY important conversation:**

1. Run: `./scripts/log-chat.sh "Topic"`
2. Copy/paste the conversation
3. Add context and decisions
4. Save and close

## 🎯 Common Searches

```bash
# Find logs about a feature
grep -r "ProfileSetup" chat-logs/

# Find logs from today
ls chat-logs/$(date +%Y-%m-%d)*

# Find logs with tags
grep -r "#feature" chat-logs/
grep -r "#bugfix" chat-logs/

# Find logs mentioning a file
grep -r "index.ts" chat-logs/
```

## 📁 File Locations

- **Logs:** `chat-logs/*.md`
- **Index:** `chat-logs/index.json`
- **Scripts:** `scripts/log-chat.sh`, `scripts/chat-logger.py`
- **Docs:** `CHAT_LOGGING.md`, `chat-logs/README.md`

## ⚠️ Important

- ✅ Logs are **gitignored** - never committed
- ✅ Logs are **local only** - back them up separately
- ✅ May contain **sensitive info** - be careful with sharing

## 🔗 Full Documentation

See `CHAT_LOGGING.md` for complete guide.

