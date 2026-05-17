import type { ResourceEntry } from "./resources";

export function deriveTagCounts(resources: readonly ResourceEntry[]): [string, number][] {
  const counts = new Map<string, number>();

  for (const resource of resources) {
    for (const tag of resource.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()].sort((left, right) => {
    const byCount = right[1] - left[1];
    if (byCount !== 0) return byCount;
    return left[0].localeCompare(right[0], "zh-Hans-CN");
  });
}
