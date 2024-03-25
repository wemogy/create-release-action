import path from "path";
import * as env from "../env/env.json";
import * as fs from "fs";
import { Octokit } from "@octokit/rest";

const gitPath = path.join(__dirname, "../..");

module.exports = async () => {
  const owner = env.OWNER;
  const repo = env.REPO;
  const octokit = new Octokit({
    auth: env.GITHUB_TOKEN,
  });

  await octokit.repos.delete({
    owner: owner,
    repo: repo,
  });

  // delete local repository, if it exists
  if (fs.existsSync(path.join(gitPath, repo))) {
    fs.rmSync(path.join(gitPath, repo), { recursive: true });
  }

  console.log(`Deleted repository ${repo}`);
};
