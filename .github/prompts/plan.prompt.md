We're going to think, plan, design, and only then implement a new feature.
Help me figure out the feature specs by answering the following questions:

## Feature name and goal

Goal: Short one-line description of the feature and its user value.

## Capabilities

- Scope: what this feature will and will not cover.
- Acceptance criteria: measurable outcomes.

## Components
- 
- Frontend: UI modules, pages, libraries.
- Backend: services, endpoints, database tables.
- Shared: Zod schemas, shared types (`@shared/*`).

## Interactions

- Data flow: sequence of requests/responses.
- Integration points: which APIs, events, or third-party services.

## Contracts

- Types/DTOs: example fields and types (ISO dates for APIs).
- Validation: reference Zod schemas path.
- Error messages: exact text and context requirements.

Present each level separately.
Wait for my approval before moving to the next.
No code until the Contracts are agreed.

## Just for reference

This is a framework suggested by [Rahul Garg](https://martinfowler.com/articles/reduce-friction-ai/design-first-collaboration.html),
a Martin Fowler's collaborator.
