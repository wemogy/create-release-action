import { Octokit } from "@octokit/rest";

type IssueOrPr = Awaited<ReturnType<Octokit["issues"]["get"]>>["data"];

export default IssueOrPr;
