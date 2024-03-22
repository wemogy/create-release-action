import "jest";
import * as env from "../../env/env.json";
import GitHubRepositoryUtils from "../../src/utils/GitHubRepositoryUtils";
import { Octokit } from "@octokit/rest";

const owner = "SebastianKuesters";
const repo = "test-repo-1711053208918";

describe("GitHubRepositoryUtils", () => {
  const octokit = new Octokit({
    auth: env.GITHUB_TOKEN,
  });
  const gitHubRepositoryUtils = new GitHubRepositoryUtils(owner, repo, octokit);

  describe("getCommitsBetweenTags", () => {
    it("should return commits between tags", async () => {
      // Arrange
      const startTag = "v0.1.0";
      const endTag = "v0.3.0";

      // Act
      const commits = await gitHubRepositoryUtils.getCommitsBetweenTags(
        startTag,
        endTag
      );

      // Assert
      expect(commits).toBeDefined();
      expect(commits.length).toBeGreaterThan(0);
    });

    it("should return commits between tags when start tag is not provided", async () => {
      // Arrange
      const startTag = "";
      const endTag = "v0.3.0";

      // Act
      const commits = await gitHubRepositoryUtils.getCommitsBetweenTags(
        startTag,
        endTag
      );

      // Assert
      expect(commits).toBeDefined();
      expect(commits.length).toBeGreaterThan(0);
    });
  });

  describe("getReferencedIssuesBetweenTags", () => {
    it("should return referenced issues between tags", async () => {
      // Arrange
      const startTag = "v0.1.0";
      const endTag = "v0.3.0";

      // Act
      const issues = await gitHubRepositoryUtils.getReferencedIssuesBetweenTags(
        startTag,
        endTag
      );

      // Assert
      expect(issues).toBeDefined();
      expect(issues.length).toBeGreaterThan(0);
    });
  });

  describe("getIssuesAndPrsByNumbers", () => {
    it("should return issues by issue numbers", async () => {
      // Arrange
      const numbers = [11, 10];

      // Act
      const issuesAndPrs = await gitHubRepositoryUtils.getIssuesAndPrsByNumbers(
        numbers
      );

      // Assert
      expect(issuesAndPrs).toBeDefined();
      expect(issuesAndPrs.length).toBe(numbers.length);
    });

    it("should return empty array when no numbers are provided", async () => {
      // Arrange
      const numbers = [];

      // Act
      const issuesAndPrs = await gitHubRepositoryUtils.getIssuesAndPrsByNumbers(
        numbers
      );

      // Assert
      expect(issuesAndPrs).toBeDefined();
      expect(issuesAndPrs.length).toBe(0);
    });

    it("should return empty array when issue numbers are invalid", async () => {
      // Arrange
      const numbers = [0, -1];

      // Act
      const issuesAndPrs = await gitHubRepositoryUtils.getIssuesAndPrsByNumbers(
        numbers
      );

      // Assert
      expect(issuesAndPrs).toBeDefined();
      expect(issuesAndPrs.length).toBe(0);
    });
  });

  describe("getReferencedIssuesBetweenTags", () => {
    it("should return issues all issues referenced between the start and end tag", async () => {
      // Arrange
      const startTag = "v0.1.0";
      const endTag = "v0.3.0";

      // Act
      const issues = await gitHubRepositoryUtils.getReferencedIssuesBetweenTags(
        startTag,
        endTag
      );

      // Assert
      expect(issues).toBeDefined();
      expect(issues.length).toBeGreaterThan(0);
    });
  });

  describe("getReferencedIssuesFromPullRequest", () => {
    it("should return referenced issues from pull request", async () => {
      // Arrange
      const pullRequestNumber = 11;

      // Act
      const issues =
        await gitHubRepositoryUtils.getReferencedIssuesFromPullRequest(
          pullRequestNumber
        );

      // Assert
      expect(issues).toBeDefined();
      expect(issues.length).toBe(2);
    });

    it("should return empty array when pull request number is invalid", async () => {
      // Arrange
      const pullRequestNumber = 0;

      // Act
      const issues =
        await gitHubRepositoryUtils.getReferencedIssuesFromPullRequest(
          pullRequestNumber
        );

      // Assert
      expect(issues).toBeDefined();
      expect(issues.length).toBe(0);
    });

    it("should return empty array when pull request has no referenced issues", async () => {
      // Arrange
      const pullRequestNumber = 10;

      // Act
      const issues =
        await gitHubRepositoryUtils.getReferencedIssuesFromPullRequest(
          pullRequestNumber
        );

      // Assert
      expect(issues).toBeDefined();
      expect(issues.length).toBe(0);
    });
  });
});
