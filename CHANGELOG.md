# Changelog — BOOST Schema Validator

All notable changes to this project are recorded here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/)
(versioning rubric: `../../docs/versioning.md`, Mode C). Releases are tagged
`vX.Y.Z`; `package.json` carries the current version.

## [Unreleased]

### Security
- Bumped `tar` to 7.5.9 (CVE-2026-24842, CVE-2026-26960).

### Changed
- Repointed schema sync to `BOOST-Working-Group/BOOST`, pinned to schema v3.4.2.

### Added
- `BOOST_ATTRIBUTION.md` crediting the Loamist origin of the validator.
- CI workflow: build + typecheck + schema-prep.
- File upload (drag-drop / browse) for `.json` and `.csv` inputs.

### Ops
- Gated public deploy behind the E&O binder (auto-deploy trigger disabled).

## [1.0.0] - 2025-12-10

### Added
- Initial BOOST Schema Validator: React + TypeScript + Vite single-page app that
  validates data against the BOOST JSON schema. Dockerized (dev and production
  compose files, nginx config) for self-hosted deployment.
