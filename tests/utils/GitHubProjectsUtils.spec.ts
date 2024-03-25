import "jest";
import * as env from "../../env/env.json";
import GitHubProjectsUtils from "../../src/utils/GitHubProjectsUtils";
import { Octokit } from "@octokit/rest";

const owner = env.OWNER;
const repo = env.REPO;

describe("GitHubProjectsUtils", () => {
  const octokit = new Octokit({
    auth: env.GITHUB_TOKEN,
  });
  const gitHubProjectsUtils = new GitHubProjectsUtils(owner, repo, octokit);
  it("should return project id", async () => {
    // Arrange
    const projectNumber = 2;

    // Act
    const projectId = await gitHubProjectsUtils.getProjectId(projectNumber);

    // Assert
    expect(projectId).toBeDefined();
  });

  it("should update project field", async () => {
    // Arrange
    const projectNumber = 2;
    const issueNumber = 1;
    const fieldId = "Status";
    const value = "In Progress";

    // Act
    await gitHubProjectsUtils.updateProjectField(
      projectNumber,
      issueNumber,
      fieldId,
      value
    );

    // Assert
    // No exceptions thrown
  });
});
