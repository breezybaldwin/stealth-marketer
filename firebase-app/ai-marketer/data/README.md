# AI CMO Team - Knowledge Base Structure

## Overview

This directory contains the knowledge base for each AI marketing team member (persona). Each persona has their own folder with structured markdown files that define their role, capabilities, and task-specific guidance.

## Purpose

- **Phase 1 (Current)**: Store persona knowledge in markdown files that get appended to system prompts
- **Phase 2 (Future)**: When context windows become too large, migrate to vector store with RAG retrieval

## Directory Structure

```
data/
├── README.md (this file)
├── cmo/
│   ├── persona.md
│   ├── tasks/
│   │   ├── strategic-planning.md
│   │   ├── brand-positioning.md
│   │   └── budget-allocation.md
│   └── examples/
│       └── (optional example files)
├── content-marketer/
│   ├── persona.md
│   ├── tasks/
│   │   ├── blog-writing.md
│   │   ├── social-media-strategy.md
│   │   └── content-calendar.md
│   └── examples/
├── growth-hacker/
│   ├── persona.md
│   ├── tasks/
│   │   ├── ab-testing.md
│   │   ├── viral-loops.md
│   │   └── conversion-optimization.md
│   └── examples/
└── web-developer/
    ├── persona.md
    ├── tasks/
    │   ├── landing-pages.md
    │   ├── tracking-implementation.md
    │   └── technical-seo.md
    └── examples/
```

## File Formats

### `persona.md`

Defines the core identity of each persona:

```markdown
# [Persona Name]

## Role Definition
What this persona is and their primary responsibilities

## What Good Looks Like
- Quality standards
- Success criteria
- Best practices they follow

## Common Tasks
High-level list of tasks this persona handles (detailed in tasks/ folder)

## Communication Style
How this persona communicates and advises

## Expertise Areas
Specific domains of knowledge
```

### Task Files (`tasks/*.md`)

Each task file provides step-by-step guidance:

```markdown
# [Task Name]

## Overview
Brief description of the task

## When to Use This
Scenarios where this task applies

## Step-by-Step Process
1. Step one
2. Step two
3. etc.

## Best Practices
- Key considerations
- Common pitfalls to avoid

## Expected Outcomes
What success looks like

## Related Tasks
Links to related task files
```

## Implementation

### Loading Knowledge

The Firebase Cloud Functions will:
1. Read the appropriate `persona.md` file based on selected agent
2. Optionally load relevant task files based on conversation context
3. Append this content to the system prompt before sending to OpenAI

### File Naming Conventions

- Use kebab-case for all filenames: `strategic-planning.md`
- Keep names descriptive but concise
- Group related tasks with prefixes if needed: `seo-technical.md`, `seo-content.md`

## Adding New Content

### To Add a New Task:

1. Create a new `.md` file in the appropriate `tasks/` folder
2. Follow the task template format above
3. Reference it in the persona's `persona.md` under "Common Tasks"
4. Deploy updated Firebase functions

### To Update a Persona:

1. Edit the `persona.md` file
2. Update any related task files
3. Deploy updated Firebase functions

## Migration to Vector Store (Future)

When knowledge base grows too large:

1. **Chunk documents** into smaller segments
2. **Generate embeddings** for each chunk
3. **Store in vector database** (Pinecone, Weaviate, or Firebase Vector Search)
4. **Implement semantic search** to retrieve relevant chunks based on user query
5. **Update Cloud Functions** to use RAG instead of loading full markdown files

### Triggers for Migration:
- System prompts consistently exceed 50% of context window
- Response latency increases due to large prompts
- Cost optimization needed (smaller prompts = cheaper API calls)

## Maintenance

- Review and update content quarterly
- Keep tasks focused and actionable
- Remove outdated information
- Ensure consistency across personas

## Version Control

All changes to knowledge base should be:
- Committed to git
- Documented in commit messages
- Tested before deployment


