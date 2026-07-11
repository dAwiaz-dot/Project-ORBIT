import test from "node:test";
import assert from "node:assert/strict";
import { hasPermission, rolePermissions, type Permission } from "../lib/permissions";

test("ADMIN has every defined permission", () => {
  const allPermissions = new Set<Permission>(Object.values(rolePermissions).flat());
  for (const permission of allPermissions) {
    assert.equal(hasPermission("ADMIN", permission), true, `ADMIN should have ${permission}`);
  }
});

test("SELLER cannot manage team, settings or read audit logs", () => {
  assert.equal(hasPermission("SELLER", "team:read"), false);
  assert.equal(hasPermission("SELLER", "team:write"), false);
  assert.equal(hasPermission("SELLER", "settings:read"), false);
  assert.equal(hasPermission("SELLER", "settings:write"), false);
  assert.equal(hasPermission("SELLER", "audit:read"), false);
});

test("SELLER can operate the prospecting flow", () => {
  assert.equal(hasPermission("SELLER", "leads:read"), true);
  assert.equal(hasPermission("SELLER", "leads:update"), true);
  assert.equal(hasPermission("SELLER", "searchJobs:create"), true);
  assert.equal(hasPermission("SELLER", "exports:create"), true);
});

test("FINANCE cannot create search jobs or update leads", () => {
  assert.equal(hasPermission("FINANCE", "searchJobs:create"), false);
  assert.equal(hasPermission("FINANCE", "leads:update"), false);
});

test("FINANCE can read team, audit and settings", () => {
  assert.equal(hasPermission("FINANCE", "team:read"), true);
  assert.equal(hasPermission("FINANCE", "audit:read"), true);
  assert.equal(hasPermission("FINANCE", "settings:read"), true);
});

test("only ADMIN and FINANCE can read or write financial data", () => {
  assert.equal(hasPermission("ADMIN", "finance:read"), true);
  assert.equal(hasPermission("ADMIN", "finance:write"), true);
  assert.equal(hasPermission("FINANCE", "finance:read"), true);
  assert.equal(hasPermission("FINANCE", "finance:write"), true);
  assert.equal(hasPermission("SELLER", "finance:read"), false);
  assert.equal(hasPermission("SELLER", "finance:write"), false);
});

test("only ADMIN can write team or settings", () => {
  for (const role of ["SELLER", "FINANCE"] as const) {
    assert.equal(hasPermission(role, "team:write"), false, `${role} should not have team:write`);
    assert.equal(hasPermission(role, "settings:write"), false, `${role} should not have settings:write`);
  }
  assert.equal(hasPermission("ADMIN", "team:write"), true);
  assert.equal(hasPermission("ADMIN", "settings:write"), true);
});
