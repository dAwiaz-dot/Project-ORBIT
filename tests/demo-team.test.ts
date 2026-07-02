import assert from "node:assert/strict";
import { test } from "node:test";
import { UserRole } from "@prisma/client";
import {
  authenticateDemoTeamUser,
  createDemoTeamUser,
  deleteDemoTeamUser,
  listDemoTeamUsers,
  updateDemoTeamUser
} from "@/services/demo/team-store";

test("demo team users are persisted in the fallback store and can authenticate", async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const email = `qa-${suffix}@orbit.local`;
  const password = `senha-${suffix}`;
  const nextPassword = `nova-${suffix}`;

  const created = await createDemoTeamUser({
    name: "QA Orbit",
    email,
    password,
    role: UserRole.SELLER
  });

  assert.equal(created.email, email);
  assert.equal(created.hasPassword, true);
  assert.ok(listDemoTeamUsers().some((user) => user.id === created.id));

  const authenticated = await authenticateDemoTeamUser(email, password);
  assert.equal(authenticated?.id, created.id);
  assert.equal(authenticated?.role, UserRole.SELLER);

  const updated = await updateDemoTeamUser(created.id, {
    role: UserRole.FINANCE,
    password: nextPassword
  });
  assert.equal(updated.role, UserRole.FINANCE);

  assert.equal(await authenticateDemoTeamUser(email, password), null);
  assert.equal((await authenticateDemoTeamUser(email, nextPassword))?.id, created.id);

  deleteDemoTeamUser(created.id, "development-admin-davi");
  assert.equal(await authenticateDemoTeamUser(email, nextPassword), null);
});
