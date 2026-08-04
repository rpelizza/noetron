#!/usr/bin/env node
// Mutation check for the structural oracles.
//
//   node scripts/oracles.test.mjs
//
// The oracles in noetron-oracles.mjs exist because seven declared-but-unexecuted
// promises shipped across three rounds. This file exists because of the eighth,
// which was in the oracle itself: a first draft of the field matcher escaped the
// pattern and then substituted metavariables into the escaped string, so the
// `\n` inside an inserted character class was itself treated as a metavariable
// and replaced. The regex still compiled. It still ran on every file. It matched
// almost anything, and the check went green on a field no skill wrote.
//
// A check that cannot fail is the exact thing this harness calls a false oracle,
// and it does not stop being one because it is the checker. So the checker gets
// a checker: reintroduce each defect of the family into a throwaway copy of the
// repository and assert that `--check` names it. Runs in seconds, zero deps.

import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Each mutation names the field defect it revives. `edit` must change the file:
 * a mutation that silently fails to apply is a test that always passes, which is
 * the failure mode one level up from the one being tested.
 *
 * Every path is resolved against the sandbox, never against ROOT — a mutation
 * pointed at the real tree edits the repository under the author, and the first
 * draft of this file did exactly that to README.md.
 */
const SKILLS = (sandbox) => join(sandbox, '.claude', 'skills');

const MUTATIONS = (sandbox) => [
  {
    defect: 'a node drawn with no skill behind it — the `implement` label',
    file: join(SKILLS(sandbox), 'noetron-router', 'SKILL.md'),
    edit: (t) => t.replace('G0 ──► branch ──► execute', 'G0 ──► branch ──► implement'),
    expect: /graph label unresolved: "implement"/,
  },
  {
    defect: 'a skill that ships without a row in the README — `noetron-recovery`',
    file: join(sandbox, 'README.md'),
    edit: (t) => t.replace(/^\| `noetron-recovery` \|.*$/m, ''),
    expect: /undocumented skill: noetron-recovery/,
  },
  {
    defect: 'a skill the routes tables cannot reach',
    file: join(SKILLS(sandbox), 'noetron-router', 'SKILL.md'),
    edit: (t) => t.replace(/^\| A bug, test failure.*$/m, ''),
    expect: /route missing: noetron-debug/,
  },
  {
    defect: 'a declared writer that never writes — the `learnings.md` shape',
    file: join(SKILLS(sandbox), 'noetron-finish', 'SKILL.md'),
    edit: (t) => t.replaceAll('## Delivered', '## Shipped things'),
    expect: /writer silent: noetron-finish[\s\S]*?Delivered/,
  },
  {
    defect: 'a new field whose named writer is silent — the `commits` shape',
    file: join(SKILLS(sandbox), 'noetron-setup', 'references', 'state.md'),
    edit: (t) => t.replace(
      '| `## Next` |',
      '| `retro: <path>` | `noetron-review` | at closeout |\n| `## Next` |',
    ),
    expect: /writer silent: noetron-review[\s\S]*?retro/,
  },
  {
    defect: 'a field with readers and no writer at all — the `phase:` shape',
    file: join(SKILLS(sandbox), 'noetron-setup', 'references', 'state.md'),
    edit: (t) => t.replace('| `## Next` |', '| `budget: <n>` |  | at closeout |\n| `## Next` |'),
    expect: /writer missing: budget/,
  },
  {
    defect: 'a field the template shows and the writer table forgot — the `in progress` shape',
    file: join(SKILLS(sandbox), 'noetron-setup', 'references', 'state.md'),
    edit: (t) => t.replace('plan: <relative path or none>', 'budget: <n>\nplan: <relative path or none>'),
    expect: /field unlisted: `budget`/,
  },
  {
    // Not `Task`-shaped on purpose: the fix loop also runs on short chains and
    // on a delivery's final review, so the ledger carries subjects with no task
    // number. A matcher keyed to the `Task` prefix cannot see those at all.
    defect: 'a ledger line whose subject is not a task, and which no row covers',
    file: join(SKILLS(sandbox), 'noetron-setup', 'references', 'state.md'),
    edit: (t) => t.replace('- Task 2: complete', '- Task 2: complete\n- Rollback: pending'),
    expect: /field unlisted: `Rollback: pending`/,
  },
  {
    defect: 'a drawn edge the source node never instructs — the `branch` shape',
    file: join(SKILLS(sandbox), 'noetron-plan', 'SKILL.md'),
    edit: (t) => t.replaceAll('noetron-spec', 'the spec skill'),
    expect: /edge not instructed: the graph draws noetron-plan ──► noetron-spec/,
  },
];

/** The check's own output, whether it passed or failed. */
function runCheck(cwd) {
  try {
    return execFileSync('node', [join(cwd, 'scripts', 'sync-noetron.mjs'), '--check'], {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    return `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
}

async function main() {
  const sandbox = await mkdtemp(join(tmpdir(), 'noetron-mutation-'));
  try {
    for (const path of ['.claude', 'scripts', 'README.md', 'CLAUDE.md']) {
      await cp(join(ROOT, path), join(sandbox, path), { recursive: true });
    }
    // Materialize the mirrors once so that only the mutation moves the needle.
    // A non-zero exit here means the harness already has a real problem; the
    // baseline gate below reports it properly, so do not die on the spawn.
    try {
      execFileSync('node', [join(sandbox, 'scripts', 'sync-noetron.mjs')], {
        cwd: sandbox, stdio: 'ignore',
      });
    } catch { /* reported by the baseline gate */ }

    const baseline = runCheck(sandbox);
    if (!/check OK/.test(baseline)) {
      console.error('mutation check ABORTED — the unmutated harness already fails:\n');
      console.error(baseline);
      process.exit(1);
    }

    let missed = 0;

    for (const mutation of MUTATIONS(sandbox)) {
      const original = await readFile(mutation.file, 'utf8');
      const mutated = mutation.edit(original);

      if (mutated === original) {
        console.log(`  STALE   ${mutation.defect}`);
        console.log('          the anchor text moved — this mutation tested nothing');
        missed++;
        continue;
      }

      await writeFile(mutation.file, mutated);
      const output = runCheck(sandbox);
      await writeFile(mutation.file, original);

      if (mutation.expect.test(output)) {
        console.log(`  CAUGHT  ${mutation.defect}`);
      } else {
        missed++;
        console.log(`  MISSED  ${mutation.defect}`);
        for (const line of output.split('\n').filter((l) => l.startsWith('  - '))) {
          console.log(`          reported instead:${line.slice(3)}`);
        }
      }
    }

    const total = MUTATIONS(sandbox).length;
    console.log(`\n${total - missed}/${total} mutations caught.`);
    process.exit(missed ? 1 : 0);
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`mutation check failed to run: ${error.message}`);
  process.exit(1);
});
