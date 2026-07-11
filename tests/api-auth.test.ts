import test from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";

const PORT = 3057;
const BASE_URL = `http://localhost:${PORT}`;

let server: ChildProcess;

async function waitForServer(timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE_URL}/login`);
      if (response.ok) return;
    } catch {
      // server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Server did not become ready in time");
}

test.before(async () => {
  server = spawn("npx", ["next", "dev", "-p", String(PORT)], {
    cwd: process.cwd(),
    stdio: "ignore",
    detached: true
  });
  await waitForServer(60_000);
});

test.after(() => {
  if (server?.pid) {
    process.kill(-server.pid, "SIGTERM");
  }
});

// Every one of these routes handles real business data (leads, metrics, PDFs,
// team/settings) and must reject unauthenticated requests with 401. This is a
// regression guard for the bug found in this project: the auth middleware
// excludes /api/* entirely, so any route that forgets to call
// requirePermission() is public by default with no login required.
const protectedGetRoutes = [
  "/api/leads",
  "/api/leads/does-not-exist",
  "/api/dashboard/metrics",
  "/api/crm/kanban",
  "/api/cities",
  "/api/categories",
  "/api/team",
  "/api/settings",
  "/api/audit-logs",
  "/api/search-jobs",
  "/api/finance/sales",
  "/api/campaigns"
];

const protectedPostRoutes = [
  "/api/ai/analyze",
  "/api/ai/message",
  "/api/documents/contract",
  "/api/documents/proposal",
  "/api/documents/quote",
  "/api/cities",
  "/api/categories",
  "/api/search-jobs",
  "/api/finance/sales",
  "/api/campaigns"
];

test("protected GET routes reject unauthenticated requests with 401", async () => {
  for (const route of protectedGetRoutes) {
    const response = await fetch(`${BASE_URL}${route}`);
    assert.equal(response.status, 401, `expected 401 for GET ${route}, got ${response.status}`);
  }
});

test("protected POST routes reject unauthenticated requests with 401", async () => {
  for (const route of protectedPostRoutes) {
    const response = await fetch(`${BASE_URL}${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    assert.equal(response.status, 401, `expected 401 for POST ${route}, got ${response.status}`);
  }
});

test("the NextAuth handler and login page stay public", async () => {
  const login = await fetch(`${BASE_URL}/login`);
  assert.equal(login.status, 200);

  const providers = await fetch(`${BASE_URL}/api/auth/providers`);
  assert.equal(providers.status, 200);
});

test("static assets in public/ are never intercepted by the auth middleware", async () => {
  const icon = await fetch(`${BASE_URL}/ryze-mark.png`, { redirect: "manual" });
  assert.equal(icon.status, 200, "a public/ image must not be redirected to /login by the auth middleware");
});
