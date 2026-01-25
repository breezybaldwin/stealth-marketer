#!/usr/bin/env python3
"""
Chat Logger - Automated logging and search utility for AI conversations
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
import argparse
import re


class ChatLogger:
    def __init__(self, project_root=None):
        if project_root is None:
            # Get project root (parent of scripts directory)
            self.project_root = Path(__file__).parent.parent
        else:
            self.project_root = Path(project_root)
        
        self.chat_logs_dir = self.project_root / "chat-logs"
        self.index_file = self.chat_logs_dir / "index.json"
        
        # Ensure directory exists
        self.chat_logs_dir.mkdir(exist_ok=True)
        
        # Initialize index if needed
        if not self.index_file.exists():
            self._init_index()
    
    def _init_index(self):
        """Initialize the index.json file"""
        with open(self.index_file, 'w') as f:
            json.dump({"chats": []}, f, indent=2)
    
    def _load_index(self):
        """Load the index.json file"""
        with open(self.index_file, 'r') as f:
            return json.load(f)
    
    def _save_index(self, data):
        """Save the index.json file"""
        with open(self.index_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def _sanitize_filename(self, title):
        """Convert title to safe filename"""
        safe = re.sub(r'[^a-zA-Z0-9\s-]', '', title)
        safe = re.sub(r'\s+', '-', safe)
        return safe.lower()[:50]
    
    def _get_git_info(self):
        """Get current git branch and commit"""
        try:
            import subprocess
            branch = subprocess.check_output(
                ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
                cwd=self.project_root,
                stderr=subprocess.DEVNULL
            ).decode().strip()
            
            commit = subprocess.check_output(
                ['git', 'rev-parse', '--short', 'HEAD'],
                cwd=self.project_root,
                stderr=subprocess.DEVNULL
            ).decode().strip()
            
            status = subprocess.check_output(
                ['git', 'status', '--porcelain'],
                cwd=self.project_root,
                stderr=subprocess.DEVNULL
            ).decode()
            
            uncommitted = len([l for l in status.split('\n') if l.strip()])
            
            return branch, commit, uncommitted
        except:
            return "unknown", "unknown", 0
    
    def create_log(self, title, content=None, auto_open=True):
        """Create a new chat log"""
        timestamp = datetime.now()
        timestamp_str = timestamp.strftime("%Y-%m-%d_%H-%M-%S")
        human_date = timestamp.strftime("%B %d, %Y at %I:%M %p")
        
        safe_title = self._sanitize_filename(title)
        filename = f"{timestamp_str}_{safe_title}.md"
        filepath = self.chat_logs_dir / filename
        
        # Get git info
        branch, commit, uncommitted = self._get_git_info()
        
        # Create markdown content
        md_content = f"""# {title}

**Date:** {human_date}  
**Git Branch:** `{branch}`  
**Git Commit:** `{commit}`  
**Uncommitted Changes:** {uncommitted} file(s)

---

## Context

<!-- Add context about what you're working on -->

---

## Conversation

"""
        
        if content:
            md_content += content + "\n\n"
        else:
            md_content += """### User
<!-- Paste your question/request here -->

### AI Assistant
<!-- Paste AI response here -->

"""
        
        md_content += """---

## Files Modified

<!-- List files that were changed during this conversation -->

```bash
# Run this to see files changed:
git status --short
```

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

"""
        
        # Write the file
        with open(filepath, 'w') as f:
            f.write(md_content)
        
        # Update index
        index_data = self._load_index()
        index_data['chats'].insert(0, {
            "filename": filename,
            "title": title,
            "timestamp": timestamp_str,
            "date": human_date,
            "git_branch": branch,
            "git_commit": commit
        })
        self._save_index(index_data)
        
        print(f"✅ Chat log created: {filepath}")
        
        if auto_open:
            self._open_file(filepath)
        
        return filepath
    
    def _open_file(self, filepath):
        """Open file in default editor"""
        import subprocess
        import platform
        
        system = platform.system()
        try:
            if system == "Darwin":  # macOS
                subprocess.run(['open', filepath])
            elif system == "Linux":
                subprocess.run(['xdg-open', filepath])
            elif system == "Windows":
                os.startfile(filepath)
        except:
            print(f"Please open manually: {filepath}")
    
    def list_logs(self, limit=10):
        """List recent chat logs"""
        index_data = self._load_index()
        chats = index_data.get('chats', [])
        
        if not chats:
            print("No chat logs found.")
            return
        
        print(f"\n📝 Recent Chat Logs (showing {min(limit, len(chats))} of {len(chats)}):\n")
        
        for i, chat in enumerate(chats[:limit], 1):
            print(f"{i}. {chat['title']}")
            print(f"   Date: {chat['date']}")
            print(f"   File: {chat['filename']}")
            print(f"   Branch: {chat['git_branch']} ({chat['git_commit']})")
            print()
    
    def search_logs(self, query, case_sensitive=False):
        """Search through all chat logs"""
        import subprocess
        
        flags = ['-r', '-n', '--color=always']
        if not case_sensitive:
            flags.append('-i')
        
        try:
            result = subprocess.run(
                ['grep'] + flags + [query, str(self.chat_logs_dir)],
                capture_output=True,
                text=True
            )
            
            if result.stdout:
                print(f"\n🔍 Search results for '{query}':\n")
                print(result.stdout)
            else:
                print(f"No results found for '{query}'")
        except FileNotFoundError:
            print("grep command not found. Falling back to Python search...")
            self._python_search(query, case_sensitive)
    
    def _python_search(self, query, case_sensitive=False):
        """Fallback Python-based search"""
        if not case_sensitive:
            query = query.lower()
        
        results = []
        for log_file in self.chat_logs_dir.glob("*.md"):
            if log_file.name == "README.md":
                continue
            
            with open(log_file, 'r') as f:
                for line_num, line in enumerate(f, 1):
                    search_line = line if case_sensitive else line.lower()
                    if query in search_line:
                        results.append((log_file.name, line_num, line.strip()))
        
        if results:
            print(f"\n🔍 Search results for '{query}':\n")
            for filename, line_num, line in results:
                print(f"{filename}:{line_num}: {line}")
        else:
            print(f"No results found for '{query}'")


def main():
    parser = argparse.ArgumentParser(
        description="Chat Logger - Save and search AI conversations"
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Create command
    create_parser = subparsers.add_parser('create', help='Create a new chat log')
    create_parser.add_argument('title', help='Title of the chat')
    create_parser.add_argument('--no-open', action='store_true', help='Do not open the file')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List recent chat logs')
    list_parser.add_argument('--limit', type=int, default=10, help='Number of logs to show')
    
    # Search command
    search_parser = subparsers.add_parser('search', help='Search through chat logs')
    search_parser.add_argument('query', help='Search query')
    search_parser.add_argument('-c', '--case-sensitive', action='store_true', help='Case sensitive search')
    
    args = parser.parse_args()
    
    logger = ChatLogger()
    
    if args.command == 'create':
        logger.create_log(args.title, auto_open=not args.no_open)
    elif args.command == 'list':
        logger.list_logs(args.limit)
    elif args.command == 'search':
        logger.search_logs(args.query, args.case_sensitive)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

