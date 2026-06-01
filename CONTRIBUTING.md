# Contributing to ShowPR Community Edition

Thank you for your interest in contributing! This guide covers everything you need to get started.

---

## Step 1: Understand the Project

Before writing any code, take time to understand what ShowPR does and how it works.

1. **Use the live app** at [show-pr.vercel.app](https://show-pr.vercel.app). Sign in, explore the dashboard, try the filters, preview a public profile, and test the embed/badge features.
2. **Read the [Architecture Docs](docs/ARCHITECTURE.md)** to understand the codebase structure, data flow, and design decisions.
3. **Browse the codebase** and get familiar with how components, API routes, and utilities are organized.

---

## Step 2: Set Up Locally

1. Fork the repository on GitHub.

2. Clone your fork and set up upstream:

   ```bash
   git clone https://github.com/<your-username>/ShowPR-Community.git
   cd ShowPR-Community
   git remote add upstream https://github.com/santhosh-005/ShowPR-Community.git
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required values. See `.env.example` for documentation on each variable.

5. Set up the database. Create the `github_profiles` table in your Supabase project:

   ```sql
   CREATE TABLE github_profiles (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     github_username TEXT UNIQUE NOT NULL,
     encrypted_token TEXT,
     iv TEXT,
     settings JSONB DEFAULT '{}',
     email TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

6. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

---

## Step 3: Find Something to Work On

- Browse [open issues](https://github.com/santhosh-005/ShowPR-Community/issues).
- Look for `good first issue` or `level1` labels if you are new.
- Comment on the issue to let others know you are picking it up.
- If you have a new idea, open an issue first before starting work.

---

## Step 4: Make Your Changes

1. Create a branch from `main`:

   ```
   <type>/issue-<number>-<short-description>
   ```

   Examples: `feat/issue-12-toast-notifications`, `fix/issue-8-dark-mode-bug`

2. Write clear, focused commits following [Conventional Commits](https://www.conventionalcommits.org/):

   ```
   <type>(<scope>): <short description>
   ```

   | Type | Use for |
   |------|---------|
   | `feat` | New feature |
   | `fix` | Bug fix |
   | `docs` | Documentation only |
   | `style` | Formatting, no logic change |
   | `refactor` | Restructuring without behavior change |
   | `test` | Adding or updating tests |
   | `chore` | Maintenance, dependencies, CI |

3. Test your changes locally before pushing.

---

## Step 5: Submit a Pull Request

- Link the related issue (e.g., "Closes #12").
- Keep PRs focused -- one feature or fix per PR.
- Include screenshots for any UI changes.
- Run `npm run lint` before submitting.
- Be responsive to review feedback.

A maintainer will review your PR, typically within a day. You may be asked to make changes -- this is normal.

---

## Ways to Contribute

Contributions are not limited to code. Here are all the ways you can help:

**Code Contributions**
- Fix bugs, add features, improve performance, write tests.

**Design and UX**
- Improve layouts, interactions, or visual consistency.
- Follow the existing theme and color system. Keep designs clean, professional, and minimal.
- Avoid using heavy UI libraries or distracting animations.

**Research and Findings**
- Investigate best practices, tools, or approaches relevant to the project.
- Submit your findings as an issue or discussion with a clear summary.

**Feature Proposals**
- Suggest new features or improvements to existing ones.
- Open an issue describing the problem you are solving and your proposed approach.

**Documentation**
- Improve existing docs, add missing guides, fix typos.

---

## Code Style

- **TypeScript** preferred for new components. JavaScript is acceptable for existing patterns.
- **Tailwind CSS** for styling. Follow existing utility class patterns.
- **Imports** use path aliases: `@/components/...`, `@/lib/...`
- **Files** use kebab-case (`pr-card.tsx`). Component exports use PascalCase.
- **API routes** follow Next.js App Router conventions.

When in doubt, match the existing code.

---

## Recognition and Rewards

- **All contributors** are acknowledged and featured in the README and community pages.
- **Top contributors** may receive rewards, be invited to join the **ShowPR Founding Team**, or receive special mentions and featuring across ShowPR platforms.

Every contribution matters -- from a typo fix to a major feature.

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold a welcoming and respectful environment.

---

## Questions?

- Open a [Discussion](https://github.com/santhosh-005/ShowPR-Community/discussions) (if enabled).
- Comment on a relevant issue.
- Reach out @showpr.team@gmail.com

Thank you for helping make ShowPR better!
