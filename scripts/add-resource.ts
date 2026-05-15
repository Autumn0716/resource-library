#!/usr/bin/env bun
/**
 * Add a resource to `src/data/resources.json`.
 *
 * Modes:
 *   - No resource flags: launches the Ink TUI.
 *   - With resource flags: runs non-interactive batch mode for automation.
 */

import {
  GROUPS_FILE,
  RESOURCES_FILE,
  ROOT,
  buildResource,
  groupExists,
  resourceGroups,
  renderEntry,
  renderGroup,
  validateNewGroup,
  validateStatus,
  writeFlowResult,
  type FlowResult,
  type ResourceStatus,
} from "./add-resource-core";

interface CliOpts {
  name?: string;
  url?: string;
  group?: string;
  groupId?: string;
  groupDescription?: string;
  type?: string;
  use?: string;
  status?: string;
  skipFavicon: boolean;
  dryRun: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): CliOpts {
  const opts: CliOpts = { skipFavicon: false, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "-h":
      case "--help":
        opts.help = true;
        break;
      case "--skip-favicon":
        opts.skipFavicon = true;
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--name":
        opts.name = argv[++i];
        break;
      case "--url":
        opts.url = argv[++i];
        break;
      case "--group":
        opts.group = argv[++i];
        break;
      case "--group-id":
        opts.groupId = argv[++i];
        break;
      case "--group-description":
        opts.groupDescription = argv[++i];
        break;
      case "--type":
        opts.type = argv[++i];
        break;
      case "--use":
        opts.use = argv[++i];
        break;
      case "--status":
        opts.status = argv[++i];
        break;
      default:
        if (a.startsWith("--")) {
          console.error(`Unknown flag: ${a}`);
          process.exit(2);
        }
    }
  }
  return opts;
}

function hasResourceFlags(opts: CliOpts): boolean {
  return Boolean(
    opts.name ||
      opts.url ||
      opts.group ||
      opts.type ||
      opts.use ||
      opts.status ||
      opts.groupId ||
      opts.groupDescription,
  );
}

function printHelp() {
  console.log(`
Usage:
  bun scripts/add-resource.ts
  bun scripts/add-resource.ts --name "..." --url "..." --group "..." --type "..." --use "..." [--status pending] [--skip-favicon] [--dry-run]
  bun scripts/add-resource.ts --name "..." --url "..." --group "新分组" --group-id "new-group" --group-description "..." --type "..." --use "..."

Interactive mode:
  Starts a keyboard-driven TUI. Use arrow keys, Enter, Esc, and Ctrl+C.

Existing groups:
${resourceGroups.map((g) => `  · ${g.title}`).join("\n")}
`);
}

function batchFlow(opts: CliOpts): FlowResult {
  const missing: string[] = [];
  for (const k of ["name", "url", "group", "type", "use"] as const) {
    if (!opts[k]) missing.push(`--${k}`);
  }
  if (missing.length) {
    throw new Error(`Missing required flag(s): ${missing.join(", ")}. Try --help.`);
  }

  const status = validateStatus(opts.status ?? "curated") as ResourceStatus;
  let group = undefined;
  if (!groupExists(opts.group!)) {
    const groupMissing: string[] = [];
    if (!opts.groupId) groupMissing.push("--group-id");
    if (!opts.groupDescription) groupMissing.push("--group-description");
    if (groupMissing.length) {
      throw new Error(
        `Group "${opts.group}" does not exist. To create it, add ${groupMissing.join(" and ")}.\nKnown groups:\n${resourceGroups.map((g) => "  · " + g.title).join("\n")}`,
      );
    }
    group = validateNewGroup(opts.group!, opts.groupId!, opts.groupDescription!);
  } else if (opts.groupId || opts.groupDescription) {
    throw new Error(`Group "${opts.group}" already exists. Only pass --group-id/--group-description when creating a new group.`);
  }

  const resource = buildResource({
    name: opts.name!,
    url: opts.url!,
    group: opts.group!,
    type: opts.type!,
    use: opts.use!,
    status,
  });

  return { resource, group };
}

function printResultPreview(result: FlowResult) {
  if (result.group) {
    console.log("\n--- New group ---");
    console.log(renderGroup(result.group));
    console.log("-----------------");
  }

  console.log("\n--- New entry ---");
  console.log(renderEntry(result.resource));
  console.log("-----------------");
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return;
  }

  if (!hasResourceFlags(opts)) {
    const { runAddResourceTui } = await import("./add-resource-tui");
    await runAddResourceTui({
      dryRun: opts.dryRun,
      skipFavicon: opts.skipFavicon,
    });
    return;
  }

  const result = batchFlow(opts);
  printResultPreview(result);

  if (opts.dryRun) {
    console.log("\n[dry-run] No files written, no favicon fetched.");
    return;
  }

  await writeFlowResult(result, {
    dryRun: false,
    skipFavicon: opts.skipFavicon,
  });

  console.log(`\nNext:`);
  console.log(`  1. Review changes:   git diff ${GROUPS_FILE.replace(ROOT, "")} ${RESOURCES_FILE.replace(ROOT, "")}`);
  console.log(`  2. Build & preview:  bun run build && bun run preview`);
  console.log(`  3. Commit & deploy when happy.\n`);
}

main().catch((err) => {
  console.error(`\n✗ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
