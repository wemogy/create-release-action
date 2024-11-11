# create-release-action

## Inputs

| Name                         | Required | Description                                                    |
| ---------------------------- | -------- | -------------------------------------------------------------- |
| `github-token`               | `true`   | GitHub token                                                   |
| `release-version-tag`        | `true`   | Name of a tag. defaults to `github.ref`                        |
| `release-title`              | `true`   | Title of the release                                           |
| `pre-release`                | `false`  | Indicator of whether or not is a prerelease                    |
| `previous-version-tag`       | `false`  | Name of the previous tag                                       |
| `dry-run`                    | `false`  | Indicator of whether or not is a dry run                       |
| `label-issues-with`          | `false`  | Label to be added to issues (e.g. `released-dev`)              |
| `project-number`             | `false`  | Number of the project to upsert issues                         |
| `project-status-column-name` | `false`  | Name of the status column to upsert issues (e.g `In Progress`) |

## Required permissions

- **Repository**: `Contents`: `Read`
- **Repository**: `Issues`: `Read & write`
- **Organization**: `Projects`: `Read & write`

## Development

### Prerequisites

- Duplicate `env/env.template.json` to `env/env.json` and fill in the values. Use a personal access token with the `repo` scope.
