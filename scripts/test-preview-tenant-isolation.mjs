import assert from "node:assert/strict";

const base = (process.env.PREVIEW_API_BASE || "https://product-studio-ai-commercial-preview.marianholka94.workers.dev").replace(/\/$/, "");
const credentials = [
  { label: "A", email: process.env.PREVIEW_ACCOUNT_A_EMAIL, password: process.env.PREVIEW_ACCOUNT_A_PASSWORD },
  { label: "B", email: process.env.PREVIEW_ACCOUNT_B_EMAIL, password: process.env.PREVIEW_ACCOUNT_B_PASSWORD }
];
for (const account of credentials) {
  if (!account.email || !account.password) {
    throw new Error("Set PREVIEW_ACCOUNT_A_EMAIL/PASSWORD and PREVIEW_ACCOUNT_B_EMAIL/PASSWORD before running this test.");
  }
}

async function request(path, { token, method = "GET", body } = {}) {
  const headers = {};
  if (token) headers.Authorization = "Bearer " + token;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(base + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store"
  });
  return response;
}
async function uploadAcceptanceImage(token, productId) {
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aZ0AAAAASUVORK5CYII=", "base64");
  return fetch(base + "/api/products/" + encodeURIComponent(productId) + "/images", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "image/png" },
    body: png,
    cache: "no-store"
  });
}
async function login(account) {
  const response = await request("/api/auth/login", {
    method: "POST",
    body: { email: account.email, password: account.password }
  });
  const data = await response.json().catch(() => ({}));
  assert.equal(response.status, 200, "Test account " + account.label + " could not sign in (HTTP " + response.status + ").");
  assert.ok(data.token, "Test account " + account.label + " did not receive a session token.");
  assert.ok(data.user?.id, "Test account " + account.label + " did not return an account identity.");
  return { token: data.token, userId: data.user.id };
}
async function expectStatus(label, response, expected) {
  assert.equal(response.status, expected, label + " returned HTTP " + response.status + "; expected " + expected + ".");
}

let tokenA = "";
let tokenB = "";
let idempotentProductId = "";
let idempotentProjectId = "";
try {
  const accountA = await login(credentials[0]);
  tokenA = accountA.token;
  const accountB = await login(credentials[1]);
  tokenB = accountB.token;
  assert.notEqual(accountA.userId, accountB.userId, "The two test logins must resolve to different customer accounts.");

  // Exercise the same authenticated credit-wallet read used by Cloud Library.
  // This catches database/schema failures that a table-existence health check cannot detect.
  for (const [label, token] of [["Account A", tokenA], ["Account B", tokenB]]) {
    const walletResponse = await request("/api/credits", { token });
    const walletBody = await walletResponse.json().catch(() => ({}));
    assert.equal(walletResponse.status, 200,
      label + " credit wallet returned HTTP " + walletResponse.status + ": " + JSON.stringify(walletBody));
    assert.ok(Number.isSafeInteger(walletBody.available) && walletBody.available >= 0,
      label + " credit wallet must return a non-negative integer balance.");
    assert.ok(Number.isSafeInteger(walletBody.reserved) && walletBody.reserved >= 0,
      label + " credit wallet must return a non-negative integer reserved balance.");
    assert.ok(Array.isArray(walletBody.history), label + " credit wallet must return ledger history.");
  }


  // A lost create response must be safely replayable with the same account-scoped
  // idempotency key. A changed payload with that key must fail closed.
  const productOperationId = "acceptance-product-fixture-v1";
  const productPayload = {
    name: "Acceptance retry product fixture",
    description: "Temporary automated idempotency acceptance record.",
    idempotencyKey: productOperationId
  };
  const firstProductResponse = await request("/api/products", { token: tokenA, method: "POST", body: productPayload });
  assert.ok([200, 201].includes(firstProductResponse.status), "First idempotent product create returned HTTP " + firstProductResponse.status + ".");
  const firstProduct = await firstProductResponse.json();
  idempotentProductId = firstProduct.product?.id || "";
  assert.ok(idempotentProductId, "First product create must return its durable product ID.");
  if (firstProduct.product?.archivedAt) {
    await expectStatus("Restore persistent acceptance product fixture", await request("/api/products/" + encodeURIComponent(idempotentProductId) + "/restore", { token: tokenA, method: "POST" }), 200);
  }

  const replayProductResponse = await request("/api/products", { token: tokenA, method: "POST", body: productPayload });
  await expectStatus("Replay idempotent product create", replayProductResponse, 200);
  const replayProduct = await replayProductResponse.json();
  assert.equal(replayProduct.product?.id, idempotentProductId, "Retrying a committed product create must return the original product ID.");
  assert.equal(replayProduct.replayed, true, "Product replay must be explicitly identified.");

  const changedProductResponse = await request("/api/products", {
    token: tokenA, method: "POST",
    body: { ...productPayload, name: productPayload.name + " changed" }
  });
  await expectStatus("Changed product payload with reused idempotency key", changedProductResponse, 409);

  const projectOperationId = "acceptance-project-fixture-v1";
  const projectPayload = {
    name: "Acceptance retry project fixture",
    productId: null,
    prompt: "Temporary automated idempotency acceptance record.",
    settings: {},
    exportPreset: null,
    idempotencyKey: projectOperationId
  };
  const firstProjectResponse = await request("/api/projects", { token: tokenA, method: "POST", body: projectPayload });
  assert.ok([200, 201].includes(firstProjectResponse.status), "First idempotent project create returned HTTP " + firstProjectResponse.status + ".");
  const firstProject = await firstProjectResponse.json();
  idempotentProjectId = firstProject.project?.id || "";
  assert.ok(idempotentProjectId, "First project create must return its durable project ID.");

  const replayProjectResponse = await request("/api/projects", { token: tokenA, method: "POST", body: projectPayload });
  await expectStatus("Replay idempotent project create", replayProjectResponse, 200);
  const replayProject = await replayProjectResponse.json();
  assert.equal(replayProject.project?.id, idempotentProjectId, "Retrying a committed project create must return the original project ID.");
  assert.equal(replayProject.replayed, true, "Project replay must be explicitly identified.");

  const clearOptionalProductResponse = await request("/api/projects/" + encodeURIComponent(idempotentProjectId), {
    token: tokenA,
    method: "PATCH",
    body: {
      name: projectPayload.name,
      prompt: projectPayload.prompt,
      productId: null,
      settings: {},
      exportPreset: null,
      expectedUpdatedAt: firstProject.project.updatedAt
    }
  });
  await expectStatus("Update project while keeping product unlinked", clearOptionalProductResponse, 200);
  const unlinkedProject = await clearOptionalProductResponse.json();
  assert.equal(unlinkedProject.project?.productId, null, "Project updates must preserve an intentionally empty product link.");

  const changedProjectResponse = await request("/api/projects", {
    token: tokenA, method: "POST",
    body: { ...projectPayload, prompt: projectPayload.prompt + " changed" }
  });
  await expectStatus("Changed project payload with reused idempotency key", changedProjectResponse, 409);

  const [afterProductReplayResponse, afterProjectReplayResponse] = await Promise.all([
    request("/api/products", { token: tokenA }),
    request("/api/projects", { token: tokenA })
  ]);
  await expectStatus("Product collection after idempotent replay", afterProductReplayResponse, 200);
  await expectStatus("Project collection after idempotent replay", afterProjectReplayResponse, 200);
  const [afterProductReplay, afterProjectReplay] = await Promise.all([
    afterProductReplayResponse.json(), afterProjectReplayResponse.json()
  ]);
  assert.equal(afterProductReplay.products.filter(item => item.id === idempotentProductId).length, 1, "Product retry must not create duplicate records.");
  assert.equal(afterProjectReplay.projects.filter(item => item.id === idempotentProjectId).length, 1, "Project retry must not create duplicate records.");
  // Reuse one account-scoped fixture across deployments so the acceptance
  // test does not create a new permanent R2 object on every run.
  const fixtureManifestResponse = await request("/api/products/" + encodeURIComponent(idempotentProductId) + "/images", { token: tokenA });
  await expectStatus("Acceptance product image manifest", fixtureManifestResponse, 200);
  const fixtureManifest = await fixtureManifestResponse.json();
  if (!fixtureManifest.images?.length) {
    await expectStatus("Upload temporary acceptance image", await uploadAcceptanceImage(tokenA, idempotentProductId), 201);
  }
  const [historyAResponse, historyBResponse] = await Promise.all([
    request("/api/generations?limit=20", { token: tokenA }),
    request("/api/generations?limit=20", { token: tokenB })
  ]);
  await expectStatus("Account A generation history", historyAResponse, 200);
  await expectStatus("Account B generation history", historyBResponse, 200);
  const [historyA, historyB] = await Promise.all([historyAResponse.json(), historyBResponse.json()]);
  assert.ok(Array.isArray(historyA.generations) && Array.isArray(historyB.generations), "Generation history must return a list for each account.");
  const historyAIds = new Set(historyA.generations.map(item => item.id));
  assert.ok(!historyB.generations.some(item => historyAIds.has(item.id)), "Account B generation history leaked an Account A generation.");
  const [productsAResponse, projectsAResponse, productsBResponse, projectsBResponse] = await Promise.all([
    request("/api/products", { token: tokenA }),
    request("/api/projects", { token: tokenA }),
    request("/api/products", { token: tokenB }),
    request("/api/projects", { token: tokenB })
  ]);
  for (const [label, response] of [
    ["Account A products", productsAResponse], ["Account A projects", projectsAResponse],
    ["Account B products", productsBResponse], ["Account B projects", projectsBResponse]
  ]) await expectStatus(label, response, 200);

  const [productsA, projectsA, productsB, projectsB] = await Promise.all([
    productsAResponse.json(), projectsAResponse.json(), productsBResponse.json(), projectsBResponse.json()
  ]);
  assert.ok(productsA.products?.length, "Account A needs at least one saved product for this test.");
  assert.ok(projectsA.projects?.length, "Account A needs at least one saved project for this test.");
  const product = productsA.products.find(item => item.id === idempotentProductId);
  const project = projectsA.projects.find(item => item.id !== idempotentProjectId) || projectsA.projects[0];
  assert.ok(product, "Account A must be able to read its temporary idempotency product.");

  const manifestAResponse = await request("/api/products/" + encodeURIComponent(product.id) + "/images", { token: tokenA });
  await expectStatus("Account A product image manifest", manifestAResponse, 200);
  const manifest = await manifestAResponse.json();
  assert.ok(manifest.images?.length, "The selected Account A product needs at least one image.");
  const assetId = manifest.images[0].id;

  assert.ok(!productsB.products?.some(item => item.id === product.id), "Account B product collection leaked an Account A product.");
  assert.ok(!projectsB.projects?.some(item => item.id === project.id), "Account B project collection leaked an Account A project.");

  await expectStatus("Account A can read own product", await request("/api/products/" + encodeURIComponent(product.id), { token: tokenA }), 200);
  await expectStatus("Account A can read own project", await request("/api/projects/" + encodeURIComponent(project.id), { token: tokenA }), 200);
  await expectStatus("Account A can read own private image", await request("/api/assets/" + encodeURIComponent(assetId), { token: tokenA }), 200);

  const staleProductVersion = Number(product.updatedAt) - 1;
  assert.ok(Number.isSafeInteger(staleProductVersion) && staleProductVersion >= 0, "Account A product must expose a valid version timestamp.");
  const staleProductEditResponse = await request("/api/products/" + encodeURIComponent(product.id), {
    token: tokenA,
    method: "PATCH",
    body: { name: product.name, description: product.description, expectedUpdatedAt: staleProductVersion }
  });
  await expectStatus("Stale cloud product edit", staleProductEditResponse, 409);
  const staleProductEdit = await staleProductEditResponse.json();
  assert.equal(staleProductEdit.currentProduct?.updatedAt, product.updatedAt, "A stale product edit must return the current product version without overwriting it.");
  const unchangedProductResponse = await request("/api/products/" + encodeURIComponent(product.id), { token: tokenA });
  await expectStatus("Account A product remains unchanged after stale edit", unchangedProductResponse, 200);
  const unchangedProduct = await unchangedProductResponse.json();
  assert.equal(unchangedProduct.product.updatedAt, product.updatedAt, "A rejected stale product edit must not change the product timestamp.");
  assert.equal(unchangedProduct.product.name, product.name, "A rejected stale product edit must not change the product name.");

  const staleVersion = Number(project.updatedAt) - 1;
  assert.ok(Number.isSafeInteger(staleVersion) && staleVersion >= 0, "Account A project must expose a valid version timestamp.");
  const staleEditResponse = await request("/api/projects/" + encodeURIComponent(project.id), {
    token: tokenA,
    method: "PATCH",
    body: {
      name: project.name,
      prompt: project.prompt,
      productId: project.productId,
      settings: project.settings,
      exportPreset: project.exportPreset,
      expectedUpdatedAt: staleVersion
    }
  });
  await expectStatus("Stale cloud project edit", staleEditResponse, 409);
  const staleEdit = await staleEditResponse.json();
  assert.equal(staleEdit.currentProject?.updatedAt, project.updatedAt, "A stale edit must return the current project version without overwriting it.");
  const unchangedProjectResponse = await request("/api/projects/" + encodeURIComponent(project.id), { token: tokenA });
  await expectStatus("Account A project remains unchanged after stale edit", unchangedProjectResponse, 200);
  const unchangedProject = await unchangedProjectResponse.json();
  assert.equal(unchangedProject.project.updatedAt, project.updatedAt, "A rejected stale edit must not change the project timestamp.");
  assert.equal(unchangedProject.project.name, project.name, "A rejected stale edit must not change the project name.");

  await expectStatus("Account B direct product-ID access", await request("/api/products/" + encodeURIComponent(product.id), { token: tokenB }), 404);
  await expectStatus("Account B product-image manifest access", await request("/api/products/" + encodeURIComponent(product.id) + "/images", { token: tokenB }), 404);
  await expectStatus("Account B direct project-ID access", await request("/api/projects/" + encodeURIComponent(project.id), { token: tokenB }), 404);
  await expectStatus("Account B direct private asset-ID access", await request("/api/assets/" + encodeURIComponent(assetId), { token: tokenB }), 404);
  await expectStatus("Account B cannot attach Account A product to a new project", await request("/api/projects", {
    token: tokenB,
    method: "POST",
    body: { name: "Isolation test", productId: product.id, prompt: "", settings: {}, exportPreset: null, idempotencyKey: "isolation-test-" + crypto.randomUUID() }
  }), 404);

  await expectStatus("Account A logout", await request("/api/auth/logout", { token: tokenA, method: "POST" }), 200);
  await expectStatus("Account A revoked session", await request("/api/auth/me", { token: tokenA }), 401);
  await expectStatus("Account B logout", await request("/api/auth/logout", { token: tokenB, method: "POST" }), 200);
  await expectStatus("Account B revoked session", await request("/api/auth/me", { token: tokenB }), 401);

  console.log("PASS: two-account tenant isolation, generation history isolation, private image authorization, and server-side logout revocation.");
} finally {
  // Archive temporary idempotency acceptance records even when a later
  // assertion fails. Never print session tokens or test account details.
  const cleanupTasks = [];
  if (idempotentProjectId && tokenA) cleanupTasks.push(request("/api/projects/" + encodeURIComponent(idempotentProjectId), { token: tokenA, method: "DELETE" }).catch(() => null));
  if (idempotentProductId && tokenA) cleanupTasks.push(request("/api/products/" + encodeURIComponent(idempotentProductId), { token: tokenA, method: "DELETE" }).catch(() => null));
  await Promise.all(cleanupTasks);
  // Revoke any session left active if an earlier assertion fails. Never print tokens.
  await Promise.all([tokenA, tokenB].filter(Boolean).map(token =>
    request("/api/auth/logout", { token, method: "POST" }).catch(() => null)
  ));
}
