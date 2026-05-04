# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Reorganized source into `src/` with one PascalCase class per file.
- Renamed `Aesir*` identifiers, files, and selectors to `Smart*`.

### Added
- npm package metadata, Rollup build (ESM + CJS + UMD).
- ESLint flat config + Prettier + EditorConfig.
- GitHub Actions CI (lint, test, build, CodeQL) and release workflow.
- Vitest test scaffold with happy-dom.
- Public `autoInit()` entry point.

### Removed
- Per-folder `README.md` files (`formvalidation/`, `toolbaractions/`).
- `@copyright`, `@since`, `@license` docblock tags.
