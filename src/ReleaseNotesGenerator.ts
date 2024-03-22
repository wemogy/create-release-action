import IssueOrPr from "./types/IssueOrPr";

export default class ReleaseNotesGenerator {
  public generateReleaseNotes(issues: IssueOrPr[]) {
    const releaseNotes = issues.map((issue) => {
      const type = issue.pull_request ? "PR" : "Issue";
      return `* ${type} #${issue.number} - ${issue.title}`;
    });

    return releaseNotes.join("\n");
  }
}
