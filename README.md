# Gerlando's AI Configs

This repo contains my config rules for both Cursor IDE and Claude Code. They are messy and very much a work in progress but they've helped me achieve pretty good results while vibe, prompt, context coding or whatever we're calling it today. 

## Choose Your AI Development Tool

### For Claude Code Users
From the ClaudeCode directory:
1. Copy `CLAUDE.md` and `node code_index_generator.js` to your project root
2. Run `node code_index_generator.js` to build a compact codebase index
3. Reference the specialized guides as needed (`@create-prd.md`, `@generate-tasks.md`, etc.)

See `ClaudeCode/README.md` for detailed usage instructions.

### For Cursor IDE Users
From the Cursor directory:
1. Copy all files in the Cursor directory into your project root
2. Run `node nextjs_index_generator.js` to build your codebase index files
3. Cursor should immediately start using the rules files to steer development

See `Cursor/README.md` for detailed usage instructions.

## Suggested development workflow

- For smaller tasks, simply prompt the agent with a request. The general_rules and codebase index may be sufficient to steer the agent to satisfactory results.

- For larger tasks, prompt the agent to `create a PRD and tasklist for [your feature request]`. The agent should ask clarifying questions, then sequentially generate a PRD and task list. Once both are to your satisfaction, prompt the agent to `process [task list] with @process-task-list.mdc`.

## Suggestions for improving your workflow

- ### Git commit frequently!

- If the agent is not producing the outcomes you desire, consider updating the rules files instead of hands-on coding or further prompting. This way you commit the behavior change for the long term.

- Use the agent for as much as possible! Think of the agent as your main interface and your programming language is English. Need to Git commit? Prompt the agent to do it! Want to know why the agent did something you didn't want? Ask it! Need to update Cursor rules? Have the agent do it!

- These rules ask the agent to frequently stop for approval before proceeding. Once you have a good cadence going, you may want to remove these approval checks.


