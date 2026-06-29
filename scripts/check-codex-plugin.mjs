#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const sourceManifestPath = path.join(repoRoot, ".claude-plugin", "plugin.json");
const outputRoot = path.join(repoRoot, "dist", "codex-plugin");
const outputSkillsRoot = path.join(outputRoot, "skills");
const outputManifestPath = path.join(outputRoot, ".codex-plugin", "plugin.json");
const marketplaceRoot = path.join(repoRoot, "dist", "codex-marketplace");
const marketplaceManifestPath = path.join(
  marketplaceRoot,
  ".agents",
  "plugins",
  "marketplace.json",
);
const rootMarketplaceManifestPath = path.join(
  repoRoot,
  ".agents",
  "plugins",
  "marketplace.json",
);
const marketplacePluginRoot = path.join(
  marketplaceRoot,
  "plugins",
  "mattpocock-skills",
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseSkillMarkdown(contents, sourcePath) {
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error(`${sourcePath} must start with YAML frontmatter`);
  }

  const frontmatter = match[1];
  const name = readFrontmatterString(frontmatter, "name");
  const description = readFrontmatterString(frontmatter, "description");
  const disableModelInvocation =
    /^disable-model-invocation:\s*true\s*$/m.test(frontmatter) ||
    /^disable_model_invocation:\s*true\s*$/m.test(frontmatter);

  if (!name || !description) {
    throw new Error(`${sourcePath} frontmatter must include name and description`);
  }

  return { name, description, disableModelInvocation, frontmatter };
}

function readFrontmatterString(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!match) return null;

  const raw = match[1].trim();
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1);
  }
  return raw;
}

function normalizeManifestPath(rawPath) {
  return rawPath.replace(/^\.\//, "").replaceAll("/", path.sep);
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function main() {
  const errors = [];
  const sourceManifest = readJson(sourceManifestPath);
  const outputManifest = readJson(outputManifestPath);
  const marketplaceManifest = readJson(marketplaceManifestPath);
  const rootMarketplaceManifest = readJson(rootMarketplaceManifestPath);

  assert(Array.isArray(sourceManifest.skills), "source manifest must include skills array", errors);
  assert(outputManifest.skills === "skills", "Codex plugin manifest must point skills to skills", errors);
  assert(marketplaceManifest.name === "cheniverse-skills", "marketplace name must be cheniverse-skills", errors);
  assert(
    marketplaceManifest.plugins?.[0]?.source?.path === "./plugins/mattpocock-skills",
    "marketplace must point at ./plugins/mattpocock-skills",
    errors,
  );
  assert(rootMarketplaceManifest.name === "cheniverse-skills", "root marketplace name must be cheniverse-skills", errors);
  assert(
    rootMarketplaceManifest.plugins?.[0]?.source?.path ===
      "./dist/codex-marketplace/plugins/mattpocock-skills",
    "root marketplace must point at ./dist/codex-marketplace/plugins/mattpocock-skills",
    errors,
  );
  assert(
    fs.existsSync(path.join(marketplacePluginRoot, ".codex-plugin", "plugin.json")),
    "marketplace plugin copy is missing .codex-plugin/plugin.json",
    errors,
  );

  const sourceSkills = sourceManifest.skills.map((rawPath) => {
    assert(
      rawPath.startsWith("./skills/engineering/") ||
        rawPath.startsWith("./skills/productivity/"),
      `source manifest includes an out-of-scope skill: ${rawPath}`,
      errors,
    );

    const sourceSkillRoot = path.join(repoRoot, normalizeManifestPath(rawPath));
    const sourceSkillMd = path.join(sourceSkillRoot, "SKILL.md");
    assert(fs.existsSync(sourceSkillMd), `missing source SKILL.md: ${rawPath}`, errors);
    return {
      rawPath,
      ...parseSkillMarkdown(fs.readFileSync(sourceSkillMd, "utf8"), sourceSkillMd),
    };
  });

  const expectedNames = new Set(sourceSkills.map((skill) => skill.name));
  const namesPattern = [...expectedNames]
    .sort((a, b) => b.length - a.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const oldPackagedSkillReferencePattern = new RegExp(
    `(^|[^\\w:/.])\\/(${namesPattern})(?![\\w/-])`,
    "m",
  );

  assert(
    expectedNames.size === sourceSkills.length,
    "source manifest contains duplicate skill names",
    errors,
  );

  const outputSkillDirs = fs.existsSync(outputSkillsRoot)
    ? fs
        .readdirSync(outputSkillsRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
        .map((entry) => entry.name)
        .sort()
    : [];

  assert(
    outputSkillDirs.length === sourceSkills.length,
    `expected ${sourceSkills.length} packaged skills, found ${outputSkillDirs.length}`,
    errors,
  );

  for (const skill of sourceSkills) {
    const outputSkillRoot = path.join(outputSkillsRoot, skill.name);
    const outputSkillMd = path.join(outputSkillRoot, "SKILL.md");
    const outputOpenAiYaml = path.join(outputSkillRoot, "agents", "openai.yaml");

    assert(fs.existsSync(outputSkillRoot), `missing packaged skill directory: ${skill.name}`, errors);
    assert(fs.existsSync(outputSkillMd), `missing packaged SKILL.md: ${skill.name}`, errors);
    assert(fs.existsSync(outputOpenAiYaml), `missing agents/openai.yaml: ${skill.name}`, errors);

    if (fs.existsSync(outputSkillMd)) {
      const outputContents = fs.readFileSync(outputSkillMd, "utf8");
      const outputSkill = parseSkillMarkdown(outputContents, outputSkillMd);
      assert(outputSkill.name === skill.name, `packaged name changed for ${skill.name}`, errors);
      assert(
        !/disable-model-invocation:\s*true/.test(outputSkill.frontmatter),
        `packaged skill keeps disable-model-invocation: true: ${skill.name}`,
        errors,
      );
      assert(
        !oldPackagedSkillReferencePattern.test(outputContents),
        `packaged skill keeps a slash-style reference to a packaged skill: ${skill.name}`,
        errors,
      );
    }

    if (fs.existsSync(outputOpenAiYaml)) {
      const yaml = fs.readFileSync(outputOpenAiYaml, "utf8");
      assert(
        yaml.includes(`display_name: "Matt: ${skill.name}"`),
        `display_name is not Matt-prefixed for ${skill.name}`,
        errors,
      );
      assert(
        yaml.includes(
          `allow_implicit_invocation: ${skill.disableModelInvocation ? "false" : "true"}`,
        ),
        `implicit invocation policy mismatch for ${skill.name}`,
        errors,
      );
    }
  }

  for (const outputDirName of outputSkillDirs) {
    assert(expectedNames.has(outputDirName), `unexpected packaged skill: ${outputDirName}`, errors);
  }

  if (errors.length > 0) {
    console.error("Codex plugin check failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Codex plugin check passed for ${sourceSkills.length} skills.`);
}

main();
