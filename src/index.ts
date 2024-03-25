import { Octokit } from "@octokit/rest";
import ReleaseNotesGenerator from "./ReleaseNotesGenerator";
import GitHubRepositoryUtils from "./utils/GitHubRepositoryUtils";
import GitHubProjectsUtils from "./utils/GitHubProjectsUtils";

const github = require("@actions/github");
const core = require("@actions/core");

async function run() {
  // Get the action inputs
  const token = core.getInput("github-token", { required: true });
  const releaseVersionTag = core.getInput("release-version-tag", {
    required: true,
  });
  const releaseTitle = core.getInput("release-title", { required: true });
  const previousVersionTag = core.getInput("previous-version-tag", {
    required: false,
  });
  const preRelease =
    core.getInput("pre-release", { required: false }) === "true";
  const dryRun = core.getInput("dry-run", { required: false }) === "true";
  const labelIssuesWith = core.getInput("label-issues-with", {
    required: false,
  });
  const projectNumber = core.getInput("project-number", { required: false });
  const projectStatusColumnName = core.getInput("project-status-column-name", {
    required: false,
  });

  // Get context information
  const { owner, repo } = github.context.repo;

  // construct services
  const octokit = new Octokit({
    auth: token,
  });
  const gitHubRepositoryUtils = new GitHubRepositoryUtils(owner, repo, octokit);
  const gitHubProjectsUtils = new GitHubProjectsUtils(owner, repo, octokit);
  const releaseNotesGenerator = new ReleaseNotesGenerator();

  // Get the referenced issues between the previous release and the current release
  const issues = await gitHubRepositoryUtils.getReferencedIssuesBetweenTags(
    previousVersionTag,
    releaseVersionTag,
    github.context.ref
  );

  core.info(`Found ${issues.length} issues between tags`);

  // Create the release notes
  const releaseNotes = releaseNotesGenerator.generateReleaseNotes(issues);

  // Create the release
  if (dryRun) {
    core.info(
      `Dry run: Would have created release with the following notes:\n${releaseNotes}`
    );
  } else {
    core.info(`Creating release with the following notes:\n${releaseNotes}`);

    await gitHubRepositoryUtils.createRelease(
      releaseVersionTag,
      releaseTitle,
      releaseNotes || "No release notes provided",
      preRelease
    );
  }

  // Label issues
  if (labelIssuesWith) {
    core.info(`Labeling issues with ${labelIssuesWith}`);
    const issueNumbers = issues.map((issue) => issue.number);
    await gitHubRepositoryUtils.addLabelToIssues(issueNumbers, labelIssuesWith);
  }

  // Update project cards
  if (projectNumber && projectStatusColumnName) {
    const parsedProjectNumber = parseInt(projectNumber);

    for (const issue of issues) {
      core.info(
        `Updating project card of issue ${issue.number} with status ${projectStatusColumnName}`
      );
      await gitHubProjectsUtils.updateProjectField(
        parsedProjectNumber,
        issue.number,
        "Status",
        projectStatusColumnName
      );
    }
  }
}

run();
