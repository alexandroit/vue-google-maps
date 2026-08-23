# Changelog

All notable changes to `@stackline/vue-google-maps` are documented here.

## [Unreleased]

- Moved exact-version dependency records to `package.fixture.json`, repaired
  their validators, and added an offline catalog contract to keep historical
  metadata out of active dependency alerts.
- Refreshed vulnerable build dependencies and forced tsup's nested esbuild onto
  the patched release line.
- Added a package-specific security policy and confidential reporting path.
- Added reproducible CI packaging and a manual npm provenance release workflow.
- Included release and security documentation in the published package.

## [3.0.0] - 2026-04-05

- Promoted the maintained package line to Vue 3.
- Preserved the existing map, marker, shape, layer, directions, and geocoding API.
- Added versioned Vue 3 documentation.

## [2.0.0] - 2026-04-05

- Published the initial Vue 2 wrapper and documentation line.

[Unreleased]: https://github.com/alexandroit/vue-google-maps/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/alexandroit/vue-google-maps/releases/tag/v3.0.0
[2.0.0]: https://github.com/alexandroit/vue-google-maps/releases/tag/v2.0.0
