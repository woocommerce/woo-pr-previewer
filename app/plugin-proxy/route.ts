import { NextResponse as Response } from "next/server";
import type { NextRequest } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

interface GitHubPrArgs {
  organization: string;
  repo: string;
  pr: string;
  workflowName: string;
  artifactName: string;
  requestType?: "GET" | "HEAD";
}

if (!GITHUB_TOKEN) {
  throw new Error(
    "GITHUB_TOKEN is required. Make sure it is set as an environment variable in the app."
  );
}

const gitHubRequest = async (url: string) => {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
    Authorization: `Bearer  ${GITHUB_TOKEN}`,
  };
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error("GitHub API request failed");
  }
  const body = await res.json();
  return {
    body,
    headers: res.headers,
  };
};

const streamFromGitHubPR = async ({
  organization,
  repo,
  pr,
  workflowName,
  artifactName,
  requestType = "GET",
}: GitHubPrArgs) => {
  const { body: prDetails } = await gitHubRequest(
    `https://api.github.com/repos/${organization}/${repo}/pulls/${pr}`
  );
  if (!prDetails?.head?.ref) {
    throw new Error("Invalid PR Number");
  }
  const { body: ciRuns } = await gitHubRequest(
    `https://api.github.com/repos/${organization}/${repo}/actions/runs?branch=${branchName}`
  );
  if (!ciRuns?.workflow_runs?.length) {
    throw new Error("No CI runs found for this branch");
  }
  let zipUrl = "";
  for (const run of ciRuns.workflow_runs) {
    if (
      run.name === workflowName &&
      run.status === "completed" &&
      run.conclusion === "success"
    ) {
      const { body: artifacts } = await gitHubRequest(run.artifacts_url);
      if (!artifacts?.artifacts?.length) {
        throw new Error("No artifacts found for this workflow");
      }
      for (const artifact of artifacts.artifacts) {
        if (artifact.name === artifactName) {
          zipUrl = artifact.archive_download_url;
          break;
        }
      }
      if (zipUrl) {
        break;
      }
    }
  }
  if (!zipUrl) {
    throw new Error(
      "No artifacts found for this workflow. Check that the passed in artifact name is correct"
    );
  }
  if (requestType === "HEAD") {
    return new Response("", { status: 200 });
  }
  const allowedHeaders = [
    "content-length",
    "content-disposition",
    "x-frame-options",
    "last-modified",
    "etag",
    "date",
    "age",
    "vary",
    "cache-control",
  ];
  let headers: Record<string, string> = {};
  const { body: artifact } = await gitHubRequest(zipUrl);
  for (const header_line of artifact.headers) {
    const headerName = header_line
      .substring(0, header_line.indexOf(":"))
      .toLowerCase();
    if (allowedHeaders.includes(headerName)) {
      headers[headerName] = header_line;
    }
  }
  return new Response(artifact.body, { headers });
};

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
      console.log(allowedInput);
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
    return new Response("error", { status: 400 });
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
