# Product Requirements Document (PRD) Creation Guide

## Overview
This guide helps create detailed Product Requirements Documents for new feature development. PRDs should be clear, actionable, and suitable for junior developers to understand and implement.

## Process

### 1. Receive Initial Request
Start with the user's brief feature description or request.

### 2. Ask Clarifying Questions
**MANDATORY**: Before writing the PRD, ask clarifying questions to gather sufficient detail. Focus on understanding the "what" and "why", not the "how".

#### Essential Question Areas:
- **Problem/Goal**: "What problem does this feature solve for users?"
- **Target User**: "Who is the primary user of this feature?"
- **Core Functionality**: "What key actions should users be able to perform?"
- **User Stories**: "Can you provide user stories? (As a [user], I want to [action] so that [benefit])"
- **Success Criteria**: "How will we know this feature is successfully implemented?"
- **Scope Boundaries**: "What should this feature NOT do (non-goals)?"
- **Data Requirements**: "What data does this feature need to display or manipulate?"
- **Design/UI**: "Are there existing design guidelines or mockups to follow?"
- **Edge Cases**: "What potential edge cases or error conditions should we consider?"

### 3. Generate PRD
Based on the prompt and user answers, create a PRD using the structure below.

### 4. Save PRD
Save as `prd-[feature-name].md` in the `/tasks/` directory.

## PRD Structure Template

```markdown
# PRD: [Feature Name]

## Introduction/Overview
Brief description of the feature and the problem it solves. State the main goal.

## Goals
List specific, measurable objectives for this feature:
1. [Specific goal 1]
2. [Specific goal 2]
3. [Specific goal 3]

## User Stories
Detail user narratives describing feature usage and benefits:
- As a [type of user], I want to [perform action] so that [benefit achieved]
- As a [type of user], I want to [perform action] so that [benefit achieved]

## Functional Requirements
List specific functionalities the feature must have:
1. The system must allow users to [specific action]
2. The system must provide [specific capability]
3. The system must validate [specific validation]
4. The system must display [specific information]

## Non-Goals (Out of Scope)
Clearly state what this feature will NOT include:
- [Excluded functionality 1]
- [Excluded functionality 2]
- [Future consideration, not current scope]

## Design Considerations
- Link to mockups or describe UI/UX requirements
- Mention relevant components or styles
- Specify responsive design requirements
- Note accessibility considerations

## Technical Considerations
- Integration requirements with existing modules
- Dependencies on external services
- Performance requirements
- Security considerations

## Success Metrics
How will success be measured:
- [Quantifiable metric 1] (e.g., "Increase user engagement by 10%")
- [Quantifiable metric 2] (e.g., "Reduce support tickets by 25%")
- [User satisfaction metric]

## Open Questions
List remaining questions or areas needing clarification:
- [Unresolved question 1]
- [Area needing further detail]
```

## Important Guidelines

### Target Audience
Write for **junior developers**. Requirements should be:
- Explicit and unambiguous
- Free of unnecessary jargon
- Detailed enough to understand purpose and core logic

### Quality Checklist
Before finalizing:
- [ ] All clarifying questions have been asked and answered
- [ ] Functional requirements are specific and measurable
- [ ] Non-goals clearly define scope boundaries
- [ ] Success metrics are quantifiable
- [ ] Technical considerations include integration points

### Final Instructions
1. **DO NOT** start implementing the PRD
2. **MUST** ask clarifying questions first
3. **MUST** wait for user answers before generating PRD
4. **MUST** use the specified structure and save location