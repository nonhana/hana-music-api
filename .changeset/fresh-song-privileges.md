---
'hana-music-api': minor
---

Declare numeric `id`, `st`, and `pl` in `SongDetailBody.privileges` and each song's `privilege` in `AlbumBody` and `ArtistTopSongBody`. Validate these fields before returning SDK responses, preserve undeclared fields, and expose the same contract through the exported TypeScript types and Standard Schema validators.
