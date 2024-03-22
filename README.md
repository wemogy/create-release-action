# create-release-action

## Inputs

| Name                   | Required | Description                                 |
| ---------------------- | -------- | ------------------------------------------- |
| `github-token`         | `true`   | GitHub token                                |
| `release-version-tag`  | `true`   | Name of a tag. defaults to `github.ref`     |
| `release-title`        | `true`   | Title of the release                        |
| `pre-release`          | `false`  | Indicator of whether or not is a prerelease |
| `previous-version-tag` | `false`  | Name of the previous tag                    |
| `dry-run`              | `false`  | Indicator of whether or not is a dry run    |
