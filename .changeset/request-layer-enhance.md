---
"hana-music-api": minor
---

Strengthen the request layer for high-frequency usage and traffic disguise.

Highlights:

- fix weapi (`e_r`) encrypted-response decryption to match legacy behavior (eapi and weapi encrypted responses are both decrypted now)
- inject a runtime China IP (`cnIp`) by default on the SDK path when neither `ip` nor `realIP` is provided (explicit `ip`/`realIP` still wins; the HTTP server path is unaffected)
- apply a conservative default per-attempt request timeout of 8s (disable with `timeoutMs: 0`)
- retry "connection never established" transport errors by default (no double-submit risk; ambiguous socket errors and business status codes still require explicit opt-in)
- support opt-in gzip eapi responses via `acceptGzip`
- lazily ensure an anonymous token on SDK calls, deduplicated with single-flight
- add an opt-in SDK response cache with single-flight request dedup (`cache`)
- add an opt-in anonymous identity pool that rotates deviceId/cnIp/token across calls (`identityPool`)
