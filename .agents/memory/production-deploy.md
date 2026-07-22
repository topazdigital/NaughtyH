---
name: Production deploy command
description: Correct server paths for deploying NaughtyHaughty to production
---

# Production Deploy Command

## Rule
Always use the `admin` DirectAdmin user for all deployments on 157.250.205.180.

**NaughtyHaughty path:** `/home/admin/domains/naughtyhaughty.com/public_html`
**RichDatingNetwork path:** `/home/admin/domains/test.richdatingnetwork.com/public_html`
**Deploy script:** `bash scripts/push-to-github.sh` (from Replit shell)

**Why:** A previous agent invented a non-existent `admin_naughtyhaughty` DirectAdmin user. All domains belong to the same `admin` account on the server. The DirectAdmin file manager confirms naughtyhaughty.com is under the `admin` home directory alongside richdatingnetwork.com and other domains.

**How to apply:** Never use `admin_naughtyhaughty` or any other invented username. All paths are `/home/admin/domains/<domain>/public_html`.
