# AI Agent Engineering Constraints

## Core Principles

This project embraces rapid "vibe coding" development with essential engineering guardrails to prevent security issues and maintain code quality.

## Security-First Development

### Secrets & Credentials

**CRITICAL**: `.env` files are gitignored and NOT visible to AI agents. Do not assume secrets are missing just because you cannot see them.

- **Never commit**: API keys, secrets, credentials, or configuration files containing them
- **Always verify**: Check `.gitignore` includes `.env*` files before creating environment files
- **Prohibited files**: `configure.sh`, `update-env.sh`, `*-config.txt`, `*-secrets.*`, `*-keys.*` must be gitignored
- **Credential storage**: Use `.env.local` for local development, Firebase Functions config for production
- **Pre-commit check**: Run `git diff --cached` and scan for leaked secrets before committing

### Environment Files

When working with configuration:
- Assume `.env.local` exists and contains necessary secrets
- Reference `env.example` to understand required variables
- Never create or modify `.env` files with actual values in commits
- Document required environment variables in `env.example` only

## Pre-Completion Checklist

Before marking any task complete, verify ALL:

```bash
cd firebase-app/ai-marketer && npm run build  # Build succeeds
npm run lint                                   # Linting passes
cd functions && npm run build && cd ..         # Functions build (if modified)
npm run dev                                    # App runs (verify at localhost:3000)
git diff --cached | grep -iE "(api.key|secret|password|firebase.*config)"  # No secrets
```

Additional checks:
- Spec updated in `src/specs/` (if applicable)
- No debug code, console.logs, or temporary files
- Use Firebase emulators (`firebase emulators:start`) for function testing
- Verify Firestore rules remain secure (require authentication)
- Update `firestore.indexes.json` for new complex queries

## Code Organization

- **Specs**: All specs go in `src/specs/` with descriptive names
- **Docs**: Non-spec docs go in `docs/` (architecture, guides, decisions)
- **Spec updates**: After completing a spec, update it with completion date, implementation notes, deviations, and known issues
- **Do NOT create**: `IMPLEMENTATION.md`, `NOTES.md`, `TODO.md` in root or random markdown files outside `src/specs/` or `docs/`
- **README updates**: Only for significant feature additions, setup changes, or new dependencies

## Git Workflow

- Create feature branches (`feature/description`, `fix/description`) - never commit directly to main
- Use conventional commits format (feat:, fix:, docs:, etc.)
- Never use `--force` on main/master branches
- Ensure build passes and app runs before proposing merge
- No commented-out code, debug logs, or temporary files in commits

## Dependency Management

This project has two `package.json` files:
1. Root: `firebase-app/ai-marketer/package.json` (Next.js app)
2. Functions: `firebase-app/ai-marketer/functions/package.json` (Cloud Functions)

- Always commit `package-lock.json` changes with dependency updates
- Run `npm audit` after adding dependencies and address high/critical vulnerabilities
- Use specific versions for critical dependencies
- Test both app and functions after dependency changes

## Firebase Deployment

- Functions use Node.js 20 runtime - ensure compatibility
- Test with `--only functions` or `--only hosting` for isolated changes
- Never deploy overly permissive Firestore rules
- Verify environment variables are set in Firebase Functions config
- Optimize Firestore queries and implement caching to minimize costs
- Use Firebase emulators for development to avoid costs

## Error Handling

- Handle API failures, network issues, and auth errors gracefully
- Provide clear, user-friendly error messages in UI
- Use structured logging in Cloud Functions for debugging
- Implement proper loading and error states in components
- Never expose internal errors or stack traces to users

## Golden Rules

1. **Never commit secrets** - they live in `.env` files you cannot see
2. **Always test before completing** - build, lint, and run the app
3. **Update specs after completion** - document what was done in `src/specs/`
4. **Keep git clean** - meaningful commits, no junk files, no debug code
5. **Two package.json files** - remember to handle both app and functions
6. **Branch workflow** - never commit directly to main, always test before merge

