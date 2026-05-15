import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pinyin } from "pinyin-pro";
import {
  resources,
  resourceGroups,
  type ResourceGroup,
  type ResourceStatus,
} from "../src/data/resources";

export const ROOT = new URL("..", import.meta.url).pathname;
export const RESOURCES_FILE = join(ROOT, "src", "data", "resources.json");
export const GROUPS_FILE = join(ROOT, "src", "data", "groups.json");
export const FETCH_SCRIPT = join(ROOT, "scripts", "fetch-favicons.ts");

export interface NewResource {
  id: string;
  name: string;
  url: string;
  group: string;
  type: string;
  use: string;
  status: ResourceStatus;
}

export interface NewGroupInput {
  title: string;
  id: string;
  description: string;
}

export interface FlowResult {
  resource: NewResource;
  group?: ResourceGroup;
}

export interface WriteOptions {
  dryRun: boolean;
  skipFavicon: boolean;
}

export { resources, resourceGroups, type ResourceGroup, type ResourceStatus };

export function uniqueList(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

export function groupByTitle(title: string): ResourceGroup | undefined {
  return resourceGroups.find((g) => g.title === title);
}

export function typesForGroup(title: string): string[] {
  return uniqueList(resources.filter((r) => r.group === title).map((r) => r.type));
}

export function resourcesForGroup(title: string): string[] {
  return uniqueList(resources.filter((r) => r.group === title).map((r) => r.name)).slice(0, 5);
}

export function nextId(): string {
  let max = -1;
  for (const r of resources) {
    const n = Number(r.id);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return String(max + 1);
}

export function groupExists(title: string): boolean {
  return resourceGroups.some((g) => g.title === title);
}

export function groupIdExists(id: string): boolean {
  return resourceGroups.some((g) => g.id === id);
}

export function isValidUrl(url: string): boolean {
  if (url === "#") return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidGroupId(id: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

export function validateStatus(status: string): ResourceStatus {
  if (status !== "curated" && status !== "pending") {
    throw new Error(`--status must be "curated" or "pending", got: ${status}`);
  }
  return status;
}

export function urlTaken(url: string): string | null {
  if (url === "#") return null;
  const hit = resources.find((r) => r.url === url);
  return hit ? hit.name : null;
}

export function assertUrlAvailable(url: string, allowDuplicate = false) {
  const dup = urlTaken(url);
  if (dup && !allowDuplicate) {
    throw new Error(`URL already used by "${dup}".`);
  }
}

export function validateNewGroup(title: string, id: string, description: string): ResourceGroup {
  const nextGroup: ResourceGroup = {
    id: id.trim(),
    title: title.trim(),
    description: description.trim(),
  };
  if (!nextGroup.title) throw new Error("新分组 title 不能为空。");
  if (groupExists(nextGroup.title)) throw new Error(`分组 "${nextGroup.title}" 已存在。`);
  if (!nextGroup.id) throw new Error("新分组 id 不能为空。");
  if (!isValidGroupId(nextGroup.id)) {
    throw new Error(`新分组 id "${nextGroup.id}" 不合法。只能使用小写字母、数字和连字符，例如 services-accounts。`);
  }
  if (groupIdExists(nextGroup.id)) throw new Error(`分组 id "${nextGroup.id}" 已存在。`);
  if (!nextGroup.description) throw new Error("新分组 description 不能为空。");
  return nextGroup;
}

export function slugifyGroupTitle(title: string): string {
  const converted = pinyin(title, {
    toneType: "none",
    type: "array",
  }).join("-");
  return converted
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateUniqueGroupId(title: string): string {
  const base = slugifyGroupTitle(title) || "group";
  let candidate = base;
  let suffix = 2;
  while (groupIdExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export function buildResource(input: Omit<NewResource, "id">): NewResource {
  if (!input.name.trim()) throw new Error("名字不能为空。");
  if (!input.url.trim()) throw new Error("链接不能为空。");
  if (!isValidUrl(input.url)) throw new Error(`Invalid URL: ${input.url}`);
  assertUrlAvailable(input.url.trim());
  if (!input.group.trim()) throw new Error("分组不能为空。");
  if (!input.type.trim()) throw new Error("类型不能为空。");
  if (!input.use.trim()) throw new Error("用途不能为空。");
  return {
    id: nextId(),
    name: input.name.trim(),
    url: input.url.trim(),
    group: input.group.trim(),
    type: input.type.trim(),
    use: input.use.trim(),
    status: validateStatus(input.status),
  };
}

export function renderGroup(group: ResourceGroup): string {
  return JSON.stringify(group, null, 2)
    .split("\n")
    .map((line) => "  " + line)
    .join("\n");
}

export function renderEntry(resource: NewResource): string {
  return JSON.stringify(resource, null, 2)
    .split("\n")
    .map((line) => "  " + line)
    .join("\n");
}

export function insertGroupIntoFile(group: ResourceGroup) {
  const raw = readFileSync(GROUPS_FILE, "utf8");
  let list: ResourceGroup[];
  try {
    list = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${GROUPS_FILE} 不是合法 JSON: ${err instanceof Error ? err.message : err}`);
  }
  if (!Array.isArray(list)) {
    throw new Error(`${GROUPS_FILE} 顶层不是数组。`);
  }
  if (list.some((item) => item.id === group.id || item.title === group.title)) {
    throw new Error(`分组 "${group.title}" 已存在于 ${GROUPS_FILE}。`);
  }
  list.push(group);
  writeFileSync(GROUPS_FILE, JSON.stringify(list, null, 2) + "\n", "utf8");
}

export function insertResourceIntoFile(resource: NewResource) {
  const raw = readFileSync(RESOURCES_FILE, "utf8");
  let list: NewResource[];
  try {
    list = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${RESOURCES_FILE} 不是合法 JSON: ${err instanceof Error ? err.message : err}`);
  }
  if (!Array.isArray(list)) {
    throw new Error(`${RESOURCES_FILE} 顶层不是数组。`);
  }
  list.push(resource);
  writeFileSync(RESOURCES_FILE, JSON.stringify(list, null, 2) + "\n", "utf8");
}

export async function runFetchFavicon(id: string): Promise<boolean> {
  console.log(`\n→ Fetching favicon for id ${id}...`);
  const proc = Bun.spawn({
    cmd: ["bun", FETCH_SCRIPT, "--only", id],
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await proc.exited;
  return code === 0;
}

export async function writeFlowResult(result: FlowResult, options: WriteOptions): Promise<void> {
  if (options.dryRun) return;
  if (result.group) {
    insertGroupIntoFile(result.group);
    console.log(`\n✓ Appended to ${GROUPS_FILE.replace(ROOT, "")}`);
  }
  insertResourceIntoFile(result.resource);
  console.log(`\n✓ Appended to ${RESOURCES_FILE.replace(ROOT, "")}`);
  if (!options.skipFavicon) {
    const ok = await runFetchFavicon(result.resource.id);
    if (!ok) console.warn("⚠ favicon fetch exited non-zero; a letter fallback SVG is in place.");
  }
}
