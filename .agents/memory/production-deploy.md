---
name: Production deploy command
description: Correct server paths for deploying NaughtyHaughty to production
---

# Production Deploy Command

## Rule
The `admin` DirectAdmin user owns all domains on 157.250.205.180.

**NaughtyHaughty path:** `/home/admin/domains/naughtyhaughty.com/public_html`
**RichDatingNetwork path:** `/home/admin/domains/test.richdatingnetwork.com/public_html`
**Deploy script:** `bash scripts/push-to-github.sh` (run from Replit shell)

**Why:** All domains belong to the `admin` DirectAdmin account. The `admin_naughtyhaughty` path was created by a previous agent as a separate user account — the user cannot see it in their file manager and does not want files there. Always deploy to `/home/admin/domains/<domain>/public_html`.

**How to apply:** Never use `admin_naughtyhaughty` or any other invented username. All paths are `/home/admin/domains/<domain>/public_html`.
