# ElderCare Monorepo

A pnpm monorepo powering the ElderCare platform — apps, services, and shared packages.

## Structure

```
ElderCare/
├── apps/
│   ├── elder-care-web/      # Main elder care web app
│   ├── pharmacy-web/        # Pharmacy portal
│   └── rides-web/           # Rides booking app
├── packages/
│   ├── config/
│   │   ├── eslint/          # @eldercare/eslint-config
│   │   ├── prettier/        # @eldercare/prettier-config
│   │   └── typescript/      # @eldercare/tsconfig
│   └── shared/              # @eldercare/shared — types & utilities
├── services/
│   ├── agent/               # @eldercare/agent — AI agent service
│   ├── api/                 # @eldercare/api — REST API
│   └── mcp/                 # @eldercare/mcp — MCP server
└── docs/                    # Documentation
```

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 — install with `npm i -g pnpm`

## Getting Started

```bash
# Install all dependencies
pnpm install

# Run all dev servers
pnpm dev

# Lint all packages
pnpm lint

# Format all files
pnpm format

# Type-check all packages
pnpm typecheck
```

## Tooling

| Tool                                                      | Purpose                                   |
| --------------------------------------------------------- | ----------------------------------------- |
| [pnpm](https://pnpm.io)                                   | Package manager & workspace orchestration |
| [TypeScript](https://www.typescriptlang.org)              | Static typing                             |
| [ESLint](https://eslint.org)                              | Linting (flat config, v9+)                |
| [Prettier](https://prettier.io)                           | Code formatting                           |
| [Husky](https://typicode.github.io/husky)                 | Git hooks                                 |
| [lint-staged](https://github.com/lint-staged/lint-staged) | Run linters on staged files               |

## Adding a New Package

1. Create a new directory under `apps/`, `packages/`, or `services/`
2. Add a `package.json` with `name: "@eldercare/<name>"`
3. Reference shared configs with `workspace:*`
4. Run `pnpm install` to link

## Shared Configs Usage

```json
// package.json in any workspace package
{
  "devDependencies": {
    "@eldercare/tsconfig": "workspace:*",
    "@eldercare/eslint-config": "workspace:*",
    "@eldercare/prettier-config": "workspace:*"
  },
  "prettier": "@eldercare/prettier-config"
}
```

```json
// tsconfig.json
{
  "extends": "@eldercare/tsconfig/node.json"
}
```

```js
// eslint.config.mjs
import config from "@eldercare/eslint-config/node";
export default [...config];
```
