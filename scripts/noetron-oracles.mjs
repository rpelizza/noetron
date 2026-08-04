// Structural oracles for the harness itself.
//
// The sync script keeps the copies honest. This module keeps the *promises*
// honest, and it exists because of a measured failure mode: seven times across
// three rounds, a field, a section, or a node was declared in one file and
// never executed anywhere. `commits`, `review: combined`, `learnings.md`,
// `verification-standard.md`, `status: active`, `phase:`, and the `branch` node
// on the slice loop — each had readers, none had a writer, and not one was
// caught by whoever wrote it. Human vigilance did not scale; three of them were
// found only by an adversarial audit, and one survived a whole round.
//
// So the family becomes an oracle. Three checks, each falsifiable, each keyed
// to a promise the harness already makes in its own prose:
//
//   1. writer symmetry  — every row of state.md's writer table names a skill
//                         that actually instructs the write.
//   2. graph integrity  — every node label in the router's diagram resolves to
//                         a skill and a route row, every skill has a row, and
//                         every drawn edge is instructed by its source node.
//   3. documentation    — every skill under the source root appears in the
//                         README's skill table. Source repository only.
//
// A check here reports; it never rewrites. The harness's own rule applies to
// its tooling: fix the output, never the standard.

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

/** Gates are ratification points, not skills; terminals end a chain. */
const GATE_LABELS = new Set(['G0', 'G1', 'G2']);
const TERMINAL_LABELS = new Set(['answer', 'next slice']);

/** The chain names that open each diagram line — labels of rows, not nodes. */
const CHAIN_NAMES = ['read-only', 'trivial', 'small', 'standard', 'large', 'bug'];

const rel = (root, path) => relative(root, path).split(sep).join('/');

async function walkMd(dir) {
  if (!existsSync(dir)) return [];
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walkMd(full)));
    else if (entry.name.endsWith('.md')) found.push(full);
  }
  return found.sort();
}

/** Every markdown byte a skill owns — SKILL.md plus its references and assets. */
async function skillText(sourceRoot, name) {
  const files = await walkMd(join(sourceRoot, name));
  const parts = await Promise.all(files.map((f) => readFile(f, 'utf8')));
  return parts.join('\n');
}

/**
 * The body of a heading's section: everything until a heading of the same level
 * or shallower. Used to bound a table to the promise it belongs to.
 */
function sectionOf(text, heading) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.trim() === heading);
  if (start === -1) return null;
  const level = heading.match(/^#+/)[0].length;
  const body = [];
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#+)\s/);
    if (m && m[1].length <= level) break;
    body.push(lines[i]);
  }
  return body.join('\n');
}

/** Every markdown table in `text`, as arrays of data rows of trimmed cells. */
function tablesIn(text) {
  const lines = text.split('\n');
  const tables = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim().startsWith('|')) continue;
    const next = lines[i + 1] ?? '';
    if (!/^\s*\|[\s:|-]+\|\s*$/.test(next)) continue;

    const header = splitRow(lines[i]);
    const rows = [];
    let j = i + 2;
    for (; j < lines.length && lines[j].trim().startsWith('|'); j++) {
      rows.push(splitRow(lines[j]));
    }
    tables.push({ header, rows });
    i = j;
  }
  return tables;
}

function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

/** The fenced ```text block that draws the chains. */
function fencedBlock(text, lang = 'text') {
  const match = text.match(new RegExp('```' + lang + '\\n([\\s\\S]*?)```'));
  return match ? match[1] : null;
}

const backticked = (cell) => [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

/**
 * A field name written as a template — `Task N: complete`, `slice: <k+1>` — is
 * not the string the skill contains. Placeholders become wildcards so the check
 * asks "is this field instructed?" and not "did two authors pick the same
 * metavariable?". Everything else stays literal: a wildcard that swallowed the
 * field name would make the check pass on any file.
 */
const PLACEHOLDER = /<[^>]*>|(?<![\w<])[Nn](?![\w>])|(?<![\w<])k(?:\+1)?(?![\w>])/g;
const WILDCARD = '[^\\n|]{1,24}';

// One pass, literals escaped between placeholders. Escaping first and
// substituting after looked equivalent and was not: the `\n` inside an inserted
// `[^\n|]` matched the metavariable rule on the next pass and was replaced in
// turn, yielding a regex that matched almost anything. A silent always-pass is
// the one failure mode this whole module exists to prevent, so it is worth the
// extra function.
const escapeLiteral = (s) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');

function fieldPattern(token, { anchored = false } = {}) {
  let pattern = '';
  let last = 0;
  for (const match of token.matchAll(PLACEHOLDER)) {
    pattern += escapeLiteral(token.slice(last, match.index)) + WILDCARD;
    last = match.index + match[0].length;
  }
  return new RegExp((anchored ? '^' : '') + pattern + escapeLiteral(token.slice(last)), 'i');
}

/**
 * Which population a name belongs to — a front-matter key, a section heading, or
 * a ledger line. Items are only ever matched against tokens of their own shape:
 * unclassified matching let the ledger line `Task 3: in progress` be "covered"
 * by the front-matter key `task`, case-insensitively and unanchored, so the
 * defect an auditor found by hand still passed the check written to catch it.
 */
// Case-sensitive, and the space is load-bearing: `/^Task\b/i` also matched the
// front-matter key `task`, filed it under ledger lines, and `^task` then covered
// every `Task N: …` there is. Two bugs in this matcher now, both of them a
// silent always-pass, both caught by the mutation check rather than by reading.
function shapeOf(name) {
  if (/^##\s/.test(name)) return 'section';
  if (/^(?:Task\s|Change:|Slice\s)/.test(name)) return 'ledger';
  if (/^[a-z][a-z0-9_-]*(?::|$)/.test(name)) return 'key';
  return 'other';
}

/**
 * The fields the template actually shows: front-matter keys, section headings,
 * and the ledger's own line shapes. This is the population the writer table is
 * supposed to cover — reading it from the format block rather than from the
 * table is the whole point, since a table cannot notice its own omission.
 */
function fieldsInFormat(text) {
  const found = [];
  const add = (name, shape) => found.some((f) => f.name === name) || found.push({ name, shape });

  for (const block of text.matchAll(/```markdown\n([\s\S]*?)```/g)) {
    let inLedger = false;
    for (const line of block[1].split('\n')) {
      const heading = line.match(/^##\s+(.+?)\s*$/);
      if (heading) {
        // A ledger line is one written under the ledger heading — position, not
        // prefix. Keying off `Task ` was already too narrow the day it was
        // written: the fix loop runs on short chains and on a delivery's final
        // review, neither of which has a task number, so `Change: in progress`
        // and `Slice <k> review: fix round <k>/5` are ledger lines that no
        // `Task`-shaped matcher would ever see.
        inLedger = /^##\s+Ledger\b/.test(line);
        add(`## ${heading[1]}`, 'section');
        continue;
      }

      const bullet = line.match(/^\s*-\s+(\S.*?)\s*$/);
      if (inLedger && bullet) { add(bullet[1], 'ledger'); continue; }
      if (bullet) continue;

      const key = line.match(/^([a-z][a-z0-9_-]*):/);
      if (key) add(key[1], 'key');
    }
  }
  return found;
}

/**
 * ORACLE 1 — writer symmetry, in both directions.
 *
 * `state.md` carries a table whose whole purpose is that a field cannot enter
 * the harness without the skill that writes it. The table itself was audited by
 * hand exactly once. This is that audit, run every time.
 *
 * Both directions, because the first version of this check only ran one and an
 * auditor found the hole within the hour: a table → skill sweep proves every
 * row is executed and says nothing about a field the template shows and the
 * table forgot. `Task N: in progress` sat in the format block with no row, no
 * writer, and full deniability — the canonical shape of the defect, hiding in
 * the blind spot of the check built to catch it.
 */
export async function checkWriterSymmetry({ root, sourceRoot, skills }) {
  const problems = [];
  const file = join(sourceRoot, 'noetron-setup', 'references', 'state.md');
  if (!existsSync(file)) return problems;

  const where = rel(root, file);
  const text = await readFile(file, 'utf8');
  const section = sectionOf(text, '## Every field has a writer');
  if (section === null) {
    problems.push(`${where}: the "Every field has a writer" section is gone — ` +
      'the writer table is the only thing standing between a declared field and a dead one');
    return problems;
  }

  const [table] = tablesIn(section);
  if (!table || !table.rows.length) {
    problems.push(`${where}: "Every field has a writer" carries no table`);
    return problems;
  }

  const known = new Set(skills);
  const cache = new Map();

  for (const row of table.rows) {
    const [fieldCell, writerCell] = row;
    const fields = backticked(fieldCell);
    const writers = [...writerCell.matchAll(/`(noetron-[a-z0-9-]+)`/g)].map((m) => m[1]);

    if (!fields.length) {
      problems.push(`${where}: writer row "${fieldCell}" names no field in backticks`);
      continue;
    }
    if (!writers.length) {
      problems.push(
        `writer missing: ${fields[0]} (${where}) names no skill that writes it — ` +
          'a field with no writer is a defect in the harness, not a blank someone forgot to fill',
      );
      continue;
    }

    for (const writer of writers) {
      if (!known.has(writer)) {
        problems.push(`writer missing: ${fields[0]} (${where}) names ${writer}, which does not exist`);
        continue;
      }
      if (!cache.has(writer)) cache.set(writer, await skillText(sourceRoot, writer));
      const text = cache.get(writer);
      const instructed = fields.some((f) => fieldPattern(f).test(text));
      if (!instructed) {
        problems.push(
          `writer silent: ${writer} is named as the writer of ${fields.map((f) => `\`${f}\``).join(', ')} ` +
            `(${where}) but never mentions it — the row is a promise no skill executes`,
        );
      }
    }
  }

  // The other direction. A table cannot notice its own omission, so the
  // population comes from the format block instead: anything the template shows
  // a session it must have a row, or it has no writer by construction.
  const listed = table.rows.flatMap((row) => backticked(row[0] ?? ''));
  const listedKeys = new Set(
    listed.map((t) => (t.match(/^([a-z][a-z0-9_-]*)(?::|$)/) ?? [])[1]).filter(Boolean),
  );

  for (const { name, shape } of fieldsInFormat(text)) {
    const covered = shape === 'key'
      ? listedKeys.has(name)
      : listed
        .filter((token) => shapeOf(token) === shape)
        .some((token) => fieldPattern(token, { anchored: true }).test(name));
    if (!covered) {
      problems.push(
        `field unlisted: \`${name}\` appears in the state.md format block and has no row in the ` +
          `writer table (${where}) — the template shows it to every session that opens the file, ` +
          'so it reads as a blank someone forgot to fill rather than a field nobody writes',
      );
    }
  }
  return problems;
}

/**
 * Turns one diagram line into its labels and its directed edges.
 *
 * Box-drawing characters carry the loop's return edge across two lines, so they
 * are erased and the edge that matters is recovered from the edge table below
 * — which is markdown, and says the same thing without the ASCII.
 */
function parseDiagramLine(raw) {
  let line = raw.replace(/[┌└┐┘├┤│]/g, ' ');
  const chain = CHAIN_NAMES.find((c) => line.trim().startsWith(c + ' '));
  if (chain) line = line.trim().slice(chain.length);

  const parts = line.split(/(═G\d═►|─+►|►|◄─+|◄)/);
  const labels = [];
  const edges = [];

  for (let i = 0; i < parts.length; i += 2) {
    labels.push(cleanLabel(parts[i]));
  }
  for (let i = 1; i < parts.length; i += 2) {
    const left = labels[(i - 1) / 2];
    const right = labels[(i + 1) / 2];
    if (!left || !right) continue;
    edges.push(parts[i].includes('◄') ? [right, left] : [left, right]);
  }
  return { labels: labels.filter(Boolean), edges };
}

function cleanLabel(raw) {
  return raw.replace(/[─═►◄]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * A label is a node when it resolves to a skill, bare or with its mode in
 * parentheses. Anything longer than two words is prose annotating an edge —
 * "re-enter as standard", "size ≥ standard (...)" — and annotations are not
 * routed. That leaves exactly the case that bit us: a single short word that
 * looks like a node and names nothing. `implement` lived in this graph for a
 * round before anyone noticed there was no skill behind it.
 */
function classifyLabel(label, known) {
  if (GATE_LABELS.has(label)) return { kind: 'gate' };
  if (TERMINAL_LABELS.has(label)) return { kind: 'terminal' };

  const bare = label.replace(/\s*\([^)]*\)\s*$/, '').trim();
  for (const candidate of [label, bare]) {
    if (known.has(`noetron-${candidate}`)) return { kind: 'node', skill: `noetron-${candidate}` };
  }
  if (label.split(/\s+/).length > 2 || /[,;≥]/.test(label)) return { kind: 'annotation' };
  return { kind: 'unknown' };
}

/** The skills a free-text edge cell names, e.g. "slice k finish" → noetron-finish. */
function skillsNamedIn(cell, known) {
  const found = [];
  for (const word of cell.replace(/[`*]/g, ' ').split(/[^a-z0-9-]+/i)) {
    const name = `noetron-${word.toLowerCase()}`;
    if (known.has(name) && !found.includes(name)) found.push(name);
  }
  return found;
}

/**
 * ORACLE 2 — graph integrity.
 *
 * The router opens with an EXTREMELY-IMPORTANT block promising that every node
 * label resolves to a route row, every skill has exactly one row, and a route
 * and its node are born together. Nothing was checking any of it. The second
 * sub-form of the defect family lives here: a node drawn in the graph that the
 * path never passes through, which is how slice 2's commits were going to land
 * on `main`.
 */
export async function checkGraphIntegrity({ root, sourceRoot, skills }) {
  const problems = [];
  const file = join(sourceRoot, 'noetron-router', 'SKILL.md');
  if (!existsSync(file)) return problems;

  const where = rel(root, file);
  const text = await readFile(file, 'utf8');
  const known = new Set(skills);

  // --- the drawn graph -----------------------------------------------------
  const assemble = sectionOf(text, '## 2. ASSEMBLE — the chains');
  const diagram = assemble && fencedBlock(assemble);
  const drawn = new Set();
  const edges = [];

  if (!diagram) {
    problems.push(`${where}: § ASSEMBLE has no chain diagram to check`);
  } else {
    for (const line of diagram.split('\n')) {
      const { labels, edges: lineEdges } = parseDiagramLine(line);
      for (const label of labels) {
        const verdict = classifyLabel(label, known);
        if (verdict.kind === 'unknown') {
          problems.push(
            `graph label unresolved: "${label}" appears in the chain diagram (${where}) ` +
              'but names no skill — a router that points at a skill that does not exist is a router that lies',
          );
        }
        if (verdict.kind === 'node') drawn.add(verdict.skill);
      }
      for (const [from, to] of lineEdges) {
        const a = classifyLabel(from, known);
        const b = classifyLabel(to, known);
        if (a.kind === 'node' && b.kind === 'node') edges.push([a.skill, b.skill]);
      }
    }

    // The edge table states the loop's return edge that the ASCII cannot.
    const edgeTable = tablesIn(assemble).find((t) => /edge/i.test(t.header[0] ?? ''));
    if (!edgeTable) {
      problems.push(`${where}: § ASSEMBLE has no edge table — the loop's return edge is drawn only in ASCII`);
    } else {
      for (const [edgeCell] of edgeTable.rows) {
        const [leftCell, rightCell] = edgeCell.split(/[→>]\s|→/).length >= 2
          ? edgeCell.split('→')
          : [edgeCell, ''];
        const from = skillsNamedIn(leftCell, known).at(-1);
        const to = skillsNamedIn(rightCell, known)[0];
        if (from && to && from !== to) edges.push([from, to]);
      }
    }
  }

  // --- every drawn edge is instructed by its source -------------------------
  const cache = new Map();
  const seen = new Set();
  for (const [from, to] of edges) {
    const key = `${from}->${to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!cache.has(from)) cache.set(from, await skillText(sourceRoot, from));
    if (!cache.get(from).includes(to)) {
      problems.push(
        `edge not instructed: the graph draws ${from} ──► ${to}, but ${from} never names ${to} — ` +
          'the node is drawn and the path does not pass through it',
      );
    }
  }

  // --- every skill has exactly one route row -------------------------------
  const routeRows = [];
  for (const heading of ['### Node routes', '### Overlay routes']) {
    const section = sectionOf(text, heading);
    if (section === null) {
      problems.push(`${where}: "${heading}" is missing`);
      continue;
    }
    for (const table of tablesIn(section)) routeRows.push(...table.rows.map((r) => r.join(' | ')));
  }

  for (const skill of skills) {
    const rows = routeRows.filter((r) => r.includes(skill));
    if (!rows.length) {
      problems.push(
        `route missing: ${skill} exists under .claude/skills/ but has no row in the routes tables ` +
          `(${where}) — a route and its node are born together`,
      );
    } else if (rows.length > 1) {
      problems.push(
        `route ambiguous: ${skill} appears in ${rows.length} route rows (${where}); ` +
          'every skill belongs to exactly one',
      );
    }
    if (drawn.size && !drawn.has(skill) && !routeRows.some((r) => r.includes(skill))) {
      continue; // already reported above
    }
  }
  return problems;
}

/**
 * ORACLE 3 — the skill is documented.
 *
 * `noetron-recovery` shipped, routed, and ran for a whole round while the
 * README's skill table did not know it existed. A reader deciding whether to
 * adopt the harness reads that table, not the skill root.
 *
 * Source repository only: a consumer's README documents their project.
 */
export async function checkSkillDocumentation({ root, skills }) {
  const problems = [];
  const file = join(root, 'README.md');
  if (!existsSync(file)) return problems;

  const text = await readFile(file, 'utf8');
  if (!text.includes('noetron:source-repo')) return problems;

  const table = tablesIn(text).find((t) =>
    t.rows.some((r) => /`noetron-[a-z0-9-]+`/.test(r[0] ?? '')),
  );
  if (!table) {
    problems.push('README.md: no skill table found — the harness documents every skill it ships');
    return problems;
  }

  const documented = new Set(
    table.rows.flatMap((r) => [...(r[0] ?? '').matchAll(/`(noetron-[a-z0-9-]+)`/g)].map((m) => m[1])),
  );
  for (const skill of skills) {
    if (!documented.has(skill)) {
      problems.push(
        `undocumented skill: ${skill} ships under .claude/skills/ but has no row in the README's ` +
          'skill table — it existed for a round before anyone noticed the last one',
      );
    }
  }
  for (const name of documented) {
    if (!skills.includes(name)) {
      problems.push(`README.md documents ${name}, which does not exist under .claude/skills/`);
    }
  }
  return problems;
}

export async function runOracles(context) {
  return [
    ...(await checkWriterSymmetry(context)),
    ...(await checkGraphIntegrity(context)),
    ...(await checkSkillDocumentation(context)),
  ];
}
