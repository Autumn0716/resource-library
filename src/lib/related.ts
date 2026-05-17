import type { ResourceEntry } from "./resources";

function hasSharedLanguage(resource: ResourceEntry, candidate: ResourceEntry): boolean {
  const languages = new Set(resource.data.language);
  return candidate.data.language.some((language) => languages.has(language));
}

function scoreRelatedResource(resource: ResourceEntry, candidate: ResourceEntry): number {
  let score = 0;

  if (candidate.data.group === resource.data.group) score += 5;
  if (candidate.data.type === resource.data.type) score += 3;

  const resourceTags = new Set(resource.data.tags);
  for (const tag of candidate.data.tags) {
    if (resourceTags.has(tag)) score += 2;
  }

  if (candidate.data.pricing !== "unknown" && candidate.data.pricing === resource.data.pricing) score += 1;
  if (hasSharedLanguage(resource, candidate)) score += 1;
  if (candidate.data.difficulty !== "unknown" && candidate.data.difficulty === resource.data.difficulty) score += 1;

  return score;
}

export function getRelatedResources<T extends ResourceEntry>(resource: T, resources: readonly T[], limit = 6): T[] {
  return resources
    .filter((candidate) => candidate.id !== resource.id)
    .map((candidate) => ({ candidate, score: scoreRelatedResource(resource, candidate) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      const byScore = right.score - left.score;
      if (byScore !== 0) return byScore;
      return left.candidate.data.title.localeCompare(right.candidate.data.title, "zh-Hans-CN");
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
