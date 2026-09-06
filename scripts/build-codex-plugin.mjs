#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { loadCodexOverrides, loadManualOnlySkills, rewritePackagedSkillReferences } from "./codex-overrides.mjs";

const repoRoot = process.cwd();
const sourceManifestPath = path.join(repoRoot, ".claude-plugin", "plugin.json");
const packageJsonPath = path.join(repoRoot, "package.json");
const outputRoot = path.join(repoRoot, "dist", "codex-plugin");
const outputSkillsRoot = path.join(outputRoot, "skills");
const marketplaceRoot = path.join(repoRoot, "dist", "codex-marketplace");
const rootMarketplaceRoot = repoRoot;
const marketplacePluginRoot = path.join(
  marketplaceRoot,
  "plugins",
  "mattpocock-skills",
);
const marketplaceName = "cheniverse-skills";
const marketplaceDisplayName = "Cheniverse Skills";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseSkillMarkdown(contents, sourcePath) {
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error(`${sourcePath} must start with YAML frontmatter`);
  }

  const frontmatter = match[1];
  const body = contents.slice(match[0].length);
  const name = readFrontmatterString(frontmatter, "name");
  const description = readFrontmatterString(frontmatter, "description");
  const disableModelInvocation =
    /^disable-model-invocation:\s*true\s*$/m.test(frontmatter) ||
    /^disable_model_invocation:\s*true\s*$/m.test(frontmatter);

  if (!name || !description) {
    throw new Error(`${sourcePath} frontmatter must include name and description`);
  }

  return { name, description, disableModelInvocation, body };
}

function readFrontmatterString(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!match) return null;

  const raw = match[1].trim();
  if (raw.startsWith('"') && raw.endsWith('"')) {
    return JSON.parse(raw);
  }
  if (raw.startsWith("'") && raw.endsWith("'")) {
    return raw.slice(1, -1).replace(/''/g, "'");
  }
  return raw;
}

function formatSkillMarkdown(skill) {
  return [
    "---",
    `name: ${quoteYaml(skill.name)}`,
    `description: ${quoteYaml(skill.description)}`,
    "---",
    skill.body,
  ].join("\n");
}

function formatOpenAiYaml(skill) {
  return [
    "interface:",
    `  display_name: ${quoteYaml(`Matt: ${skill.name}`)}`,
    `  short_description: ${quoteYaml(toShortDescription(skill.description))}`,
    `  default_prompt: ${quoteYaml(`Use $${skill.name} to work with Matt's ${skill.name} skill.`)}`,
    "policy:",
    `  allow_implicit_invocation: ${skill.disableModelInvocation ? "false" : "true"}`,
    "",
  ].join("\n");
}

function quoteYaml(value) {
  return JSON.stringify(String(value));
}

function toShortDescription(description) {
  const firstSentence = description
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?。！？])\s+/)[0]
    .trim();

  if (firstSentence.length <= 64) return firstSentence;
  return `${firstSentence.slice(0, 61).trimEnd()}...`;
}

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
      continue;
    }

    if (entry.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function normalizeManifestPath(rawPath) {
  if (!rawPath.startsWith("./skills/")) {
    throw new Error(`Unsupported skill path in .claude-plugin/plugin.json: ${rawPath}`);
  }
  return rawPath.replace(/^\.\//, "").replaceAll("/", path.sep);
}

function writePluginManifest(packageJson, skills) {
  const manifest = {
    name: "mattpocock-skills",
    version: packageJson.version,
    description: "Matt Pocock's skills with personal Codex workflow adaptations.",
    author: {
      name: "Matt Pocock",
      url: "https://github.com/mattpocock",
    },
    homepage: "https://github.com/cheniverse/skills",
    repository: "https://github.com/cheniverse/skills",
    license: packageJson.license,
    keywords: ["codex", "skills", "engineering", "productivity"],
    skills: "skills",
    interface: {
      displayName: "Matt Skills",
      shortDescription: "Matt Pocock's engineering and workflow skills.",
      longDescription:
        "Matt Pocock's engineering and productivity skills, with Cheniverse's personal adaptations for scoped research, review, testing, diagnosis, and implementation.",
      developerName: "Matt Pocock",
      category: "Productivity",
      capabilities: ["Interactive", "Write"],
      defaultPrompt: [
        `Use $${skills[0].name} to choose the right Matt skill for this situation.`,
      ],
      brandColor: "#2563EB",
    },
  };

  const manifestDir = path.join(outputRoot, ".codex-plugin");
  fs.mkdirSync(manifestDir, { recursive: true });
  fs.writeFileSync(
    path.join(manifestDir, "plugin.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

function writeMarketplaceManifest(root, pluginPath) {
  const marketplaceManifest = {
    name: marketplaceName,
    interface: {
      displayName: marketplaceDisplayName,
    },
    plugins: [
      {
        name: "mattpocock-skills",
        source: {
          source: "local",
          path: pluginPath,
        },
        policy: {
          installation: "AVAILABLE",
          authentication: "ON_INSTALL",
        },
        category: "Productivity",
      },
    ],
  };

  const marketplaceManifestDir = path.join(
    root,
    ".agents",
    "plugins",
  );
  fs.mkdirSync(marketplaceManifestDir, { recursive: true });
  fs.writeFileSync(
    path.join(marketplaceManifestDir, "marketplace.json"),
    `${JSON.stringify(marketplaceManifest, null, 2)}\n`,
  );
}

function main() {
  const sourceManifest = readJson(sourceManifestPath);
  const packageJson = readJson(packageJsonPath);

  if (!Array.isArray(sourceManifest.skills) || sourceManifest.skills.length === 0) {
    throw new Error(".claude-plugin/plugin.json must include a non-empty skills array");
  }

  const overrides = loadCodexOverrides(repoRoot, sourceManifest.skills);
  const manualOnly = loadManualOnlySkills(repoRoot, sourceManifest.skills);
  const skills = sourceManifest.skills.map((rawSkillPath) => {
    const sourceSkillRoot = path.join(repoRoot, normalizeManifestPath(rawSkillPath));
    const sourceSkillMd = path.join(sourceSkillRoot, "SKILL.md");

    if (!fs.existsSync(sourceSkillMd)) {
      throw new Error(`Missing SKILL.md for ${rawSkillPath}`);
    }

    const sourceContents = fs.readFileSync(sourceSkillMd, "utf8");
    const original = parseSkillMarkdown(sourceContents, sourceSkillMd);
    const effective = parseSkillMarkdown(overrides.get(rawSkillPath) ?? sourceContents, sourceSkillMd);
    if (effective.name !== original.name || effective.disableModelInvocation !== original.disableModelInvocation) {
      throw new Error(`Codex override must preserve name and invocation policy: ${rawSkillPath}`);
    }
    return {
      rawSkillPath,
      sourceSkillRoot,
      ...effective,
      disableModelInvocation: effective.disableModelInvocation || manualOnly.has(effective.name),
    };
  });
  const skillNames = new Set(skills.map((skill) => skill.name));

  // 删除目标固定在仓库 dist 内；先校验所有输入，失败时保留已有产物。
  for (const target of [outputRoot, marketplaceRoot]) {
    if (path.dirname(target) !== path.join(repoRoot, "dist")) {
      throw new Error(`Refusing to remove output outside dist: ${target}`);
    }
    fs.rmSync(target, { recursive: true, force: true });
  }
  fs.mkdirSync(outputSkillsRoot, { recursive: true });

  for (const skill of skills) {
    const outputSkillRoot = path.join(outputSkillsRoot, skill.name);

    if (fs.existsSync(outputSkillRoot)) {
      throw new Error(`Duplicate skill name after flattening: ${skill.name}`);
    }

    copyDirectory(skill.sourceSkillRoot, outputSkillRoot);
    const packagedSkill = {
      ...skill,
      body: rewritePackagedSkillReferences(skill.body, skillNames),
    };
    fs.writeFileSync(path.join(outputSkillRoot, "SKILL.md"), formatSkillMarkdown(packagedSkill));

    const agentsDir = path.join(outputSkillRoot, "agents");
    fs.mkdirSync(agentsDir, { recursive: true });
    fs.writeFileSync(path.join(agentsDir, "openai.yaml"), formatOpenAiYaml(skill));
  }

  writePluginManifest(packageJson, skills);
  copyDirectory(outputRoot, marketplacePluginRoot);
  writeMarketplaceManifest(marketplaceRoot, "./plugins/mattpocock-skills");
  writeMarketplaceManifest(
    rootMarketplaceRoot,
    "./dist/codex-marketplace/plugins/mattpocock-skills",
  );
  console.log(`Built Codex plugin with ${skills.length} skills at ${outputRoot}`);
  console.log(`Built local marketplace at ${marketplaceRoot}`);
  console.log(`Applied ${overrides.size} reviewed personal Codex overrides.`);
}

main();
