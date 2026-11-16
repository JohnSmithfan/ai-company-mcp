import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_PROFILE,
  PROFILE_ORDER,
  departmentCount,
  getRegistry,
  parseProfile
} from "../src/registry/registry.js";
import { CompanyError } from "../src/errors/codes.js";
import { handleRequest } from "../src/core/handlers.js";
import { installSandbox } from "./sandbox.js";
import { makeTestConfig, META, rpc } from "./helpers.js";

installSandbox();
const config = makeTestConfig();

const EXPECTED_COUNTS: Record<string, number> = {
  micro: 2,
  small: 5,
  medium: 9,
  large: 18,
  group: 36
};

for (const profile of PROFILE_ORDER) {
  test(`AT-004: profile ${profile} registry is complete and parseable`, () => {
    const registry = getRegistry(profile);
    const slugs = registry.departments.map((d) => d.slug);
    assert.equal(new Set(slugs).size, slugs.length, "duplicate slug found");
    assert.equal(registry.departments.length, EXPECTED_COUNTS[profile]);
    for (const department of registry.departments) {
      assert.ok(department.slug.length > 0);
      assert.ok(department.domain.length > 0);
      assert.ok(department.name.length > 0);
      assert.ok(department.responsibility.length > 0);
    }
  });
}

test("AT-004: default profile is micro", () => {
  assert.equal(DEFAULT_PROFILE, "micro");
});

test("AT-004: profiles form a strict superset chain", () => {
  let previous = new Set<string>();
  for (const profile of PROFILE_ORDER) {
    const slugs = new Set(
      getRegistry(profile).departments.map((d) => d.slug)
    );
    for (const slug of previous) {
      assert.ok(slugs.has(slug), `${profile} lost ${slug} from superset`);
    }
    previous = slugs;
  }
});

test("AT-004: departmentCount helper matches registry", () => {
  for (const profile of PROFILE_ORDER) {
    assert.equal(departmentCount(profile), EXPECTED_COUNTS[profile]);
  }
});

test("AT-004: invalid profile is a deterministic startup error", () => {
  assert.throws(
    () => parseProfile("mega-corp"),
    (error: unknown) =>
      error instanceof CompanyError && error.code === "COMPANY_005"
  );
});

test("AT-004: resources/read company://departments reflects profile (semantic layer)", () => {
  const smallConfig = makeTestConfig({ profile: "small" });
  const response = handleRequest(
    rpc(11, "resources/read", {
      uri: "company://departments",
      _meta: META
    }),
    smallConfig
  );
  assert.ok(response);
  const result = response.result as {
    contents: { uri: string; text: string }[];
  };
  assert.equal(result.contents[0].uri, "company://departments");
  const payload = JSON.parse(result.contents[0].text) as {
    profile: string;
    department_count: number;
  };
  assert.equal(payload.profile, "small");
  assert.equal(payload.department_count, 5);
});
