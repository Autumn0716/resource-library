export interface ResourceData {
  title: string;
  slug: string;
  url: string;
  group: string;
  type: "website" | "tool" | "library" | "template" | "article" | "course" | "github" | "community" | "dataset" | "api" | "docs" | "inspiration";
  originalType: string;
  summary: string;
  status: "active" | "pending" | "deprecated" | "broken";
  legacyId?: string;
  tags: string[];
  audience: string[];
  useCases: string[];
  alternatives: string[];
  pricing: "free" | "paid" | "freemium" | "open-source" | "unknown";
  language: Array<"zh" | "en" | "multi">;
  difficulty: "beginner" | "intermediate" | "advanced" | "unknown";
  featured: boolean;
  priority?: number;
  addedAt: string;
  updatedAt?: string;
  lastCheckedAt: string;
  favicon: string;
  screenshot: string;
}

export interface ResourceEntry {
  id: string;
  data: ResourceData;
}

export interface ResourceFilters {
  group?: string;
  type?: ResourceData["type"];
  tag?: string;
  pricing?: ResourceData["pricing"];
  language?: ResourceData["language"][number];
  difficulty?: ResourceData["difficulty"];
  status?: ResourceData["status"];
}

const statusRank: Record<ResourceData["status"], number> = {
  active: 0,
  pending: 1,
  deprecated: 2,
  broken: 3,
};

export function sortResources<T extends ResourceEntry>(resources: readonly T[]): T[] {
  return [...resources].sort((left, right) => {
    const byStatus = statusRank[left.data.status] - statusRank[right.data.status];
    if (byStatus !== 0) return byStatus;
    return left.data.title.localeCompare(right.data.title, "zh-Hans-CN");
  });
}

export function sortResourcesByRecency<T extends ResourceEntry>(resources: readonly T[]): T[] {
  return [...resources].sort((left, right) => {
    const leftDate = left.data.updatedAt ?? left.data.addedAt;
    const rightDate = right.data.updatedAt ?? right.data.addedAt;
    const byDate = rightDate.localeCompare(leftDate);
    if (byDate !== 0) return byDate;
    return left.data.title.localeCompare(right.data.title, "zh-Hans-CN");
  });
}

export function filterResources<T extends ResourceEntry>(resources: readonly T[], filters: ResourceFilters): T[] {
  return resources.filter((resource) => {
    if (filters.group && resource.data.group !== filters.group) return false;
    if (filters.type && resource.data.type !== filters.type) return false;
    if (filters.tag && !resource.data.tags.includes(filters.tag)) return false;
    if (filters.pricing && resource.data.pricing !== filters.pricing) return false;
    if (filters.language && !resource.data.language.includes(filters.language)) return false;
    if (filters.difficulty && resource.data.difficulty !== filters.difficulty) return false;
    if (filters.status && resource.data.status !== filters.status) return false;
    return true;
  });
}

export function getResourceTags(resources: readonly ResourceEntry[]): string[] {
  return [...new Set(resources.flatMap((resource) => resource.data.tags))].sort((left, right) =>
    left.localeCompare(right, "zh-Hans-CN"),
  );
}
