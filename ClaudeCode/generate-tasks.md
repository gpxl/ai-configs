# Task List Generation Guide

## Overview
This guide helps create detailed, step-by-step task lists from existing Product Requirements Documents (PRDs). Task lists should guide developers through systematic implementation.

## Process

### 1. Receive PRD Reference
User points to a specific PRD file for task list generation.

### 2. Analyze PRD
Read and analyze the functional requirements, user stories, and technical considerations from the specified PRD.

### 3. Phase 1: Generate Parent Tasks
- Create the main, high-level tasks required to implement the feature
- Typically 4-6 parent tasks based on PRD complexity
- Present these to user WITHOUT sub-tasks yet
- Inform user: "I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with 'Go' to proceed."

### 4. Wait for Confirmation
**MANDATORY**: Pause and wait for user to respond with "Go" before proceeding.

### 5. Phase 2: Generate Sub-Tasks
- Break down each parent task into smaller, actionable sub-tasks
- Ensure sub-tasks logically follow from parent task
- Cover implementation details implied by the PRD
- Include testing tasks for each feature component

### 6. Identify Relevant Files
Based on tasks and PRD, identify files that will need creation or modification.

### 7. Save Task List
Save as `tasks-[prd-file-name].md` in `/tasks/` directory.

## Task List Structure Template

```markdown
# Tasks: [Feature Name]

## Relevant Files

- `path/to/component.tsx` - Main component for [feature description]
- `path/to/component.test.tsx` - Unit tests for main component
- `path/to/api-route.ts` - API route handler for [specific functionality]
- `path/to/api-route.test.ts` - Unit tests for API route
- `lib/utils/helpers.ts` - Utility functions for [specific purpose]
- `lib/utils/helpers.test.ts` - Unit tests for utility functions
- `types/[feature].ts` - TypeScript interfaces and types
- `hooks/use[Feature].ts` - Custom React hook for [functionality]
- `hooks/use[Feature].test.ts` - Unit tests for custom hook

### Notes

- Unit tests should be placed alongside the code files they test
- Use `pnpm test` to run all tests or `pnpm test [file-path]` for specific tests
- Follow existing project patterns for file organization
- Include accessibility tests for interactive components

## Tasks

- [ ] 1.0 Setup and Foundation
  - [ ] 1.1 Create TypeScript interfaces and types
  - [ ] 1.2 Set up directory structure following project conventions
  - [ ] 1.3 Create initial component scaffolding with tests

- [ ] 2.0 Core Component Development
  - [ ] 2.1 Implement main component structure with props interface
  - [ ] 2.2 Add component unit tests for rendering and props
  - [ ] 2.3 Implement component functionality according to PRD requirements
  - [ ] 2.4 Add tests for user interactions and edge cases

- [ ] 3.0 Data Layer Implementation
  - [ ] 3.1 Create API route handlers for backend functionality
  - [ ] 3.2 Add API route unit tests
  - [ ] 3.3 Implement data fetching with TanStack Query
  - [ ] 3.4 Add tests for data fetching scenarios

- [ ] 4.0 Integration and Styling
  - [ ] 4.1 Style component with Tailwind CSS following design requirements
  - [ ] 4.2 Implement responsive design for mobile and desktop
  - [ ] 4.3 Add animations with Framer Motion if specified
  - [ ] 4.4 Ensure accessibility compliance (ARIA, keyboard navigation)

- [ ] 5.0 Testing and Documentation
  - [ ] 5.1 Run comprehensive test suite and fix any failures
  - [ ] 5.2 Perform manual testing in development environment
  - [ ] 5.3 Update relevant documentation
  - [ ] 5.4 Update code index with `node code_index_generator.js`
```

## Task Creation Guidelines

### Parent Task Categories
Common parent task types:
- **Setup and Foundation**: Types, interfaces, scaffolding
- **Core Development**: Main functionality implementation
- **Data Layer**: API routes, database operations, data fetching
- **UI/UX**: Styling, responsiveness, animations
- **Integration**: Connecting components, end-to-end functionality
- **Testing and QA**: Comprehensive testing, documentation

### Sub-Task Quality Standards
Each sub-task should be:
- **Actionable**: Clear what needs to be done
- **Specific**: Concrete deliverable or outcome
- **Testable**: Can verify completion
- **Sized appropriately**: 1-4 hours of work max
- **Follow TDD**: Include test creation before implementation

### File Identification Strategy
Consider these file types:
- Main feature components and their tests
- API routes and handlers with tests
- Custom hooks and utilities with tests
- Type definitions and interfaces
- Integration points with existing components
- Documentation updates

## Quality Checklist

Before finalizing task list:
- [ ] Parent tasks cover all PRD functional requirements
- [ ] Sub-tasks are actionable and appropriately sized
- [ ] Testing tasks included for all new code
- [ ] File list includes both implementation and test files
- [ ] Tasks follow project's established patterns
- [ ] Accessibility and responsiveness included where applicable

## Target Audience
Write for **junior developers** who will implement the feature. Tasks should be explicit and include enough context to understand the purpose and approach.