# AGENTS.md - Agent Instructions for Spec-Driven Development

## Purpose
This project uses strict Spec-Driven Development (SDD). No AI agent may write code until specifications are complete.

## Rules All Agents Must Follow
1. Never generate code without a referenced Task ID from speckit.tasks
2. Never modify architecture without updating speckit.plan
3. Every code file must have comments linking to Task ID and Spec
4. Always read speckit.constitution before suggesting anything
5. If spec is missing or unclear, request clarification — do not assume

## Workflow
1. speckit.constitution (Principles)
2. speckit.specify (Requirements)
3. speckit.plan (Architecture)
4. speckit.tasks (Atomic tasks)
5. Implementation (Code only after tasks approved)

## Golden Rule
No task = No code