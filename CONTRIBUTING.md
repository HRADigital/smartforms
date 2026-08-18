# Contributing

Thanks for your interest in improving `smartforms`!

## Local setup

```bash
nvm use 20         # or any Node >= 20 (see `engines` in package.json)
npm ci
npm run lint
npm test
npm run build
```

## Branching

- Branch off `master`.
- Use short, kebab-case branch names: `fix/datetime-validation`, `feat/list-reorder`.

## Commits

Please follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add reorder support to SmartFormList
fix(input): clear invalid state when value matches initial
docs: expand toolbar role table
```

## Pull requests

- One concern per PR.
- Add or update tests for any behavior change.
- Run `npm run lint`, `npm run format:check`, and `npm test` before pushing.
- Write Conventional Commit messages. They are the changelog: the release
  notes are generated from them, so describe the change in the commit body.

## Code style

- One class per file, PascalCase filename matching the class name.
- 4-space indent, single quotes, trailing commas — enforced by Prettier.
- No `any`-style escape hatches in JSDoc; if you JSDoc, type it properly.

## Releasing (maintainers only)

Nothing is done by hand. Never bump `version` in `package.json` - it is not
the source of truth and semantic-release ignores it.

1. Merge a releasable commit to `master` (`feat`, `fix`, `perf`, `refactor`
   or `revert`; the other types cut no release).
2. `release.yml` runs semantic-release, which derives the next version from
   the tag history, tags it, and cuts a GitHub Release whose notes are
   generated from the commit messages.
3. That Release triggers `publish.yml`, which publishes to npm over OIDC
   trusted publishing, with provenance. No tokens are involved.
