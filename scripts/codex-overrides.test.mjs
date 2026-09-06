import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { loadCodexOverrides, sourceDigest } from "./codex-overrides.mjs";

const scripts = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = "./skills/engineering/research";
const original = '---\nname: research\ndescription: "Original research"\n---\nOriginal workflow.\n';
const adapted = '---\nname: research\ndescription: "Investigate a substantial question with primary sources."\n---\nAdapted workflow with /research as a literal skill reference.\n';

function fixture(t) {
  const tempParent = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(tempParent, "codex-overrides-test-"));
  t.after(() => {
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), tempParent);
    assert.ok(path.basename(resolved).startsWith("codex-overrides-test-"));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const write = (relative, contents) => {
    const dest = path.join(root, relative);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, contents);
  };
  write(`${sourcePath}/SKILL.md`, original);
  write(`${sourcePath}/reference.txt`, "Supporting resource\n");
  write("codex/overrides/research/SKILL.md", adapted);
  write("codex/invocation.json", JSON.stringify({ manualOnly: [] }));
  write("codex/overrides/manifest.json", JSON.stringify({ research: { source: sourcePath, sha256: sourceDigest(original) } }));
  write(".claude-plugin/plugin.json", JSON.stringify({ skills: [sourcePath] }));
  write("package.json", JSON.stringify({ version: "1.0.0", license: "MIT" }));
  const run = (script) => {
    const result = spawnSync(process.execPath, [path.join(scripts, script)], { cwd: root, encoding: "utf8" });
    assert.ifError(result.error);
    return { status: result.status, output: result.stdout + result.stderr };
  };
  return { root, write, run };
}

test("override detects upstream drift but accepts checkout newline conversion", (t) => {
  const { root, write } = fixture(t);
  assert.equal(loadCodexOverrides(root, [sourcePath]).get(sourcePath), adapted);
  write(`${sourcePath}/SKILL.md`, original.replace(/\n/g, "\r\n"));
  assert.equal(loadCodexOverrides(root, [sourcePath]).get(sourcePath), adapted);
  write(`${sourcePath}/SKILL.md`, original + "Changed upstream behavior.\n");
  assert.throws(() => loadCodexOverrides(root, [sourcePath]), /Upstream SKILL.md changed/);
});

test("unregistered or removed source skills cannot silently ship overrides", (t) => {
  const { root } = fixture(t);
  assert.throws(() => loadCodexOverrides(root, []), /Invalid Codex override source/);
  fs.mkdirSync(path.join(root, "codex/overrides/orphan"));
  assert.throws(() => loadCodexOverrides(root, [sourcePath]), /Unregistered Codex override/);
});

test("personal invocation setting changes policy without rewriting the skill", (t) => {
  const { root, write, run } = fixture(t);
  assert.equal(run("build-codex-plugin.mjs").status, 0);
  const skillRoot = path.join(root, "dist/codex-plugin/skills/research");
  const before = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
  write("codex/invocation.json", JSON.stringify({ manualOnly: ["research"] }));
  assert.notEqual(run("check-codex-plugin.mjs").status, 0);
  assert.equal(run("build-codex-plugin.mjs").status, 0);
  assert.equal(fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8"), before);
  assert.match(fs.readFileSync(path.join(skillRoot, "agents/openai.yaml"), "utf8"), /allow_implicit_invocation: false/);
  const checked = run("check-codex-plugin.mjs");
  assert.equal(checked.status, 0, checked.output);
  write("codex/invocation.json", JSON.stringify({ manualOnly: ["missing"] }));
  assert.notEqual(run("build-codex-plugin.mjs").status, 0);
});

test("build applies overrides, preserves source/resources, and checks the installable copy", (t) => {
  const { root, write, run } = fixture(t);
  const built = run("build-codex-plugin.mjs");
  assert.equal(built.status, 0, built.output);
  assert.equal(fs.readFileSync(path.join(root, sourcePath, "SKILL.md"), "utf8"), original);
  const packaged = path.join(root, "dist/codex-plugin/skills/research/SKILL.md");
  assert.ok(fs.readFileSync(packaged, "utf8").includes("$research"));
  assert.equal(fs.readFileSync(path.join(root, "dist/codex-plugin/skills/research/reference.txt"), "utf8"), "Supporting resource\n");
  let checked = run("check-codex-plugin.mjs");
  assert.equal(checked.status, 0, checked.output);

  write("dist/codex-marketplace/plugins/mattpocock-skills/skills/research/reference.txt", "stale\n");
  checked = run("check-codex-plugin.mjs");
  assert.notEqual(checked.status, 0);
  assert.match(checked.output, /marketplace artifact differs/);

  assert.equal(run("build-codex-plugin.mjs").status, 0);
  write("codex/overrides/research/SKILL.md", adapted + "New behavior.\n");
  checked = run("check-codex-plugin.mjs");
  assert.notEqual(checked.status, 0);
  assert.match(checked.output, /packaged body is stale/);
});

test("invalid source or policy changes fail before deleting previous artifacts", (t) => {
  const { root, write, run } = fixture(t);
  assert.equal(run("build-codex-plugin.mjs").status, 0);
  const artifact = path.join(root, "dist/codex-plugin/skills/research/SKILL.md");
  const previous = fs.readFileSync(artifact, "utf8");
  write("codex/overrides/research/SKILL.md", adapted.replace("name: research", "name: research\ndisable-model-invocation: true"));
  let result = run("build-codex-plugin.mjs");
  assert.notEqual(result.status, 0);
  assert.match(result.output, /must preserve name and invocation policy/);
  assert.equal(fs.readFileSync(artifact, "utf8"), previous);

  write(`${sourcePath}/SKILL.md`, original + "New upstream behavior.\n");
  result = run("build-codex-plugin.mjs");
  assert.notEqual(result.status, 0);
  assert.match(result.output, /Upstream SKILL.md changed/);
  assert.equal(fs.readFileSync(artifact, "utf8"), previous);
});
