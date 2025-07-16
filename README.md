# Built To Chill

This repo currently contains the Cursor rules files I use to vibe code SetDigger.com. These files are a work in progress, have not been optimized, and are pretty messy, but they've significantly improved outcomes for me and I hope they help you!

## How to use

Copy all files in the Cursor directory into your project then run `node nextjs_index_generator.js` to build your codebase index files. Cursor should immediately start using the rules files to steer development.

# Rules Overview

- *general_rules.mdc* is always used by Cursor and provides the general ruleset to steer cursor development.

- *codebase_awareness.mdc* is always used and makes Cursor aware of the codebase index.

- *create-prd.mdc, generate-tasks.mdc, process-task-list.mdc* are all derived from Ryan Carson's [AI Dev Tasks](https://github.com/snarktank/ai-dev-tasks). Check that repo for more info but these files are used to generate PRDs and Task lists that contain enough context and structure to improve code generation, and to inform the agent how you would like it to proceed with implementing your task list.

## Suggested development workflow.

- For smaller tasks simply prompt the agent with a request The general_rules and codebase index may be sufficient to steer the agent to satisfactory results.

- For larger tasks, prompt the agent to `create a PRD and tasklist for [your feature request]`. The agent should ask clarifying questions, then sequentially generate a PRD and task list. Once both are to your satisfaction, prompt the agent to `process [task list] with @process-task-list.mdc`

## Suggestions for improving your workflow.

- ### Git commit frequently!

- If the agent is not producing the outcomes you desire, consider updating the rules files instead of hands on coding or further prompting. This way you commit the behavior change for the long term.

- Use the agent for as much as possible! Think of the agent as your main interface and your programming language is English. Need to Git commit? Prompt the agent to do it! Want to know why the agent did something you didn't want? Ask it! Need to update Cursor rules? Have the agent to do it! 

- These rules ask the agent to frequently stop for approval before proceeding. Once you have a good cadence going, you may want to remove these approval checks.


