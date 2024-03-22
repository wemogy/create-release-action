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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ReleaseNotesGenerator_1 = __importDefault(require("./ReleaseNotesGenerator"));
const GitHubRepositoryUtils_1 = __importDefault(require("./utils/GitHubRepositoryUtils"));
const github = require("@actions/github");
const core = require("@actions/core");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the action inputs
        const token = core.getInput("github-token", { required: true });
        const releaseVersionTag = core.getInput("release-version-tag", {
            required: true,
        });
        const releaseTitle = core.getInput("release-title", { required: true });
        const previousReleaseVersionTag = core.getInput("previous-release-version-tag", { required: false });
        const preRelease = core.getInput("pre-release", { required: false }) === "true";
        const dryRun = core.getInput("dry-run", { required: false }) === "true";
        // Get context information
        const { owner, repo } = github.context.repo;
        // construct services
        const octokit = github.getOctokit(token);
        const gitHubRepositoryUtils = new GitHubRepositoryUtils_1.default(owner, repo, octokit);
        const releaseNotesGenerator = new ReleaseNotesGenerator_1.default();
        // Get the referenced issues between the previous release and the current release
        const issues = yield gitHubRepositoryUtils.getReferencedIssuesBetweenTags(previousReleaseVersionTag, releaseVersionTag);
        // Create the release notes
        const releaseNotes = releaseNotesGenerator.generateReleaseNotes(issues);
        // Create the release
        if (dryRun) {
            core.info(`Dry run: Would have created release with the following notes:\n${releaseNotes}`);
            return;
        }
        yield gitHubRepositoryUtils.createRelease(releaseVersionTag, releaseTitle, releaseNotes, preRelease);
    });
}
run();
//# sourceMappingURL=index.js.map