export interface GroupData {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  order: number;
  featured: boolean;
  legacyTitle?: string;
}

export interface GroupEntry {
  id: string;
  data: GroupData;
}

export function sortGroups<T extends GroupEntry>(groups: readonly T[]): T[] {
  return [...groups].sort((left, right) => {
    const byOrder = left.data.order - right.data.order;
    if (byOrder !== 0) return byOrder;
    return left.data.name.localeCompare(right.data.name, "zh-Hans-CN");
  });
}

export function getGroupBySlug<T extends GroupEntry>(groups: readonly T[], slug: string): T | undefined {
  return groups.find((group) => group.id === slug);
}
