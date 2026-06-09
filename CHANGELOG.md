# hana-music-api

## 1.0.0

### Major Changes

- 9b71f47: Release the first SDK-first npm package contract as `1.0.0`.

  Highlights:
  - switch the root package surface to the frozen SDK contract centered on `createHanaMusicApi`
  - add camelCase raw module exports on the root SDK surface
  - ship tsdown-based ESM-only build artifacts and explicit package exports
  - add package-consumer verification, changesets, and GitHub release automation
