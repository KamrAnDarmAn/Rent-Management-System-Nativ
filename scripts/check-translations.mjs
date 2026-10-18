import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve("src");
const resources = new Map();
function loadResource(file, name) {
  const cacheKey = `${file}:${name}`;
  if (resources.has(cacheKey)) return resources.get(cacheKey);
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const imports = new Map();
  let object;
  for (const node of source.statements) {
    if (
      ts.isImportDeclaration(node) &&
      node.importClause?.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings)
    ) {
      for (const item of node.importClause.namedBindings.elements)
        imports.set(item.name.text, {
          file: path.resolve(
            path.dirname(file),
            node.moduleSpecifier.text + ".ts",
          ),
          name: (item.propertyName ?? item.name).text,
        });
    }
    if (ts.isVariableStatement(node))
      for (const item of node.declarationList.declarations)
        if (
          item.name.getText(source) === name &&
          item.initializer &&
          ts.isObjectLiteralExpression(item.initializer)
        )
          object = item.initializer;
  }
  assert(object, `Missing locale resource: ${cacheKey}`);
  const result = {};
  for (const property of object.properties) {
    if (ts.isSpreadAssignment(property)) {
      const target = imports.get(property.expression.getText(source));
      assert(target, `Unknown locale spread in ${file}`);
      Object.assign(result, loadResource(target.file, target.name));
    } else if (
      ts.isPropertyAssignment(property) &&
      ts.isStringLiteral(property.initializer)
    )
      result[property.name.text] = property.initializer.text;
  }
  resources.set(cacheKey, result);
  return result;
}
const ps = loadResource(path.join(root, "i18n/locales/ps.ts"), "ps");
const keys = new Set(Object.keys(ps).map((key) => key.toLowerCase()));
const violations = [];
const tokens = (value) =>
  [...value.matchAll(/{{\s*(\w+)\s*}}/g)].map((match) => match[1]).sort();
for (const [key, value] of Object.entries(ps)) {
  assert.deepEqual(
    tokens(value),
    tokens(key),
    `Translation placeholders differ: ${key}`,
  );
  if (/[A-Za-z]/.test(value.replace(/{{.*?}}/g, "")))
    violations.push(`English in Pashto translation: ${key}`);
}
function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(file)
      : /\.tsx?$/.test(file)
        ? [file]
        : [];
  });
}
const props = new Set([
  "title",
  "label",
  "subtitle",
  "text",
  "helper",
  "placeholder",
  "error",
  "accessibilityLabel",
  "detail",
  "description",
  "action",
  "group",
]);
let checked = 0;
function check(value, file) {
  const key = value.replace(/\s+/g, " ").trim();
  if (!/[A-Za-z]/.test(key) || /^#[a-f\d]{3,8}$/i.test(key)) return;
  checked++;
  if (!keys.has(key.toLowerCase()))
    violations.push(`Missing Pashto: ${key} (${path.relative(root, file)})`);
}
function staticCopy(node, file) {
  if (!node) return;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    check(node.text, file);
  else if (ts.isJsxExpression(node)) staticCopy(node.expression, file);
  else if (ts.isConditionalExpression(node)) {
    staticCopy(node.whenTrue, file);
    staticCopy(node.whenFalse, file);
  }
}
for (const file of sourceFiles(root).filter(
  (file) => !file.includes(`${path.sep}i18n${path.sep}`),
)) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  function visit(node) {
    if (ts.isJsxText(node)) check(node.text, file);
    if (ts.isJsxAttribute(node) && props.has(node.name.text))
      staticCopy(node.initializer, file);
    if (ts.isPropertyAssignment(node) && props.has(node.name.text))
      staticCopy(node.initializer, file);
    if (
      ts.isCallExpression(node) &&
      ["notify", "t"].includes(node.expression.getText(source))
    )
      staticCopy(node.arguments[0], file);
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      node.left.getText(source).startsWith("nextErrors.")
    )
      staticCopy(node.right, file);
    ts.forEachChild(node, visit);
  }
  visit(source);
}
assert.deepEqual(
  [...new Set(violations)],
  [],
  "Pashto translation coverage failed",
);
console.log(
  `Checked ${checked} app strings and ${Object.keys(ps).length} Pashto translations: coverage and placeholders passed.`,
);
