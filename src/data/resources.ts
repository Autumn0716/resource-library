/**
 * Type definitions and re-exports for the resource catalog.
 *
 * Data lives in `resources.json` and `groups.json` (easy to edit by hand,
 * by `scripts/add-resource.ts`, and by the GitHub Action that turns accepted
 * issue submissions into PRs).
 *
 * Do NOT add new entries to this file — add them to the JSON files instead.
 */

import resourcesData from "./resources.json";
import groupsData from "./groups.json";

export type ResourceStatus = "curated" | "pending";

export interface ResourceGroup {
  id: string;
  title: string;
  description: string;
}

export interface Resource {
  id: string;
  name: string;
  url: string;
  group: string;
  type: string;
  use: string;
  status: ResourceStatus;
}

export type EngineeringAngle = readonly [string, string, string];

export const resourceGroups: ResourceGroup[] = groupsData as ResourceGroup[];
export const resources: Resource[] = resourcesData as Resource[];
