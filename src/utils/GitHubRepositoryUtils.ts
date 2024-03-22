import { Octokit } from "@octokit/rest";
import IssueOrPr from "../types/IssueOrPr";

export default class GitHubRepositoryUtils {
  public constructor(
    private readonly owner: string,
    private readonly repo: string,
    private readonly octokit: Octokit
  ) {}

  public async getReferencedIssuesBetweenTags(
    startTag: string,
    endTag: string,
    branch: string = "main"
  ) {
    // Get all issues and PRs between start and end tag
    const issuesAndPrs = await this.getReferencedIssuesAndPrsBetweenTags(
      startTag,
      endTag,
      branch
    );

    // Flatten issues and PRs
    const issues = await this.mapIssuesAndPrsToIssuesFlat(issuesAndPrs);

    return issues;
  }

  public async getReferencedIssuesAndPrsBetweenTags(
    startTag: string,
    endTag: string,
    branch: string = "main"
  ) {
    const commits = await this.getCommitsBetweenTags(startTag, endTag, branch);

    // Get all referenced issues and PRs from the commit messages
    const referencedIssuesAndPrs = commits
      .map((commit) => commit.commit.message.match(/#\d+/g))
      .flat()
      .filter((issue) => issue !== null)
      .map((issue) => parseInt(issue.replace("#", "")));

    // Remove duplicates
    const numbers = Array.from(new Set(referencedIssuesAndPrs));

    // Get all issues and PRs by issue numbers
    const issuesAndPrs = await this.getIssuesAndPrsByNumbers(numbers);

    return issuesAndPrs;
  }

  public async getIssuesAndPrsByNumbers(
    numbers: number[]
  ): Promise<IssueOrPr[]> {
    // get all issues by issue numbers, ignore when issue is not found
    const issuesAndPrs = await Promise.all(
      numbers.map(async (number) => {
        try {
          return await this.octokit.issues.get({
            owner: this.owner,
            repo: this.repo,
            issue_number: number,
          });
        } catch {
          return null;
        }
      })
    );

    return issuesAndPrs
      .filter((item) => item !== null)
      .map((item) => item.data);
  }

  private async mapIssuesAndPrsToIssuesFlat(issuesAndPrs: IssueOrPr[]) {
    const result: IssueOrPr[] = [];

    for (const issueOrPr of issuesAndPrs) {
      if (issueOrPr.pull_request) {
        const issueNumbersOfPr = await this.getReferencedIssuesFromPullRequest(
          issueOrPr.number
        );

        const issues = await this.getIssuesAndPrsByNumbers(issueNumbersOfPr);

        result.push(...issues);
      } else {
        result.push(issueOrPr);
      }
    }

    return result;
  }

  /**
   * Returns the issues referenced in the Development section of the pull request
   * @param pullRequestNumber The pull request number
   */
  public async getReferencedIssuesFromPullRequest(
    pullRequestNumber: number
  ): Promise<number[]> {
    try {
      const pr11t: any = await this.octokit.graphql(
        `
      {
        repository(owner: "${this.owner}", name: "${this.repo}") {
          pullRequest(number: ${pullRequestNumber}) {
            title,
            closingIssuesReferences(first:100, userLinkedOnly:false) {
              totalCount
              nodes { 
                id,
                number
              }
              edges {
                node {
                  id
                  number
                }
              }
            }
          }
        }
      }`
      );

      const issueNumbers: number[] =
        pr11t.repository.pullRequest.closingIssuesReferences.nodes.map(
          (node) => node.number
        );

      return issueNumbers;
    } catch {
      return [];
    }
  }

  public async getCommitsBetweenTags(
    startTag: string,
    endTag: string,
    branch: string = "main"
  ) {
    // destructuring
    const { owner, repo, octokit } = this;

    // Get the commit corresponding to the start tag
    const startCommit = startTag
      ? (
          await octokit.repos.getCommit({
            owner,
            repo,
            ref: startTag,
          })
        ).data
      : (
          await octokit.repos.listCommits({
            owner,
            repo,
            branch,
          })
        ).data.pop();

    // Get all commits between the two SHAs
    const compareCommitsWithBaseheadResponse =
      await octokit.repos.compareCommitsWithBasehead({
        owner,
        repo,
        basehead: `${startCommit.sha}...${endTag}`,
      });

    // Prepend the commit corresponding to the start tag
    compareCommitsWithBaseheadResponse.data.commits.unshift(startCommit);

    return compareCommitsWithBaseheadResponse.data.commits;
  }

  public async createRelease(
    tagName: string,
    releaseName: string,
    body: string,
    prerelease: boolean
  ) {
    await this.octokit.repos.createRelease({
      owner: this.owner,
      repo: this.repo,
      tag_name: tagName,
      name: releaseName,
      body,
      prerelease,
    });
  }
}
