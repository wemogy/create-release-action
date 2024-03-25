import { Octokit } from "@octokit/rest";
import ProjectNodeIdResponse from "../types/ProjectNodeIdResponse";
import ProjectFieldsResponse from "../types/ProjectFieldsResponse";
import ProjectUpdateFieldItemResponse from "../types/ProjectUpdateFieldItemResponse";
import ProjectAddItemResponse from "../types/ProjectAddItemResponse";

/**
 * Implementation based on these projects:
 * - https://github.com/titoportas/update-project-fields
 * - https://github.com/actions/add-to-project
 */
export default class GitHubProjectsUtils {
  public constructor(
    private readonly owner: string,
    private readonly repo: string,
    private readonly octokit: Octokit
  ) {}

  public async getProjectId(projectNumber: number) {
    // Destructuring
    const { owner, repo, octokit } = this;

    // Determine the type of owner to query
    const repository = await octokit.repos.get({
      owner,
      repo,
    });
    const ownerType = repository.data.owner.type.toLowerCase();

    // First, use the GraphQL API to request the project's node ID.
    const idResp = await octokit.graphql<ProjectNodeIdResponse>(
      `query getProject($projectOwnerName: String!, $projectNumber: Int!) {
        ${ownerType}(login: $projectOwnerName) {
          projectV2(number: $projectNumber) {
            id
          }
        }
    }`,
      {
        projectOwnerName: owner,
        projectNumber,
      }
    );

    return idResp[ownerType].projectV2.id;
  }

  public async updateProjectField(
    projectNumber: number,
    issueNumber: number,
    fieldId: string,
    value: string
  ) {
    // Destructuring
    const { octokit } = this;

    // Get the project ID
    const projectId = await this.getProjectId(projectNumber);
    const issue = await this.octokit.issues.get({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
    });

    // Add issue to project
    const addResp = await octokit.graphql<ProjectAddItemResponse>(
      `mutation addIssueToProject($input: AddProjectV2ItemByIdInput!) {
        addProjectV2ItemById(input: $input) {
          item {
            id
          }
        }
      }`,
      {
        input: {
          projectId,
          contentId: issue.data.node_id,
        },
      }
    );

    // Use the GraphQL API to request the project's columns.
    const projectFields: ProjectFieldsResponse =
      await octokit.graphql<ProjectFieldsResponse>(
        `query getProjectFields($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            fields(first: 100) {
              nodes {
                ... on ProjectV2Field {
                  id
                  dataType
                  name
                }
                ... on ProjectV2IterationField {
                  id
                  name
                  dataType
                  configuration {
                    iterations {
                      startDate
                      id
                    }
                  }
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  dataType
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }`,
        {
          projectId,
        }
      );

    const field = projectFields.node.fields.nodes.find(
      (node) => fieldId === node.name
    );

    if (!field) {
      throw new Error(`Field with ID ${fieldId} not found`);
    }

    if (field.options) {
      let option;
      if (value.startsWith("[") && value.endsWith("]")) {
        const index = parseInt(value.slice(1, -1));
        if (!isNaN(index)) {
          option = field.options[index];
        }
      } else {
        option = field.options.find(
          (o) => o.name.toLowerCase() === value.toLowerCase()
        );
      }
      if (option) {
        value = option.id;
      }
    }

    const updateFieldKey = this.getUpdateFieldValueKey(field.dataType);

    const updatedItem: ProjectUpdateFieldItemResponse =
      await octokit.graphql<ProjectUpdateFieldItemResponse>(
        `mutation updateProjectV2ItemFieldValue($input: UpdateProjectV2ItemFieldValueInput!) {
        updateProjectV2ItemFieldValue(input: $input) {
          projectV2Item {
            id
          }
        }
      }`,
        {
          input: {
            projectId,
            itemId: addResp.addProjectV2ItemById.item.id,
            fieldId: field.id,
            value: {
              [updateFieldKey]: value,
            },
          },
        }
      );

    return updatedItem;
  }

  private getUpdateFieldValueKey(
    fieldDataType: string
  ): "text" | "number" | "date" | "singleSelectOptionId" | "iterationId" {
    if (fieldDataType === "TEXT") {
      return "text";
    } else if (fieldDataType === "NUMBER") {
      return "number";
    } else if (fieldDataType === "DATE") {
      return "date";
    } else if (fieldDataType === "ITERATION") {
      return "iterationId";
    } else if (fieldDataType === "SINGLE_SELECT") {
      return "singleSelectOptionId";
    } else {
      throw new Error(
        `Unsupported dataType: ${fieldDataType}. Must be one of 'text', 'number', 'date', 'singleSelectOptionId', 'iterationId'`
      );
    }
  }
}
