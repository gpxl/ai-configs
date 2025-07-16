# Claude Code Rules and Index Generator

This directory contains rules files and tools optimized for Claude Code, migrated and adapted from the original Cursor rules.

## Files Overview

### Core Rules
- **`CLAUDE.md`** - Main configuration file for Claude Code containing all essential development rules, patterns, and guidelines
- **`create-prd.md`** - Guide for generating Product Requirements Documents
- **`generate-tasks.md`** - Guide for creating task lists from PRDs
- **`process-task-list.md`** - Guide for systematically executing task lists

### Tools
- **`code_index_generator.js`** - Optimized codebase index generator that fits within Claude's 40k token limit

## Quick Start

### 1. Setup Claude Code Rules
Copy `CLAUDE.md` to your project root and Claude Code will automatically use it:

```bash
cp ClaudeCode/CLAUDE.md /path/to/your/project/CLAUDE.md
```

### 2. Generate Codebase Index
Run the optimized index generator to create a compact codebase summary:

```bash
# Install dependencies first
npm install @babel/parser @babel/traverse

# Generate index
node ClaudeCode/code_index_generator.js /path/to/your/project
```

This creates:
- `code-index.json` - Structured data for Claude Code
- `code-index.md` - Human-readable project overview

### 3. Use Reference Guides
Reference the specialized guides when needed:
- Use `@create-prd.md` when creating PRDs
- Use `@generate-tasks.md` when generating task lists
- Use `@process-task-list.md` when executing tasks

## Usage Examples

### Creating a New Feature
1. Ask Claude Code to create a PRD: "Create a PRD for user authentication. Use @create-prd.md for guidance."
3. Generate tasks: "Create task list from the PRD using @generate-tasks.md"
4. Execute: "Process the task list with @process-task-list.md"

### Understanding Codebase
1. Generate index: `node ClaudeCode/code_index_generator.js`
2. Reference in prompts: "Check @code-index.json for project structure"
3. Ask specific questions: "Based on the code index, where should I add authentication?"

## Maintenance

### Updating Rules
Edit `CLAUDE.md` to modify core development rules and guidelines.

### Regenerating Index
Run the generator after significant codebase changes:

```bash
node ClaudeCode/code_index_generator.js
```