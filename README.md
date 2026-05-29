<div align="center">
  <img src="public/logo.png" alt="ShowPR Logo" width="80" />
  <h1>ShowPR Community Edition</h1>
  <p>View, manage, and visually showcase your GitHub Pull Requests with an intuitive dashboard designed for developers who want their work to be seen.</p>

  <a href="https://show-pr.vercel.app">Live App</a> &middot;
  <a href="#getting-started">Getting Started</a> &middot;
  <a href="docs/ARCHITECTURE.md">Architecture</a> &middot;
  <a href="CONTRIBUTING.md">Contributing</a>

  <br /><br />

  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/GSSoC%202026-Participating-orange" alt="GSSoC 2026" />
  <img src="https://img.shields.io/github/stars/santhosh-005/ShowPR-Community?style=social" alt="Stars" />
</div>

---

## About

ShowPR is a developer-focused platform for showcasing, managing, and sharing GitHub pull requests and engineering contributions. Originally built as a solo project, ShowPR has grown to **350+ users** and received **150+ upvotes on Product Hunt**.

This Community Edition is the open-source version of ShowPR, released to enable developers worldwide to contribute, learn, and build together.

## Features

- **GitHub Authentication** -- Secure login with GitHub OAuth
- **PR Dashboard** -- View all your pull requests (open, closed, merged) in one place with real-time data
- **Advanced Filtering** -- Filter PRs by repository, status, and search by title or PR number
- **Analytics and Charts** -- Track PR activity over time with pie charts and line graphs
- **Customizable Profile** -- Create a shareable public profile to showcase your contributions
- **Embed Widget** -- Add an interactive PR showcase to your personal website via iframe
- **SVG Badge** -- Generate a dynamic SVG badge for your GitHub README
- **Custom PR Selection** -- Hand-pick specific PRs to highlight on your profile
- **Dark / Light Mode** -- Full theme support with system preference detection
- **Responsive Design** -- Works on desktop, tablet, and mobile
- **Security** -- AES-256 encrypted token storage, webhook signature verification, security headers

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript / JavaScript |
| Styling | Tailwind CSS |
| UI Components | Radix UI |
| Authentication | NextAuth.js (GitHub OAuth) |
| Database | Supabase (PostgreSQL) |
| Charts | Recharts, Nivo, Chart.js |
| Error Tracking | Sentry |
| Deployment | Vercel |

## Project Structure

```
showpr/
├── app/
│   ├── (client)/              # Client-side routes (auth required)
│   │   ├── auth/              # Sign in / sign out pages
│   │   ├── context/           # SharedStateContext provider
│   │   ├── dashboard/         # Main PR dashboard page
│   │   └── profile/           # Profile settings page
│   ├── (server)/              # Server-rendered routes
│   │   ├── [username]/        # Public profile pages
│   │   └── embed/             # Embeddable widget pages
│   ├── api/
│   │   ├── auth/              # NextAuth.js route handler
│   │   ├── badge/             # SVG badge generation API
│   │   ├── github/            # GitHub data proxy API
│   │   ├── github-profile/    # Profile CRUD operations
│   │   └── github-webhook/    # GitHub webhook handler
│   ├── layout.tsx             # Root layout with metadata
│   └── globals.css            # Global styles
├── components/
│   ├── dashboard/             # Dashboard UI components
│   ├── embed/                 # Embed widget component
│   └── landing/               # Landing page sections
├── lib/
│   ├── encryption.js          # AES-CBC encryption utilities
│   ├── github-api-utils.js    # GitHub GraphQL API helpers
│   ├── supabaseClient.js      # Supabase client initialization
│   └── utils.ts               # General utility functions
├── types/                     # TypeScript type definitions
├── public/                    # Static assets
├── docs/                      # Architecture documentation
├── .env.example               # Environment variable template
├── CONTRIBUTING.md            # Contribution guidelines
├── CODE_OF_CONDUCT.md         # Community code of conduct
└── LICENSE                    # MIT License
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- A [GitHub OAuth App](https://github.com/settings/developers) (for authentication)
- A [Supabase](https://supabase.com/) project (for database)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/santhosh-005/ShowPR-Community.git
   cd ShowPR-Community
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Open `.env.local` and fill in the required values. See [Environment Variables](#environment-variables) below.

4. **Set up the database**

   Create a `github_profiles` table in your Supabase project:

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

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required

| Variable | Description |
|----------|-------------|
| `GITHUB_ID` | GitHub OAuth App client ID |
| `GITHUB_SECRET` | GitHub OAuth App client secret |
| `NEXTAUTH_SECRET` | Random secret for NextAuth.js session encryption |
| `NEXTAUTH_URL` | Canonical URL of your deployment |
| `NEXT_PUBLIC_BASE_URL` | Public-facing base URL |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |
| `AES_KEY` | 256-bit hex key for token encryption |
| `GITHUB_WEBHOOK_SECRET` | Secret for verifying GitHub webhook payloads |

### Optional

| Variable | Description |
|----------|-------------|
| `SENTRY_DSN` | Sentry DSN for server-side error tracking |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for client-side error tracking |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Sentry source map upload configuration |
| `NEXT_PUBLIC_FEEDBACK_WEBHOOK_URL` | Endpoint for feedback form submissions |
| `NEXT_PUBLIC_WELCOME_EMAIL_WEBHOOK_URL` | Endpoint for welcome email notifications |
| `TWITTER_HANDLE` | Twitter handle used in meta tags |

## Contributing

We welcome contributions from developers of all experience levels. Whether you are fixing a bug, adding a feature, or improving documentation, your work matters.

Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

Key points:
- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Open an issue before working on large changes
- All PRs require review before merging

## Recognition

We value every contribution. Top contributors and long-term community members may be:

- Featured in the Contributors section of this README
- Invited to join the **Founding Team** of ShowPR
- Given maintainer access to help shape the project's future

## License

This project is licensed under the [MIT License](LICENSE).

## Links

- **Live App**: [show-pr.vercel.app](https://show-pr.vercel.app)
- **Product Hunt**: [ShowPR on Product Hunt](https://www.producthunt.com/posts/showpr)
- **Architecture Docs**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Issues**: [GitHub Issues](https://github.com/santhosh-005/ShowPR-Community/issues)
