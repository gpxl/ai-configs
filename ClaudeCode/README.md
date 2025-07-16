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

## Key Optimizations for Claude Code

### CLAUDE.md Format
- **Single file approach**: All core rules consolidated into one file
- **Structured sections**: Clear organization for easy reference
- **Claude-specific guidance**: Optimized for Claude Code's capabilities
- **Reduced verbosity**: Streamlined content without sacrificing clarity

### Compact Index Generator
- **Token limit aware**: Stays within 40k token budget with buffer
- **Priority-based analysis**: Focuses on most important files first
- **Compressed output**: Essential information without redundancy
- **Fast generation**: Optimized for quick regeneration

### Rule Adaptations
- **Removed Cursor-specific frontmatter**: No YAML headers needed
- **Simplified workflow**: Adapted for Claude Code's interaction model
- **Enhanced clarity**: Better explanations and examples
- **Context awareness**: Integrated codebase understanding guidance

## Migration from Cursor

### What Changed
1. **File structure**: Single CLAUDE.md instead of multiple .mdc files
2. **Index generator**: Optimized for token limits and Claude's context
3. **Workflow guidance**: Adapted for Claude Code's capabilities
4. **Rule consolidation**: Combined related rules for efficiency

### What Stayed the Same
1. **Core development principles**: TDD, code quality, architecture patterns
2. **Technology stack preferences**: Next.js, TypeScript, Tailwind CSS, etc.
3. **Workflow concepts**: PRD → Tasks → Implementation
4. **Quality standards**: Testing, accessibility, documentation requirements

### Backwards Compatibility
The original Cursor rules remain in the `Cursor/` directory and continue to work with Cursor IDE. This ClaudeCode version provides an optimized alternative for Claude Code users.

## Usage Examples

### Creating a New Feature
1. Ask Claude Code to create a PRD: "Create a PRD for user authentication"
2. Reference: "Use @create-prd.md for guidance"
3. Generate tasks: "Create task list from the PRD using @generate-tasks.md"
4. Execute: "Process the task list with @process-task-list.md"

### Understanding Codebase
1. Generate index: `node ClaudeCode/code_index_generator.js`
2. Reference in prompts: "Check @code-index.md for project structure"
3. Ask specific questions: "Based on the code index, where should I add authentication?"

### Development Workflow
1. Claude Code automatically uses CLAUDE.md rules
2. Follow TDD practices as outlined
3. Regenerate index after major changes
4. Reference specialized guides as needed

## Token Management

The optimized index generator includes several strategies to stay within token limits:

- **Selective analysis**: Only analyzes most critical files
- **Compressed output**: Removes redundant information
- **Priority ordering**: Most important information first
- **Size monitoring**: Tracks token usage during generation
- **Early termination**: Stops before hitting limits

## Maintenance

### Updating Rules
Edit `CLAUDE.md` to modify core development rules and guidelines.

### Regenerating Index
Run the generator after significant codebase changes:

```bash
node ClaudeCode/code_index_generator.js
```

### Adding Custom Guides
Create additional `.md` files in this directory for project-specific guidance.

## Benefits Over Original

1. **Better Claude Code integration**: Purpose-built for Claude Code
2. **Improved performance**: Faster generation and smaller output
3. **Enhanced clarity**: Better organization and explanations
4. **Token efficiency**: Optimized for Claude's context limits
5. **Maintainability**: Easier to update and extend

## Support

For issues or questions:
1. Check the generated `code-index.md` for project-specific context
2. Reference the rule guides for workflow questions
3. Regenerate the index if codebase has changed significantly
4. Ensure Babel dependencies are installed for the generator