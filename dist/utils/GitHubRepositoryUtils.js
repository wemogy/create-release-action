"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class GitHubRepositoryUtils {
    constructor(owner, repo, octokit) {
        this.owner = owner;
        this.repo = repo;
        this.octokit = octokit;
    }
    getReferencedIssuesBetweenTags(startTag, endTag) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get all issues and PRs between start and end tag
            const issuesAndPrs = yield this.getReferencedIssuesAndPrsBetweenTags(startTag, endTag);
            // Flatten issues and PRs
            const issues = yield this.mapIssuesAndPrsToIssuesFlat(issuesAndPrs);
            return issues;
        });
    }
    getReferencedIssuesAndPrsBetweenTags(startTag, endTag) {
        return __awaiter(this, void 0, void 0, function* () {
            const commits = yield this.getCommitsBetweenTags(startTag, endTag);
            // Get all referenced issues and PRs from the commit messages
            const referencedIssuesAndPrs = commits
                .map((commit) => commit.commit.message.match(/#\d+/g))
                .flat()
                .map((issue) => parseInt(issue.replace("#", "")));
            // Remove duplicates
            const numbers = Array.from(new Set(referencedIssuesAndPrs));
            // Get all issues and PRs by issue numbers
            const issuesAndPrs = yield this.getIssuesAndPrsByNumbers(numbers);
            return issuesAndPrs;
        });
    }
    getIssuesAndPrsByNumbers(numbers) {
        return __awaiter(this, void 0, void 0, function* () {
            // get all issues by issue numbers, ignore when issue is not found
            const issuesAndPrs = yield Promise.all(numbers.map((number) => __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield this.octokit.issues.get({
                        owner: this.owner,
                        repo: this.repo,
                        issue_number: number,
                    });
                }
                catch (_a) {
                    return null;
                }
            })));
            return issuesAndPrs
                .filter((item) => item !== null)
                .map((item) => item.data);
        });
    }
    mapIssuesAndPrsToIssuesFlat(issuesAndPrs) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            for (const issueOrPr of issuesAndPrs) {
                if (issueOrPr.pull_request) {
                    const issueNumbersOfPr = yield this.getReferencedIssuesFromPullRequest(issueOrPr.number);
                    const issues = yield this.getIssuesAndPrsByNumbers(issueNumbersOfPr);
                    result.push(...issues);
                }
                else {
                    result.push(issueOrPr);
                }
            }
            return result;
        });
    }
    /**
     * Returns the issues referenced in the Development section of the pull request
     * @param pullRequestNumber The pull request number
     */
    getReferencedIssuesFromPullRequest(pullRequestNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pr11t = yield this.octokit.graphql(`
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
      }`);
                const issueNumbers = pr11t.repository.pullRequest.closingIssuesReferences.nodes.map((node) => node.number);
                return issueNumbers;
            }
            catch (_a) {
                return [];
            }
        });
    }
    getCommitsBetweenTags(startTag, endTag) {
        return __awaiter(this, void 0, void 0, function* () {
            // destructuring
            const { owner, repo, octokit } = this;
            // Get the commit corresponding to the start tag
            const startCommit = startTag
                ? (yield octokit.repos.getCommit({
                    owner,
                    repo,
                    ref: startTag,
                })).data
                : (yield octokit.repos.listCommits({
                    owner,
                    repo,
                    branch: "main",
                })).data.pop();
            // Get all commits between the two SHAs
            const compareCommitsWithBaseheadResponse = yield octokit.repos.compareCommitsWithBasehead({
                owner,
                repo,
                basehead: `${startCommit.sha}...${endTag}`,
            });
            // Prepend the commit corresponding to the start tag
            compareCommitsWithBaseheadResponse.data.commits.unshift(startCommit);
            return compareCommitsWithBaseheadResponse.data.commits;
        });
    }
    createRelease(tagName, releaseName, body, prerelease) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.octokit.repos.createRelease({
                owner: this.owner,
                repo: this.repo,
                tag_name: tagName,
                name: releaseName,
                body,
                prerelease,
            });
        });
    }
}
exports.default = GitHubRepositoryUtils;
//# sourceMappingURL=GitHubRepositoryUtils.js.map