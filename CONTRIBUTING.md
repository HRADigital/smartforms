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
- Update `CHANGELOG.md` under `## [Unreleased]`.

## Code style

- One class per file, PascalCase filename matching the class name.
- 4-space indent, single quotes, trailing commas — enforced by Prettier.
- No `any`-style escape hatches in JSDoc; if you JSDoc, type it properly.

## Releasing (maintainers only)

1. Bump `version` in `package.json`.
2. Move `## [Unreleased]` to `## [x.y.z] - YYYY-MM-DD` in `CHANGELOG.md`.
3. Tag: `git tag vX.Y.Z && git push --tags`.
4. The `release.yml` workflow builds and publishes to npm.
