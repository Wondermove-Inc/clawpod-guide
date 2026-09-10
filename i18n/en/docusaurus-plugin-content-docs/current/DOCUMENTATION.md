# ClawPod documentation maintenance

This public repository is the source of truth for ClawPod user and Agent documentation.

## Principles and audience

Describe ClawPod as one product, starting with the user's outcome. Explain prerequisites, actual Portal steps, expected results, troubleshooting, and undo/removal. State any permission, plan, release, or support conditions that affect results. Do not publish secrets, access tokens, internal URLs, customer data, unreleased features, or speculative behavior. Verify product screens and supported Agent releases first.

Team members need collaboration and outputs; organization administrators need Agent, credential, member, and access management; Agents need guidance appropriate to the current user's role and environment.

Documentation describes official consumer workflows, not an exhaustive runtime inventory. Prioritize current authorization, organization policy, and safely observed capabilities without bypassing access or creating capabilities through secrets, internal APIs, or hidden configuration. See [Agent interpretation](./guides/agent-document-reading.mdx), `AGENTS.md`, and `llms.txt`.

## Structure

The original Korean documents remain at the repository root. `index.mdx` introduces the product; `start/` covers first use, `concepts/` explains terms, `capabilities/` describes features and prerequisites, `guides/` documents workflows, `help/` covers errors, and `_templates/` supplies authoring templates. Start from the [task template](./_templates/task-guide.mdx).

English translations mirror the source paths under `i18n/en/docusaurus-plugin-content-docs/current/`. Do not move original files used by the existing Agent MCP. The website language selector changes the documentation language; it does not configure the Portal or add a language argument to the Agent MCP.

## English updates

When a source page changes, update its English counterpart and preserve supported workflows and limitations. Translate UI labels from the Portal English dictionary, not by guessing button names. Every public and compatibility route requires an English page; missing translations fail checks instead of silently falling back to Korean.

Run these commands from the repository root:

```bash
node scripts/export-ui-labels.mjs --portal-root /path/to/portal-repository
node scripts/export-ui-labels.mjs --english --portal-root /path/to/portal-repository
node scripts/sync-ui-labels.mjs
node scripts/sync-ui-labels.mjs --english
node scripts/generate-readme.mjs
node scripts/generate-guide-index.mjs
node scripts/generate-guide-index.mjs --english
node scripts/generate-english-readme.mjs
npm run check
npm run build
```

Use `--check` on generators and label synchronization to verify without rewriting. Label exports contain only referenced string keys and fail on missing keys. Keep the `data-ui-label` spans inside `strong` when emphasizing labels; plain Markdown remains readable on GitHub and the site.

README and search indexes are generated from navigation and translated frontmatter. Do not hand-edit generated files. Sidebar, navbar, and footer translations live in the adjacent Docusaurus translation JSON files.

## Public scope and compatibility

Catalog entries must explain outcomes, limits, verified release/role/plan/operator conditions, setup, readiness, Agent actions versus user confirmation, and removal/revocation. Code-only tests, development tools, and recovery paths are not automatically supported customer features.

Keep platform-wide operations, internal deployment details, policy defaults, and unverified integrations out of public guides. Explain customer-facing limitations honestly. Existing addresses may remain as short pointers listed in `scripts/public-compatibility-pages.json`; exclude them from navigation and search. These files and Git history are public, so compatibility lists are not access controls. Do not move internal content into another public folder.

## Links and checks

Use relative links beginning with `./` or `../` and include actual file extensions, such as `../guides/manage-agent.mdx`. Docusaurus resolves these as document routes; GitHub opens the files. Use `:::note` and `:::warning` for callouts. Navigation identifiers omit extensions.

```bash
node scripts/check-links.mjs
node scripts/check-links.mjs --english
node scripts/check-links.mjs --external
```

Offline CI checks verify source links, anchors, navigation, translations, and search scope. Manual external checks return 1 for broken links and 2 for unverifiable responses. Treat 404/410 as failures, and 401/403/429 or network errors as requiring review. Do not remove or replace a URL just because access could not be verified.

## Preview and publish

Use Node.js 22, then `npm ci`, `npm run check`, `npm run build`, and `npm run serve`. `npm run start` previews development; `npm run start -- --locale en` previews English. The production build creates both languages and checks all routes, local links, anchors, raw documents, and the GitHub Pages base path.

Set repository Pages Source to GitHub Actions. Organization restrictions may require an organization owner. No external app or personal token belongs in this repository. Pull requests validate and build; passing builds on `main` deploy through GitHub's short-lived authentication and the `github-pages` environment. The Documentation checks and Pages workflow can also be run manually on `main`.

The Korean site is `https://wondermove-inc.github.io/clawpod-guide/`; English is under `/en/`. Confirm deployment in Actions. For domain changes, update `url`, `baseUrl`, Pages/DNS settings, and recheck links.

Each language has local search, `guide-index.json`, `llms.txt`, and raw Markdown. No external search account is needed. The original Korean index and document paths used by the Agent MCP remain unchanged.

## Menu and workflow verification

Before documenting a Portal entry point, record the tested environment, account role, visible navigation, and actual click destination in a private verification report. A route file, translation key, or successful documentation build is not proof that a customer can access a feature. Distinguish tenant administration from platform operations. Keep internal hostnames, account data, and screenshots containing customer content out of this public repository. Update both languages and search indexes when retiring an entry point; preserve previous document URLs with accurate guidance.
