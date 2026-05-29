# Contributing to ShowPR Community Edition

Thank you for your interest in contributing to ShowPR! This guide will help you get started and ensure a smooth contribution experience.

## Table of Contents

- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Git Commit Conventions](#git-commit-conventions)
- [Branch Naming](#branch-naming)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Issue Guidelines](#issue-guidelines)
- [Code Style](#code-style)
- [Recognition and Rewards](#recognition-and-rewards)
- [Code of Conduct](#code-of-conduct)

---

## Getting Started

1. **Fork the repository** on GitHub.

2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/<your-username>/ShowPR-Community.git
   cd ShowPR-Community
   ```

3. **Add the upstream remote**:

   ```bash
   git remote add upstream https://github.com/santhosh-005/ShowPR-Community.git
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required values. See [README.md](README.md#environment-variables) for details.

6. **Run the development server**:

   ```bash
   npm run dev
   ```

7. **Understand the project**: Read the [Architecture Documentation](docs/ARCHITECTURE.md) to understand the codebase structure, data flow, and design decisions.

---

## How to Contribute

### Reporting Bugs

- Search [existing issues](https://github.com/santhosh-005/ShowPR-Community/issues) to avoid duplicates.
- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) when creating a new issue.
- Include steps to reproduce, expected behavior, and screenshots if applicable.

### Suggesting Features

- Open a new issue using the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).
- Describe the problem you are trying to solve, not just the solution.
- Be open to discussion -- maintainers may suggest alternative approaches.

### Submitting Code

1. **Check for an existing issue** or create one before starting work.
2. **Comment on the issue** to let others know you are working on it.
3. **Create a branch** from `main` (see [Branch Naming](#branch-naming)).
4. **Make your changes** with clear, focused commits (see [Git Commit Conventions](#git-commit-conventions)).
5. **Test your changes** locally.
6. **Push your branch** and open a pull request.

---

## Git Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must follow this format:

```
<type>(<scope>): <short description>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code restructuring without changing behavior |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks (dependencies, configs, CI) |
| `perf` | Performance improvements |

### Examples

```
feat(dashboard): add search highlight for filtered PRs
fix(auth): handle expired GitHub tokens gracefully
docs(readme): add Supabase setup instructions
style(navbar): fix inconsistent spacing in mobile menu
refactor(api): extract GitHub GraphQL queries to constants
test(utils): add tests for generateMonthRanges function
chore(deps): update next to v15.3.2
```

---

## Branch Naming

Use descriptive branch names following this convention:

```
<type>/issue-<number>-<short-description>
```

### Examples

```
feat/issue-12-toast-notifications
fix/issue-8-dark-mode-persistence
docs/issue-15-api-documentation
```

---

## Pull Request Guidelines

- **Fill out the PR template** completely.
- **Link the related issue** (e.g., "Closes #12").
- **Keep PRs focused** -- one feature or fix per PR.
- **Include screenshots** for any UI changes.
- **Ensure no lint errors** -- run `npm run lint` before submitting.
- **Write descriptive titles** using the same convention as commits (e.g., `feat(dashboard): add toast notifications`).
- **Be responsive** to review feedback.

### PR Review Process

1. A maintainer will review your PR mostly within a day.
2. You may be asked to make changes -- this is normal and part of the process.
3. Once approved, a maintainer will merge your PR.

---

## Issue Guidelines

- **Search before creating** -- your issue may already exist.
- **Use templates** -- they help maintainers understand and triage your issue faster.
- **Be specific** -- vague issues are hard to act on.
- **Feature requests are welcome** -- we encourage the community to propose new ideas.
- **One issue per topic** -- don't combine unrelated bugs or features.

---

## Code Style

ShowPR follows these conventions:

- **TypeScript / JavaScript** -- the project uses a mix; new components should use TypeScript where possible.
- **React** -- functional components with hooks.
- **Styling** -- Tailwind CSS utility classes. Follow existing patterns in the codebase.
- **Imports** -- use path aliases (`@/components/...`, `@/lib/...`).
- **File naming** -- kebab-case for files (`pr-card.tsx`), PascalCase for component exports.
- **API routes** -- Next.js App Router conventions with `route.ts` / `route.js`.

When in doubt, follow the patterns you see in the existing code.

---

## Recognition and Rewards

We believe in recognizing the people who help build ShowPR:

- **All contributors** will be acknowledged and Featured  in the README and community pages.
- **Top contributors** who consistently deliver quality work will be:
  - Featured prominently in the README and community pages with Top Badges.
  - Invited to join the **ShowPR Founding Team**.
  - Given cashbacks or swags.

Your contributions matter -- whether it is a one-line typo fix or a major feature.

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold a welcoming, inclusive, and respectful environment for everyone.

---

## Questions?

If you have questions about contributing, feel free to:

- Open a [Discussion](https://github.com/santhosh-005/ShowPR-Community/discussions) (if enabled).
- Comment on a relevant issue.
- Reach out @showpr.team@gmail.com

Thank you for helping make ShowPR better!
