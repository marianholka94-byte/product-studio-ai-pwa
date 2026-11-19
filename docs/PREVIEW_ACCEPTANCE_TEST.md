# Commercial Preview Acceptance Test

This is a manual acceptance plan for the isolated preview only. It must not be run against production.

## Preconditions

- Use the commercial preview Pages URL and its matching preview Worker.
- Use two independent test accounts with separate email addresses.
- The repeatable two-account API test is available as `scripts/test-preview-tenant-isolation.mjs`; it checks account-scoped lists, direct product/project/asset IDs, private image manifests, and logout revocation without changing saved data.
- Run it from a trusted computer with Node.js 22 and the two test-account credentials supplied only as environment variables (never paste passwords or session tokens into chat or commit them):
  `PREVIEW_ACCOUNT_A_EMAIL=... PREVIEW_ACCOUNT_A_PASSWORD=... PREVIEW_ACCOUNT_B_EMAIL=... PREVIEW_ACCOUNT_B_PASSWORD=... node scripts/test-preview-tenant-isolation.mjs`
- Do not share account credentials or invite codes in screenshots or chat.
- Keep the existing production application and published Android app unchanged.

## A. Account isolation

1. Register test account A and create one product with two images and one project.
2. Sign out.
3. Register or sign in as test account B.
4. Confirm account B sees no products or projects created by A.
5. Attempt to open an asset and a project ID copied from account A while signed in as B. Both requests must return not found/unauthorized without revealing metadata or media.
6. Sign out and sign back in as A. Confirm the original records and images remain available.

## B. Project restore fidelity

1. In account A, save a project with a distinctive prompt, non-default Studio settings, an explicit export preset, and at least two differently named images.
2. Sign out, then sign in again.
3. Open the saved project back into Studio.
4. Verify the prompt, every setting, export preset, image count, and image order match the saved project.
5. Confirm opening the project does not mutate the cloud original.

## C. Interrupted save recovery

1. Create a new local project with two or more images.
2. Start saving it to the cloud.
3. Interrupt the network after one image has uploaded but before the project is created (airplane mode or a controlled network interruption).
4. Restore connectivity and retry the same local save.
5. Confirm the same product is reused, already-uploaded images are checksum-verified and not duplicated, remaining images upload once, and exactly one cloud project is created.
6. Repeat with a different local image in the same slot. The retry must stop with a clear mismatch error rather than mixing the files.
7. Confirm no duplicate product/project appears after refresh.
8. Test a lost project-create response: allow the project POST to reach the Worker and commit, but drop the response before it reaches the browser (for example, with a local proxy that aborts the response after forwarding the request). Retry the unchanged save from the same local project.
9. Confirm the retry returns/reuses the original project ID and the account still has exactly one matching project. The operation key must remain unchanged across the retry; do not manually create a second local project for this test.
10. Reuse the same operation key with a changed project payload only in a controlled API test. The Worker must return HTTP 409 and must not mutate the original project.
11. Also test the cloud-library manual **Create product** and **Create project** forms: allow the POST to commit but drop the response, then retry without changing the form. Confirm the same record ID is returned and no duplicate is listed. Refresh the tab, re-enter the exact same values, and retry once to confirm the operation-key checkpoint survives within the same browser session (the form text itself is not persisted).
12. Change the form payload after a failed attempt and submit again. Confirm a new operation key is used and the new record is created once. Double-click the create button rapidly and confirm only one request is submitted.

## D. Per-account local cloud-save state

1. Create a local Studio project and save it to cloud account A.
2. Sign out of cloud account A and sign in to cloud account B without deleting the local project.
3. Confirm the same local project offers **Uložiť do cloudu** for account B rather than showing account A's saved state.
4. Save the local project to account B.
5. Switch back to account A and confirm its state still shows **Uložené v cloude**.
6. Confirm each account contains its own cloud product, images, and project, while the local project remains intact.
7. If testing a local project saved by an older app version, confirm the old cloud state is adopted only by the account that can read the referenced cloud product and project.

## E. Session behavior

1. Sign in and confirm the cloud library loads.
2. Use the logout action.
3. Confirm the UI returns to the signed-out state.
4. Attempt an authenticated API request using the revoked session; it must return 401.
5. Confirm an expired session is rejected and the user can sign in again.

## F. Android WebView (later phase)

Only after the stable app hostname and WebView allowlist have been deliberately configured on a dedicated Android integration branch:

- Install a test-only APK.
- Repeat sign-in, image picker, cloud save, interrupted retry, project restore, and logout inside the WebView.
- Check external links, back navigation, app relaunch, and offline recovery.
- Do not publish or distribute a release build without explicit approval.

## Acceptance criteria

- No cross-account data or media access.
- Exact restoration of project prompt/settings/export preset and image order.
- Retry never creates duplicate products, images, or projects.
- A mismatched image set is rejected safely.
- Logout revokes the server session.
- Production data, production Worker, and published Android app remain untouched.
