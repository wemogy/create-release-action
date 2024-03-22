import { Octokit } from "@octokit/rest";
import ReleaseNotesGenerator from "./ReleaseNotesGenerator";
import GitHubRepositoryUtils from "./utils/GitHubRepositoryUtils";

const github = require("@actions/github");
const core = require("@actions/core");

async function run() {
  // Get the action inputs
  const token = core.getInput("github-token", { required: true });
  const releaseVersionTag = core.getInput("release-version-tag", {
    required: true,
  });
  const releaseTitle = core.getInput("release-title", { required: true });
  const previousReleaseVersionTag = core.getInput(
    "previous-release-version-tag",
    { required: false }
  );
  const preRelease =
    core.getInput("pre-release", { required: false }) === "true";
  const dryRun = core.getInput("dry-run", { required: false }) === "true";

  // Get context information
  const { owner, repo } = github.context.repo;

  // construct services
  const octokit = new Octokit({
    auth: token,
  });
  const gitHubRepositoryUtils = new GitHubRepositoryUtils(owner, repo, octokit);
  const releaseNotesGenerator = new ReleaseNotesGenerator();

  // Get the referenced issues between the previous release and the current release
  const issues = await gitHubRepositoryUtils.getReferencedIssuesBetweenTags(
    previousReleaseVersionTag,
    releaseVersionTag,
    "release"
  );

  // Create the release notes
  const releaseNotes = releaseNotesGenerator.generateReleaseNotes(issues);

  // Create the release
  if (dryRun) {
    core.info(
      `Dry run: Would have created release with the following notes:\n${releaseNotes}`
    );
    return;
  }

  core.info(`Creating release with the following notes:\n${releaseNotes}`);

  await gitHubRepositoryUtils.createRelease(
    releaseVersionTag,
    releaseTitle,
    releaseNotes || "No release notes provided",
    preRelease
  );
}

run();
