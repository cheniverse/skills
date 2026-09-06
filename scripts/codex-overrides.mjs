import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

// 忽略检出时的换行转换，内容变化仍要求重新审查覆盖文件。
export function sourceDigest(contents) {
  return createHash("sha256").update(contents.replace(/\r\n/g, "\n")).digest("hex");
}

export function loadManualOnlySkills(repoRoot, sourcePaths) {
  const { manualOnly } = JSON.parse(fs.readFileSync(path.join(repoRoot, "codex", "invocation.json"), "utf8"));
  const knownNames = new Set(sourcePaths.map((source) => path.posix.basename(source)));
  if (!Array.isArray(manualOnly) || manualOnly.some((name) => !knownNames.has(name)) ||
      new Set(manualOnly).size !== manualOnly.length) {
    throw new Error("codex/invocation.json manualOnly must list unique shipped skill names");
  }
  return new Set(manualOnly);
}

export function loadCodexOverrides(repoRoot, sourcePaths) {
  const root = path.join(repoRoot, "codex", "overrides");
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  const overrides = new Map();

  for (const [name, entry] of Object.entries(manifest)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) ||
        !sourcePaths.includes(entry.source) ||
        !/^\.\/skills\/(engineering|productivity)\/[a-z0-9-]+$/.test(entry.source) ||
        path.posix.basename(entry.source) !== name) {
      throw new Error(`Invalid Codex override source: ${name}`);
    }
    const source = fs.readFileSync(path.join(repoRoot, entry.source, "SKILL.md"), "utf8");
    if (sourceDigest(source) !== entry.sha256) {
      throw new Error(`Upstream SKILL.md changed for ${name}. Review codex/overrides/${name}/SKILL.md against the updated source, then update its sha256 in codex/overrides/manifest.json.`);
    }
    overrides.set(entry.source, fs.readFileSync(path.join(root, name, "SKILL.md"), "utf8"));
  }

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory() && !Object.hasOwn(manifest, entry.name)) {
      throw new Error(`Unregistered Codex override: ${entry.name}`);
    }
  }
  return overrides;
}

export function rewritePackagedSkillReferences(body, skillNames) {
  const namesPattern = [...skillNames]
    .sort((a, b) => b.length - a.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  if (!namesPattern) return body;
  return body.replace(
    new RegExp(`(^|[^\\w:/.])\\/(${namesPattern})(?![\\w/-])`, "g"),
    (_match, prefix, name) => `${prefix}$${name}`,
  );
}
