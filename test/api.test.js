import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";
const { default: app } = await import("../src/index.js");

async function token() {
  const response = await request(app).post("/api/auth/session").send({ role: "patient" });
  assert.equal(response.status, 200);
  return response.body.token;
}

test("health endpoint is available", async () => {
  const response = await request(app).get("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
});

test("session token protects state endpoint", async () => {
  const jwt = await token();
  const state = await request(app).get("/api/state").set("Authorization", `Bearer ${jwt}`);
  assert.equal(state.status, 200);
  assert.equal(state.body.user.authenticated, true);
});

test("share creation returns a one-time PIN-shaped value", async () => {
  const jwt = await token();
  const response = await request(app).post("/api/shares").set("Authorization", `Bearer ${jwt}`).send({ doctorId: "d1", recordIds: ["r1"], hours: "24" });
  assert.equal(response.status, 201);
  assert.match(response.body.pin, /^\d{6}$/);
  assert.equal(response.body.share.recordIds[0], "r1");
});
