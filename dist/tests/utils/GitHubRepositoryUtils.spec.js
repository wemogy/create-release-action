"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
require("jest");
const env = __importStar(require("../../env/env.json"));
const GitHubRepositoryUtils_1 = __importDefault(require("../../src/utils/GitHubRepositoryUtils"));
const rest_1 = require("@octokit/rest");
const owner = "SebastianKuesters";
const repo = "test-repo-1711053208918";
describe("GitHubRepositoryUtils", () => {
    const octokit = new rest_1.Octokit({
        auth: env.GITHUB_TOKEN,
    });
    const gitHubRepositoryUtils = new GitHubRepositoryUtils_1.default(owner, repo, octokit);
    describe("getCommitsBetweenTags", () => {
        it("should return commits between tags", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const startTag = "v0.1.0";
            const endTag = "v0.3.0";
            // Act
            const commits = yield gitHubRepositoryUtils.getCommitsBetweenTags(startTag, endTag);
            // Assert
            expect(commits).toBeDefined();
            expect(commits.length).toBeGreaterThan(0);
        }));
        it("should return commits between tags when start tag is not provided", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const startTag = "";
            const endTag = "v0.3.0";
            // Act
            const commits = yield gitHubRepositoryUtils.getCommitsBetweenTags(startTag, endTag);
            // Assert
            expect(commits).toBeDefined();
            expect(commits.length).toBeGreaterThan(0);
        }));
    });
    describe("getReferencedIssuesBetweenTags", () => {
        it("should return referenced issues between tags", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const startTag = "v0.1.0";
            const endTag = "v0.3.0";
            // Act
            const issues = yield gitHubRepositoryUtils.getReferencedIssuesBetweenTags(startTag, endTag);
            // Assert
            expect(issues).toBeDefined();
            expect(issues.length).toBeGreaterThan(0);
        }));
    });
    describe("getIssuesAndPrsByNumbers", () => {
        it("should return issues by issue numbers", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const numbers = [11, 10];
            // Act
            const issuesAndPrs = yield gitHubRepositoryUtils.getIssuesAndPrsByNumbers(numbers);
            // Assert
            expect(issuesAndPrs).toBeDefined();
            expect(issuesAndPrs.length).toBe(numbers.length);
        }));
        it("should return empty array when no numbers are provided", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const numbers = [];
            // Act
            const issuesAndPrs = yield gitHubRepositoryUtils.getIssuesAndPrsByNumbers(numbers);
            // Assert
            expect(issuesAndPrs).toBeDefined();
            expect(issuesAndPrs.length).toBe(0);
        }));
        it("should return empty array when issue numbers are invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const numbers = [0, -1];
            // Act
            const issuesAndPrs = yield gitHubRepositoryUtils.getIssuesAndPrsByNumbers(numbers);
            // Assert
            expect(issuesAndPrs).toBeDefined();
            expect(issuesAndPrs.length).toBe(0);
        }));
    });
    describe("getReferencedIssuesBetweenTags", () => {
        it("should return issues all issues referenced between the start and end tag", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const startTag = "v0.1.0";
            const endTag = "v0.3.0";
            // Act
            const issues = yield gitHubRepositoryUtils.getReferencedIssuesBetweenTags(startTag, endTag);
            // Assert
            expect(issues).toBeDefined();
            expect(issues.length).toBeGreaterThan(0);
        }));
    });
    describe("getReferencedIssuesFromPullRequest", () => {
        it("should return referenced issues from pull request", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const pullRequestNumber = 11;
            // Act
            const issues = yield gitHubRepositoryUtils.getReferencedIssuesFromPullRequest(pullRequestNumber);
            // Assert
            expect(issues).toBeDefined();
            expect(issues.length).toBe(2);
        }));
        it("should return empty array when pull request number is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const pullRequestNumber = 0;
            // Act
            const issues = yield gitHubRepositoryUtils.getReferencedIssuesFromPullRequest(pullRequestNumber);
            // Assert
            expect(issues).toBeDefined();
            expect(issues.length).toBe(0);
        }));
        it("should return empty array when pull request has no referenced issues", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const pullRequestNumber = 10;
            // Act
            const issues = yield gitHubRepositoryUtils.getReferencedIssuesFromPullRequest(pullRequestNumber);
            // Assert
            expect(issues).toBeDefined();
            expect(issues.length).toBe(0);
        }));
    });
});
//# sourceMappingURL=GitHubRepositoryUtils.spec.js.map