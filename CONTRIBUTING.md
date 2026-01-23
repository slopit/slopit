# Contributing to slopit

Thank you for your interest in contributing to slopit! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js >= 22
- pnpm >= 9
- Python >= 3.13
- uv (Python package manager)

### Getting Started

1. Fork and clone the repository
2. Install dependencies:

```bash
# TypeScript packages
pnpm install

# Python package
cd python && uv sync --extra dev
```

3. Run the test suite to verify your setup:

```bash
pnpm test        # TypeScript
cd python && pytest  # Python
```

## Project Structure

```
slopit/
├── packages/           # TypeScript packages
│   ├── core/          # Core types and schemas
│   ├── behavioral/    # Behavioral capture
│   ├── adapter-*/     # Platform adapters
│   └── dashboard-ui/  # Dashboard components
├── python/            # Python analysis package
├── website/           # Documentation site
└── .github/           # CI/CD workflows
```

## Making Changes

### TypeScript Packages

1. Make your changes in the relevant package under `packages/`
2. Add or update tests as needed
3. Run the full test suite: `pnpm test`
4. Run type checking: `pnpm typecheck`
5. Run linting: `pnpm lint`

### Python Package

1. Make your changes in `python/src/slopit/`
2. Add or update tests in `python/tests/`
3. Run tests: `pytest`
4. Run type checking: `pyright`
5. Run linting: `ruff check src/`

## Commit Messages

We follow conventional commit format:

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(behavioral): add scroll event capture`
- `fix(adapter-jspsych): handle missing element gracefully`
- `docs: update installation guide`

## Creating a Changeset

When making changes that should be released:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages have changed
2. Choose the semver bump type (major/minor/patch)
3. Write a summary of the changes

Include the generated changeset file in your PR.

## Pull Requests

1. Create a branch from `main`
2. Make your changes with tests
3. Create a changeset if releasing changes
4. Submit a PR with a clear description
5. Ensure CI passes

## Code Style

### TypeScript

- Use Biome for formatting and linting
- Follow existing patterns in the codebase
- Use strict TypeScript (no `any`)
- Write JSDoc comments for public APIs

### Python

- Use Ruff for formatting and linting
- Follow NumPy docstring style
- Use strict type hints (no `Any`)
- Target Python 3.13+

## Testing

- Write tests for new functionality
- Maintain or improve code coverage
- Use descriptive test names
- Test edge cases

## Documentation

- Update docs when changing public APIs
- Add JSDoc/docstrings for new functions
- Keep README files current
- Add examples for new features

## Questions?

Open an issue for questions or discussions about contributing.
