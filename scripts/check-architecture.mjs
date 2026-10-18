import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
const root = path.resolve("src");
function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(file)
      : /(?<!\.d)\.tsx?$/.test(file)
        ? [file]
        : [];
  });
}
const modules = sourceFiles(root);
const dependencies = new Map();
for (const file of modules) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const targets = [];
  for (const node of source.statements) {
    if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node))
      continue;
    const specifier = node.moduleSpecifier;
    if (
      !specifier ||
      !ts.isStringLiteral(specifier) ||
      (!specifier.text.startsWith(".") && !specifier.text.startsWith("@/"))
    )
      continue;
    const base = specifier.text.startsWith("@/")
      ? path.resolve(root, specifier.text.slice(2))
      : path.resolve(path.dirname(file), specifier.text);
    const target = [
      base + ".ts",
      base + ".tsx",
      path.join(base, "index.ts"),
      path.join(base, "index.tsx"),
    ].find(existsSync);
    if (target) targets.push(target);
  }
  dependencies.set(file, targets);
}
const relative = (file) => path.relative(root, file).split(path.sep).join("/");
{
  const violations = [];
  for (const [file, targets] of dependencies) {
    const from = relative(file);
    for (const target of targets) {
      const to = relative(target);
      if (
        (from.startsWith("components/") && to.startsWith("screens/")) ||
        (from.startsWith("domain/") && !/^(domain|types|utils)\//.test(to)) ||
        (from.startsWith("store/") &&
          /^(screens|components|navigation|bootstrap)\//.test(to))
      )
        violations.push(`${from} imports ${to}`);
    }
    if (
      from.startsWith("domain/") &&
      /from\s+["'](?:react(?:-native)?|zustand)["']/.test(
        readFileSync(file, "utf8"),
      )
    )
      violations.push(`${from} depends on UI or state libraries`);
  }
  assert.deepEqual(violations, [], "Module boundary violations");
}
{
  const visited = new Set();
  const active = [];
  const cycles = [];
  function visit(file) {
    const index = active.indexOf(file);
    if (index !== -1) {
      cycles.push([...active.slice(index), file].map(relative).join(" → "));
      return;
    }
    if (visited.has(file)) return;
    active.push(file);
    for (const target of dependencies.get(file) ?? []) visit(target);
    active.pop();
    visited.add(file);
  }
  modules.forEach(visit);
  assert.deepEqual(cycles, [], "Circular module imports");
}

console.log(
  `Checked ${modules.length} source modules: boundaries and circular imports passed.`,
);
