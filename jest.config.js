module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["./tests/setup.ts"],
  globalTeardown: "./tests/teardown.ts",
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
};
