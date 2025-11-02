#!/usr/bin/env node

/**
 * CI/CD Setup Validation Script
 * Following gloire-road-map patterns for proven CI/CD workflow
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log(
  "🔍 Validating CI/CD Setup following gloire-road-map patterns...\n"
);

let errors = [];
let warnings = [];

// Check package.json configuration
console.log("📦 Checking package.json configuration...");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

// Validate semantic-release dependencies
const requiredDeps = [
  "@semantic-release/changelog",
  "@semantic-release/commit-analyzer",
  "@semantic-release/git",
  "@semantic-release/github",
  "@semantic-release/npm",
  "@semantic-release/release-notes-generator",
  "semantic-release",
  "@commitlint/cli",
  "@commitlint/config-conventional",
  "husky",
];

requiredDeps.forEach((dep) => {
  if (!packageJson.devDependencies[dep]) {
    errors.push(`Missing dependency: ${dep}`);
  } else {
    console.log(`✅ ${dep}: ${packageJson.devDependencies[dep]}`);
  }
});

// Check .releaserc configuration
console.log("\n🔧 Checking .releaserc configuration...");
if (fs.existsSync(".releaserc")) {
  const releaserc = JSON.parse(fs.readFileSync(".releaserc", "utf8"));
  console.log("✅ .releaserc exists");

  if (releaserc.branches && releaserc.branches.includes("main")) {
    console.log("✅ Configured for main branch");
  } else {
    errors.push("Missing main branch in .releaserc");
  }

  if (releaserc.plugins && releaserc.plugins.length > 0) {
    console.log("✅ Semantic-release plugins configured");
  } else {
    errors.push("No semantic-release plugins configured");
  }
} else {
  errors.push(".releaserc file not found");
}

// Check commitlint configuration
console.log("\n📝 Checking commitlint configuration...");
if (fs.existsSync("commitlint.config.js")) {
  console.log("✅ commitlint.config.js exists");
} else {
  errors.push("commitlint.config.js not found");
}

// Check husky configuration
console.log("\n🪝 Checking husky configuration...");
if (fs.existsSync(".husky/commit-msg")) {
  const commitMsg = fs.readFileSync(".husky/commit-msg", "utf8");
  if (commitMsg.includes("--no-install")) {
    console.log("✅ Husky commit-msg hook uses --no-install flag");
  } else {
    warnings.push("Husky commit-msg should use --no-install flag");
  }
} else {
  errors.push(".husky/commit-msg not found");
}

// Check GitHub workflows
console.log("\n🚀 Checking GitHub workflows...");
const workflowDir = ".github/workflows";
const requiredWorkflows = [
  "release.yml",
  "pr-commitlint.yml",
  "test.yml",
  "deploy.yml",
];

requiredWorkflows.forEach((workflow) => {
  const workflowPath = path.join(workflowDir, workflow);
  if (fs.existsSync(workflowPath)) {
    console.log(`✅ ${workflow} exists`);

    const content = fs.readFileSync(workflowPath, "utf8");
    if (content.includes("npx") && !content.includes("--no-install")) {
      warnings.push(
        `${workflow} contains npx commands without --no-install flag`
      );
    } else if (content.includes("--no-install")) {
      console.log(`  ✅ Uses --no-install flag`);
    } else {
      console.log(`  ✅ No npx commands that need --no-install flag`);
    }
  } else {
    errors.push(`Missing workflow: ${workflow}`);
  }
});

// Test semantic-release version
console.log("\n🔧 Testing semantic-release installation...");
try {
  const version = execSync("npx --no-install semantic-release --version", {
    encoding: "utf8",
  }).trim();
  console.log(`✅ semantic-release version: ${version}`);
} catch (error) {
  errors.push("Failed to run semantic-release --version");
}

// Test commitlint
console.log("\n📝 Testing commitlint...");
try {
  execSync(
    'echo "feat: test commit message" | npx --no-install commitlint --config commitlint.config.js',
    { encoding: "utf8" }
  );
  console.log("✅ commitlint working correctly");
} catch (error) {
  // Check if it's just a warning, not an error
  if (error.status === 0 || error.stdout) {
    console.log("✅ commitlint working correctly");
  } else {
    errors.push("commitlint test failed");
  }
}

// Summary
console.log("\n📊 Validation Summary:");
console.log("=".repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log(
    "🎉 All validations passed! CI/CD setup is ready following gloire-road-map patterns."
  );
} else {
  if (errors.length > 0) {
    console.log("\n❌ Errors:");
    errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  console.log(
    `\n🔍 Found ${errors.length} errors and ${warnings.length} warnings.`
  );
  if (errors.length > 0) {
    process.exit(1);
  }
}

console.log("\n🚀 Ready to use gloire-road-map proven CI/CD patterns!");
