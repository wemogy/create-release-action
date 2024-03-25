import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import path from "path";
import { SimpleGit } from "simple-git";
import { SodiumPlus, X25519PublicKey } from "sodium-plus";

export default class TestingUtils {
  public constructor(
    private readonly owner: string,
    private readonly repo: string,
    private readonly repoDir: string,
    private readonly git: SimpleGit,
    private readonly octokit: Octokit
  ) {}

  public async implementIssue(issueNumber: number, type: "feat" | "fix") {
    // Destructuring
    const { owner, repo, repoDir, git, octokit } = this;

    // Create a new branch
    await git.checkout("main");
    await git.checkoutLocalBranch(`${type}/${issueNumber}`);

    // Create a file for the feature
    const filename = path.join(repoDir, `feature-${type}-${issueNumber}.txt`);
    fs.writeFileSync(filename, `This is the ${type} for issue #${issueNumber}`);

    // Commit the file
    await git.add(filename);
    await git.commit(`feat: implement feature for issue #${issueNumber}`);

    // Publish the branch
    await git.push("origin", `${type}/${issueNumber}`);

    // Create a pull request
    const pullRequest = await octokit.pulls.create({
      owner,
      repo,
      title: `Closes #${issueNumber}`,
      head: `${type}/${issueNumber}`,
      base: "main",
    });

    // Merge the pull request
    await this.mergePullRequest(pullRequest.data.number);
  }

  public async createRelease() {
    // Destructuring
    const { owner, repo, git, octokit } = this;

    // check if branch called release exists in remote
    const branches = await git.branch(["-r"]);
    const releaseBranch = branches.all.find((b) => b === "origin/release");
    if (!releaseBranch) {
      await git.checkout("main");
      await git.checkoutLocalBranch("release");
      await git.push("origin", "release");
    }

    // Create a pull request from main to release
    const pullRequest = await octokit.pulls.create({
      owner,
      repo,
      title: "Release",
      head: "main",
      base: "release",
    });

    // Merge the pull request
    await this.mergePullRequest(pullRequest.data.number);
  }

  public async addRepositorySecret(secretName: string, secretValue: string) {
    // Destructuring
    const { owner, repo, octokit } = this;

    // Step 1: Get the public key of the repository
    const {
      data: { key, key_id },
    } = await octokit.rest.actions.getRepoPublicKey({
      owner,
      repo,
    });

    // Step 2: Encrypt the secret using GitHub's public key
    const sodium = await SodiumPlus.auto();
    const publicKey = X25519PublicKey.from(Buffer.from(key, "base64") as any);

    const encryptedValue = await sodium.crypto_box_seal(secretValue, publicKey);

    // Step 3: Store the encrypted secret
    await octokit.rest.actions.createOrUpdateRepoSecret({
      owner,
      repo,
      secret_name: secretName,
      encrypted_value: Buffer.from(encryptedValue).toString("base64"),
      key_id: key_id,
    });
  }

  public async waitForAllActionsToComplete() {
    // Destructuring
    const { owner, repo, octokit } = this;

    // Get all workflows
    const { data: workflows } = await octokit.actions.listRepoWorkflows({
      owner,
      repo,
    });

    // wait 10 seconds for all workflows to start
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // For each workflow, fetch all workflow runs and wait for completion
    for (const workflow of workflows.workflows) {
      // Get the workflow id
      const workflowId = workflow.id;

      // Fetch all workflow runs and wait for completion
      await this.fetchAllWorkflowRunsAndWaitForCompletion(workflowId);
    }
  }

  private async mergePullRequest(pullRequestNumber: number, retries = 0) {
    // Destructuring
    const { owner, repo, octokit } = this;

    // Merge the pull request
    try {
      await octokit.pulls.merge({
        owner,
        repo,
        pull_number: pullRequestNumber,
      });
    } catch (e) {
      if (retries >= 2) {
        throw e;
      }
      // wait for 5 seconds and try again
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await this.mergePullRequest(pullRequestNumber, retries + 1);
    }
  }

  private async fetchAllWorkflowRunsAndWaitForCompletion(
    workflowId: number
  ): Promise<void> {
    // Destructuring
    const { owner, repo, octokit } = this;

    // Fetch all workflow runs
    const { data: workflowRuns } = await octokit.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: workflowId,
    });

    // number of workflow runs in progress
    const inProgressRuns = workflowRuns.workflow_runs.filter(
      (run) => run.status === "in_progress"
    ).length;

    if (inProgressRuns === 0) {
      return;
    }

    // Wait for all runs to complete
    await new Promise((resolve) => setTimeout(resolve, 10000));

    await this.fetchAllWorkflowRunsAndWaitForCompletion(workflowId);
  }
}
