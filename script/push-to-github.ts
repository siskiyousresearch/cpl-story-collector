import { getUncachableGitHubClient } from "../server/github";
import fs from "fs";
import path from "path";

const REPO_NAME = "cpl-story-collector";

const EXCLUDED = new Set([
  "node_modules",
  "dist",
  ".git",
  ".replit",
  "replit.nix",
  ".config",
  "generated-icon.png",
  ".local",
  ".cache",
  ".upm",
  "sedWBodj8",
]);

function collectFiles(dir: string, base: string = ""): { path: string; fullPath: string }[] {
  const results: { path: string; fullPath: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (EXCLUDED.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const relativePath = base ? `${base}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      results.push({ path: relativePath, fullPath });
    }
  }

  return results;
}

function isBinary(filePath: string): boolean {
  const binaryExtensions = new Set([
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".svg",
    ".woff", ".woff2", ".ttf", ".eot",
    ".zip", ".tar", ".gz",
    ".pdf", ".mp3", ".mp4",
  ]);
  const ext = path.extname(filePath).toLowerCase();
  return binaryExtensions.has(ext);
}

async function main() {
  console.log("Getting GitHub client...");
  const octokit = await getUncachableGitHubClient();

  console.log("Getting authenticated user...");
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);

  const owner = user.login;

  let repoExists = false;
  try {
    await octokit.repos.get({ owner, repo: REPO_NAME });
    repoExists = true;
    console.log(`Repository ${REPO_NAME} already exists.`);
  } catch (e: any) {
    if (e.status === 404) {
      console.log(`Creating repository ${REPO_NAME}...`);
      await octokit.repos.createForAuthenticatedUser({
        name: REPO_NAME,
        description: "CPL Story Collector - AI-powered student story collection platform",
        private: false,
        auto_init: true,
      });
      console.log(`Repository ${REPO_NAME} created.`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else {
      throw e;
    }
  }

  console.log("Collecting project files...");
  const projectRoot = path.resolve(process.cwd());
  const files = collectFiles(projectRoot);
  console.log(`Found ${files.length} files to push.`);

  console.log("Creating blobs...");
  const treeItems: { path: string; mode: "100644"; type: "blob"; sha: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const binary = isBinary(file.fullPath);

    let content: string;
    let encoding: "utf-8" | "base64";

    if (binary) {
      content = fs.readFileSync(file.fullPath).toString("base64");
      encoding = "base64";
    } else {
      content = fs.readFileSync(file.fullPath, "utf-8");
      encoding = "utf-8";
    }

    const { data: blob } = await octokit.git.createBlob({
      owner,
      repo: REPO_NAME,
      content,
      encoding,
    });

    treeItems.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });

    if ((i + 1) % 20 === 0 || i === files.length - 1) {
      console.log(`  Created blob ${i + 1}/${files.length}`);
    }
  }

  console.log("Creating tree...");
  const { data: tree } = await octokit.git.createTree({
    owner,
    repo: REPO_NAME,
    tree: treeItems,
  });

  let parentSha: string | undefined;
  try {
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo: REPO_NAME,
      ref: "heads/main",
    });
    parentSha = ref.object.sha;
  } catch {
    // No existing commits - first push
  }

  console.log("Creating commit...");
  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo: REPO_NAME,
    message: "Initial commit: CPL Story Collector project",
    tree: tree.sha,
    parents: parentSha ? [parentSha] : [],
  });

  console.log("Pushing to main branch...");
  try {
    if (parentSha) {
      await octokit.git.updateRef({
        owner,
        repo: REPO_NAME,
        ref: "heads/main",
        sha: commit.sha,
        force: true,
      });
    } else {
      await octokit.git.createRef({
        owner,
        repo: REPO_NAME,
        ref: "refs/heads/main",
        sha: commit.sha,
      });
    }
  } catch {
    try {
      await octokit.git.createRef({
        owner,
        repo: REPO_NAME,
        ref: "refs/heads/main",
        sha: commit.sha,
      });
    } catch {
      await octokit.git.updateRef({
        owner,
        repo: REPO_NAME,
        ref: "heads/main",
        sha: commit.sha,
        force: true,
      });
    }
  }

  console.log(`\nDone! Repository pushed to: https://github.com/${owner}/${REPO_NAME}`);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
