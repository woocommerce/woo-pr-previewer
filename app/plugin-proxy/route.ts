import { NextResponse as Response } from "next/server";
import { streamFromGitHubPR } from "./stream-from-github-pr";
import type { NextRequest } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

const validateRequest = (requestParams: URLSearchParams) => {
  if (
    requestParams.has("org") &&
    requestParams.has("repo") &&
    requestParams.has("pr") &&
    requestParams.has("workflow") &&
    requestParams.has("artifact")
  ) {
    const allowedInputs = [
      {
        org: "woocommerce",
        repo: "woocommerce",
        workflow: "Build Live Branch",
        artifact: "plugins",
      },
    ];
    for (const allowedInput of allowedInputs) {
      if (
        !(
          requestParams.get("org") === allowedInput.org &&
          requestParams.get("repo") === allowedInput.repo &&
          requestParams.get("workflow") === allowedInput.workflow &&
          requestParams.get("artifact") === allowedInput.artifact
        )
      ) {
        throw new Error("Invalid request");
      }
    }
  } else {
    throw new Error("Missing required parameters");
  }
};

export async function GET(request: NextRequest) {
  const requestParams: URLSearchParams = request.nextUrl.searchParams;

  try {
    validateRequest(requestParams);
    // Made it this far so let's attempt to get the artifact and return it in the response
    return await streamFromGitHubPR({
      organization: requestParams.get("org") || "",
      repo: requestParams.get("repo") || "",
      pr: requestParams.get("pr") || "",
      workflowName: requestParams.get("workflow") || "",
      artifactName: requestParams.get("artifact") || "",
    });
  } catch (error: any) {
    return new Response(error, { status: 400 });
  }
}

export async function HEAD(request: NextRequest) {
  const requestParams: URLSearchParams = request.nextUrl.searchParams;
  try {
    validateRequest(requestParams);
    // Made it this far so let's attempt to get the artifact and return it in the response
    return await streamFromGitHubPR({
      organization: requestParams.get("org") || "",
      repo: requestParams.get("repo") || "",
      pr: requestParams.get("pr") || "",
      workflowName: requestParams.get("workflow") || "",
      artifactName: requestParams.get("artifact") || "",
      requestType: "HEAD",
    });
  } catch (error: any) {
    return new Response(error, { status: 400 });
  }
}
