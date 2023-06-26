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

const gitHubRequest = async (
  url: string,
  asJson = true,
  isArtifactRequest = false
) => {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
    Authorization: `Bearer  ${GITHUB_TOKEN}`,
  };
  const res = await fetch(url, { headers });
  if (!res.ok) {
    if (isArtifactRequest && res.status === 410) {
      throw new Error("Artifact has expired");
    } else {
      throw new Error("GitHub API request failed");
    }
  }
  const body = asJson ? await res.json() : res;
  return {
    body,
    headers: res.headers,
  };
};

export const streamFromGitHubPR = async ({
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
    `https://api.github.com/repos/${organization}/${repo}/actions/runs?branch=${prDetails.head.ref}`
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
  const { body: artifactZip, headers: artifactHeaders } = await gitHubRequest(
    zipUrl,
    false,
    true
  );

  artifactHeaders.forEach((value, key) => {
    if (allowedHeaders.includes(key)) {
      headers[key] = value;
    }
  });
  return new Response(artifactZip.body, { headers });
};
