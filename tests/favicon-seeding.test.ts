import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, test } from "bun:test";
import { findLegacyIconSource } from "../scripts/fetch-favicons";

describe("favicon seeding", () => {
  test("reuses legacy icon assets before fetching the network", async () => {
    const root = await mkdtemp(join(tmpdir(), "legacy-favicon-"));
    await mkdir(join(root, "public/icons"), { recursive: true });
    await writeFile(join(root, "public/icons/42.svg"), "<svg />", "utf8");

    expect(findLegacyIconSource(root, "42")).toBe(join(root, "public/icons/42.svg"));
    expect(findLegacyIconSource(root, "missing")).toBeNull();
  });
});
