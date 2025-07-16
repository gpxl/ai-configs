# Cursor IDE Rules and Index Generator

This directory contains the original Cursor IDE rules files and tools for AI-assisted development. These rules provide comprehensive guidance for building Next.js applications with modern development practices.

## Files Overview

### Core Rules Files
- **`general_rules.mdc`** - Main development rules and coding standards
- **`codebase_awareness.mdc`** - Hierarchical codebase understanding and integration rules
- **`create-prd.mdc`** - Guide for generating Product Requirements Documents
- **`generate-tasks.mdc`** - Guide for creating task lists from PRDs
- **`process-task-list.mdc`** - Guide for systematically executing task lists

> *create-prd.mdc, generate-tasks.mdc, process-task-list.mdc* are all derived from Ryan Carson's [AI Dev Tasks](https://github.com/snarktank/ai-dev-tasks).

### Tools
- **`nextjs_index_generator.js`** - Comprehensive codebase index generator for Cursor IDE

## Quick Start

### 1. Setup Cursor Rules
Copy all rule files to your project's Cursor configuration:

```bash
# Copy all .mdc files to your project
cp Cursor/.cursor/rules/*.mdc /path/to/your/project/.cursor/rules/
```

### 2. Generate Codebase Index
Run the comprehensive index generator:

```bash
# Install dependencies first
npm install @babel/parser @babel/traverse

# Generate detailed index
node Cursor/nextjs_index_generator.js /path/to/your/project
```

This creates:
- `codebase-index.json` - Comprehensive structured data
- `codebase-index-formatted.md` - Detailed human-readable overview

### 3. Use Specialized Rules
Cursor will automatically apply rules based on context:
- `general_rules.mdc` is always active
- `codebase_awareness.mdc` provides intelligent code generation
- Other rules activate when referenced with `@filename.mdc`

