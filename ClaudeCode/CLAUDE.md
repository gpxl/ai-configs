# Next.js Development Rules for Claude Code

## Project Overview

This is a Next.js application using modern development practices with a focus on TypeScript, testing, and maintainable code architecture.

### Technology Stack
- **Framework**: Next.js with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Shadcn UI
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query (react-query)
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context
- **Backend**: Supabase (database + auth)
- **Authentication**: Supabase magic link
- **Testing**: Jest + React Testing Library
- **Package Manager**: pnpm

## Core Development Rules

### Code Style & Architecture
- Follow Airbnb Style Guide for consistent formatting
- Use PascalCase for React component files (e.g., `UserCard.tsx`)
- Prefer named exports for components
- Use functional and declarative programming patterns; avoid classes
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Avoid `any` types and enums; use explicit types and maps instead
- Enable TypeScript strict mode for better type safety

### File Structure & Naming
- Use lowercase with dashes for directories (e.g., `components/auth-wizard`)
- Place test files alongside code: `Component.test.tsx` next to `Component.tsx`
- Do NOT modify Shadcn UI components in `src/components/ui/`
- Use the `function` keyword for pure functions
- Follow Next.js App Router patterns for routing

### Testing-First Development (TDD)
- **ALWAYS** create tests BEFORE implementing new features
- Write failing tests first, then implement code to make them pass
- Every new component MUST have corresponding unit tests
- Test component rendering, props, user interactions, and accessibility
- Run tests after changes to ensure no regressions
- Fix failing tests before proceeding with new features

### Accessibility & Responsiveness
- Ensure high accessibility (a11y) standards using ARIA roles
- Implement responsive design with Flexbox
- Test keyboard navigation and screen reader compatibility
- Use semantic HTML elements appropriately

## Codebase Awareness Integration

### Index System
This project uses a hierarchical codebase index for better code understanding:
- `code-index.md` - Human-readable project overview
- `code-index.json` - Structured data for programmatic access

### Code Generation Protocol
Before writing any code:

1. **Check the code index** for existing similar functionality
2. **Reuse over recreation**: Import and use existing functions when possible
3. **Extend existing patterns** rather than creating new ones
4. **Follow established conventions** found in the codebase

### Decision Framework
- **REUSE**: Import existing functions (preferred)
- **EXTEND**: Build upon existing patterns  
- **CREATE**: Only when reuse/extension isn't viable

Always explain your choice: "I'm [reusing/extending/creating] because [specific reason]"

### Duplication Prevention
- Search existing codebase before creating new functionality
- If >80% similar: Use existing implementation
- If 60-80% similar: Ask whether to extend existing or create new
- If 40-60% similar: Reference existing patterns for consistency

## Development Workflow

### Feature Implementation Process
1. **Planning**: Describe approach and steps before implementation
2. **Approval**: Wait for approval before proceeding
3. **Branch**: Create feature branch for implementation
4. **TDD**: Write tests first, then implement feature
5. **Testing**: Ensure all tests pass before proceeding
6. **Manual Testing**: Restart services and test in browser
7. **Documentation**: Update relevant documentation
8. **Commit**: Commit completed feature to repository

### Task Management
- Work on one sub-task at a time
- Mark tasks as completed when finished: `[ ]` → `[x]`
- Ask for permission before starting next sub-task
- Update task lists and documentation regularly
- Run `node code_index_generator.js` after major changes

### Quality Assurance
Always include in responses:
1. Code organization improvement suggestion
2. Future code reuse opportunity
3. Potential architectural improvement  
4. Security and performance considerations
5. Accessibility notes (for UI components)

## PRD and Task List Guidelines

### PRD Generation
When creating Product Requirements Documents:
- Ask clarifying questions before writing PRD
- Wait for user responses before generating PRD
- Use required structure and save as `prd-[feature-name].md` in `/tasks/`
- Focus on "what" and "why", not "how"

### Task List Creation
When generating task lists from PRDs:
- Generate high-level parent tasks first
- Wait for "Go" confirmation before creating sub-tasks
- Save as `tasks-[prd-file-name].md` in `/tasks/`
- Include relevant files section with descriptions

## Error Handling & Context Management

### When Context is Limited
1. Generate code with explicit assumptions stated
2. Include TODO comments for project-specific details
3. Provide multiple implementation options
4. Ask specific questions to resolve ambiguities

### Index Update Protocol
- Regenerate index after significant codebase changes
- Use `node code_index_generator.js` to update
- Reference index for architectural consistency
- Query index systematically rather than assuming patterns

## Security & Performance

### Security Best Practices
- Never expose or log secrets and keys
- Never commit secrets to repository
- Use proper input validation with Zod
- Implement proper authentication checks

### Performance Considerations
- Use React.memo() for expensive components
- Implement proper loading states
- Optimize images and assets
- Use dynamic imports for code splitting

## Communication Style

### Transparent Decision Making
Always explain:
- "I chose to extend [existing component] because [reason]"
- "I created new utility because [reason]"
- "I placed this in [location] following your [pattern] convention"
- "I imported [utility] instead of recreating this logic"

### Response Format
- Be explicit about reasoning and choices
- Reference existing code when building upon it
- Suggest improvements and optimizations
- Document any assumptions or limitations