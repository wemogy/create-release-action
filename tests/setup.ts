import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import path from "path";
import simpleGit, { SimpleGit } from "simple-git";
import TestingUtils from "./TestingUtils";

function copyRepoTemplateToRepository(repoDir: string) {
  // Copy all files from test-repo-template directory to the new repository
  const templateDir = path.join(__dirname, ".test-repo-template");
  const files = fs.readdirSync(templateDir, { recursive: true });
  for (const file of files) {
    if (typeof file !== "string") {
      continue;
    }

    // continue if file is a directory
    if (fs.statSync(path.join(templateDir, file)).isDirectory()) {
      continue;
    }

    // ensure that the directory exists
    const dir = path.dirname(file);
    if (!fs.existsSync(path.join(repoDir, dir))) {
      fs.mkdirSync(path.join(repoDir, dir), { recursive: true });
    }

    const source = path.join(templateDir, file);
    const target = path.join(repoDir, file);
    fs.copyFileSync(source, target);
  }
}

const gitPath = path.join(__dirname, "../..");

module.exports = async () => {
  // generate new unique repo name and store it in env.json
  const fs = require("fs");
  const path = require("path");
  const envPath = path.resolve(__dirname, "../env/env.json");
  const env = require(envPath);
  env.REPO = `test-repo-${Date.now()}`;
  fs.writeFileSync(envPath, JSON.stringify(env, null, 2));

  // Create services
  const owner = env.OWNER;
  const repo = env.REPO;
  const repoDir = path.join(gitPath, repo);
  const octokit = new Octokit({
    auth: env.GITHUB_TOKEN,
  });
  const git: SimpleGit = simpleGit({});
  const utils = new TestingUtils(owner, repo, repoDir, git, octokit);

  // Create a new repository
  const repository = await octokit.repos.createForAuthenticatedUser({
    name: repo,
    delete_branch_on_merge: true,
  });
  console.log("Created repository", repository.data.html_url);

  // Add the PAT secret to the repository
  await utils.addRepositorySecret("PAT", env.GITHUB_TOKEN);

  // Clone the repository to repoDir
  await git.clone(repository.data.clone_url, repoDir);

  // Set the working directory to the repository and checkout main branch
  await git.cwd(repoDir);
  await git.checkoutLocalBranch("main");

  // Create README.md and push to the repository (initial commit)
  const readme = path.join(repoDir, "README.md");
  fs.writeFileSync(readme, `# ${repo}`);
  await git.add(readme);
  await git.commit("Initial commit");
  await git.push("origin", "main");

  // Copy .test-repo-template to the repository
  copyRepoTemplateToRepository(repoDir);

  // Commit and push the files
  await git.add(".");
  await git.commit("Template files added");
  await git.push("origin", "main");

  await utils.waitForAllActionsToComplete();

  // Feature A
  const issueFeatureA = await octokit.issues.create({
    owner,
    repo,
    title: "Feature A",
    body: "This is the first feature",
    labels: ["enhancement"],
  });
  await utils.implementIssue(issueFeatureA.data.number, "feat");

  await utils.waitForAllActionsToComplete();

  // Feature B
  const issueFeatureB = await octokit.issues.create({
    owner,
    repo,
    title: "Feature B",
    body: "This is the second feature",
    labels: ["enhancement"],
  });
  await utils.implementIssue(issueFeatureB.data.number, "feat");

  await utils.waitForAllActionsToComplete();
  await utils.waitForAllActionsToComplete();

  console.log("Setup completed");
};
