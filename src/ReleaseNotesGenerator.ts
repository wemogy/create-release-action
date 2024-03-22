import IssueOrPr from "./types/IssueOrPr";

export default class ReleaseNotesGenerator {
  public generateReleaseNotes(issues: IssueOrPr[]) {
    let releaseNotes = "## Release Notes\n\n";

    const enhancements = issues.filter((issue) =>
      issue.labels.includes("enhancement")
    );

    if (enhancements.length > 0) {
      releaseNotes += "### Enhancements 🎁\n\n";
      enhancements.forEach((issue) => {
        releaseNotes += `- ${issue.title} (#${issue.number})\n`;
      });
    }

    const bugs = issues.filter((issue) => issue.labels.includes("bug"));

    if (bugs.length > 0) {
      releaseNotes += "### Bug Fixes 🐞\n\n";
      bugs.forEach((issue) => {
        releaseNotes += `- ${issue.title} (#${issue.number})\n`;
      });
    }

    const others = issues.filter(
      (issue) =>
        !issue.labels.includes("enhancement") && !issue.labels.includes("bug")
    );

    if (others.length > 0) {
      releaseNotes += "### Others 📚\n\n";
      others.forEach((issue) => {
        releaseNotes += `- ${issue.title} (#${issue.number})\n`;
      });
    }

    if (enhancements.length === 0 && bugs.length === 0 && others.length === 0) {
      releaseNotes += "No enhancements or bug fixes in this release.";
    }

    return releaseNotes;
  }
}
