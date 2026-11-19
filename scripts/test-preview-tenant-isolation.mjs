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
try {
  const accountA = await login(credentials[0]);
  tokenA = accountA.token;
  const accountB = await login(credentials[1]);
  tokenB = accountB.token;
  assert.notEqual(accountA.userId, accountB.userId, "The two test logins must resolve to different customer accounts.");
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
  const product = productsA.products[0];
  const project = projectsA.projects[0];

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

  console.log("PASS: two-account tenant isolation, private image authorization, and server-side logout revocation.");
} finally {
  // Revoke any session left active if an earlier assertion fails. Never print tokens.
  await Promise.all([tokenA, tokenB].filter(Boolean).map(token =>
    request("/api/auth/logout", { token, method: "POST" }).catch(() => null)
  ));
}
