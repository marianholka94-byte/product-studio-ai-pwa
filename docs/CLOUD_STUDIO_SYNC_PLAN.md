# Cloud ↔ Studio synchronization plan

Status: Phases A and B are implemented in the isolated commercial preview. This plan records the current behavior and the remaining conflict-management work; production remains unchanged.

## Current source-of-truth boundaries

- The local Studio project library is stored in IndexedDB database `product-studio-ai-projects`, object stores `projects` and `products`. Local records contain browser `Blob` objects for original photographs.
- The commercial cloud library uses authenticated D1 records (`products`, `projects`, `assets`, `product_images`) and private R2 objects. Its API scopes records to the authenticated account.
- Local cloud-sync checkpoints are stored in `cloudSyncByAccount`, keyed by the authenticated cloud user ID. Switching accounts never treats another account's cloud copy as already saved. Legacy unscoped checkpoints are adopted only after the current account proves ownership of the remote product and project.
- The current cloud project payload stores `name`, `productId`, `prompt`, `settings`, and `exportPreset`. The local Studio project contains more individual settings (product, style, scene preset, format, motion, duration, lighting, extra, prompt, images).
- The existing AI generator uses its own legacy backend session in `localStorage`. Cloud-library auth is separate and uses `sessionStorage`. These sessions must not be conflated.
- The existing local save/open/duplicate/delete workflow must continue to work offline and must not silently change when cloud sync is introduced.

## Non-negotiable safety rules

1. No automatic upload, overwrite, delete, archive, or merge of local records.
2. No destructive migration of IndexedDB and no change to its database name, version, stores, or key paths as part of the first sync milestone.
3. A cloud operation must require an authenticated cloud session and must never reuse the generator's legacy token.
4. Every cloud operation must remain account-scoped on the server; client-provided owner IDs are never trusted.
5. A local project remains local until the user explicitly chooses **Uložiť do cloudu**. A cloud project remains unchanged until the user explicitly chooses **Aktualizovať cloudový projekt**.
6. Never silently replace unsaved editor state. Opening a saved project must use the existing confirmation pattern.
7. Cloud media must be fetched through the authenticated asset endpoint. No public R2 URLs or direct bucket access.
8. Do not trigger paid AI generation during sync or import.
9. Keep the commercial preview isolated from production. Do not merge preview branches or alter production Worker, production D1/R2, or the stable main app without explicit approval.

## Field mapping

| Local Studio field | Cloud project representation |
| --- | --- |
| `name` | `projects.name` |
| `productId` | `projects.product_id` only when it refers to a cloud product owned by the same account |
| `prompt` | `projects.prompt` |
| `style`, `scenePreset`, `format`, `motion`, `duration`, `resolution`, `model`, `lighting`, `extra` | `projects.settings_json` |
| `exportPreset` | `projects.export_preset` |
| `images[].blob` | private R2 objects with D1 `assets` metadata; image order and primary image recorded in `product_images` or a project-asset relation |
| local `id` | separate `cloudId` mapping; never assume IDs are interchangeable |

## Phased implementation

### Phase A — read-only cloud import <complete in preview>

- Add an explicit **Použiť v štúdiu** action to active cloud products.
- Fetch product image metadata and image bytes using the logged-in cloud token.
- Convert fetched blobs into `File` objects and call the existing `PSAIProjectBridge.restore` contract.
- Do not write to IndexedDB, overwrite a cloud record, or start generation.
- Require confirmation before replacing current editor contents.
- If a product has no active images, show a clear error and leave the editor untouched.

### Phase B — explicit local-to-cloud save <complete in preview>

- Add an explicit action to a local product/project card.
- Create or select the cloud product first; upload images sequentially, preserving order and primary image.
- Only after product and media uploads succeed, create the cloud project and store all Studio settings in `settings_json`.
- If a later step fails, report the partial result and provide a retry path; do not delete existing cloud data automatically.
- Persist the returned cloud IDs locally as optional metadata only after the cloud save succeeds. Existing local fields remain unchanged.

### Phase C — explicit cloud project open/update <partially implemented in preview>

- [x] Load project data and its linked cloud product's private images.
- [x] Open as a read-only local Studio working copy; the cloud source remains unchanged.
- [x] Allow explicit metadata edits through the cloud library UI while preserving settings and export preset.
- Validate and normalize settings before calling `PSAIProjectBridge.restore`.
- [x] Add optimistic concurrency checks for cloud project edits: the editor sends the `updatedAt` version it originally opened, and the Worker applies the update only if that version is still current.
- [x] Return the current project on HTTP 409 and preserve the user's typed text so the edit can be reviewed and reapplied against the latest version.
- [ ] Add a dedicated save-as-copy/reload choice for conflicts before enabling full cloud project editing from Studio.
- Track `cloudId`, `cloudUpdatedAt`, and a local sync version so stale edits can be detected.

### Phase D — conflict handling and recovery <partially implemented>

- [x] Compare cloud `updatedAt` before project updates and enforce the comparison atomically in the database update predicate.
- [x] If cloud data changed elsewhere, reject the stale update with HTTP 409 and return the current version; never silently last-write-wins.
- [ ] Add an explicit reload-latest or save-as-copy action to the conflict UI.
- Keep a retry-safe operation identifier for uploads; avoid duplicate assets on retries.
- Add a manual disconnect/revoke flow and document what remains in local IndexedDB versus cloud storage.

## Acceptance tests for current preview write-sync

- Import a cloud product and verify the editor receives the correct product name and every image in order.
- Confirm import does not change local IndexedDB records or cloud records.
- [x] Save a local project to cloud with retry-safe checkpoints, image checksums, and idempotent product/project creation.
- [x] Keep a separate cloud save state for each customer account; verify a local project saved to account A is still eligible for a separate save to account B.
- [ ] Run the two-account API acceptance script against two real preview accounts.
- Interrupt upload halfway and verify the UI reports partial completion without losing the local project.
- [x] Add a live acceptance test that sends a stale project version and verifies HTTP 409 with no change to the saved project.
- [ ] Open the same cloud project in two browser sessions and manually verify that stale updates are detected rather than overwritten.
- [x] Automated SQL/static checks cover tenant ownership constraints and authenticated resource lookups.
- [ ] Run the live cross-account test to verify account B cannot read, update, archive, or download account A's project or media.
- [x] Automated checks cover logout revocation, expired-session rejection, and separation from the generator's independent session.
- [ ] Run the live two-account acceptance script to confirm logout revocation against the deployed preview.
- Verify no AI generation endpoint is called during import/save.

## Next implementation target

Complete live two-account acceptance and interrupted-save/lost-response verification, then add an explicit conflict-resolution choice (reload latest or save as a copy). Do not enable paid generation or production cutover as part of this preview work.
