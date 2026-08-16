## 1.0.0 (2026-08-16)

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- `NumberInput` step validation no longer rejects legal decimal values. `value % step` left a floating point residue for any step binary cannot hold exactly, so a value such as `41.7015` against `step="0.0000001"` was marked invalid; the same residue carried the sign of the value, so negative values were never checked at all. The count of steps from the step base is now compared against a whole number within a magnitude-aware tolerance, and the base is taken from `min` where one is declared, as the HTML step base is defined.

## [1.1.0] - 2026-07-13

### Added
- `TextAreaInput` character limit enforcement (`data-limit`) and an optional live counter guide (`data-guide`) that warns when nearing the limit.
- `SmartFormList.resource()` returning the list's `data-resource` attribute, mirroring `SmartForm.resource()` so `TaskExecutor` can read the resource from either form body.

### Fixed
- Documentation: `README.md` now lists `EmailInput` and the `input[type=password] -> TextInput` mapping, documents the `edit`, `destroy`, and `back` toolbar roles, and corrects the per-state button-enable matrix and the form-level state list to match `Button.js` / `State.js`.
- `types/index.d.ts` rewritten to match the actual public API (removed the non-existent `reordered` state, `LINK` / `REORDER` roles, and fictional `autoInit` signature; added `EmailInput`, `Tasks`, `TaskExecutor`, and the real method surfaces).
- `CONTRIBUTING.md` no longer references a non-existent `.nvmrc`.

## [0.1.1] - 2026-05-04

### Fixed
- CJS bundle was unusable (`require()` returned `{}`) because `package.json` `"type": "module"` made Node treat `dist/smartforms.cjs.js` as ESM. Bundles now ship as `smartforms.cjs` and `smartforms.mjs` with explicit extensions so Node honors the format regardless of the package type.

## [0.1.0] - 2026-05-04

### Changed
- Reorganized source into `src/` with one PascalCase class per file.
- Renamed `Aesir*` identifiers, files, and selectors to `Smart*`.

### Added
- npm package metadata, Rollup build (ESM + CJS + UMD).
- ESLint flat config + Prettier.
- GitHub Actions CI (lint, test, build, CodeQL) and release workflow.
- Vitest test scaffold with happy-dom.
- Public `autoInit()` entry point.

### Removed
- Per-folder `README.md` files (`formvalidation/`, `toolbaractions/`).
- `@copyright`, `@since`, `@license` docblock tags.
