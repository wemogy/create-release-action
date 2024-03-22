"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReleaseNotesGenerator {
    generateReleaseNotes(issues) {
        const releaseNotes = issues.map((issue) => {
            const type = issue.pull_request ? "PR" : "Issue";
            return `* ${type} #${issue.number} - ${issue.title}`;
        });
        return releaseNotes.join("\n");
    }
}
exports.default = ReleaseNotesGenerator;
//# sourceMappingURL=ReleaseNotesGenerator.js.map