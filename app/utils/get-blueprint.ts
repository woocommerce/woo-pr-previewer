/**
 * The final Zip file name can't be specified in the blueprint so we have to map
 * to the name the initial artifact unzips the file to.
 */
const zipNameMap = {
  woocommerce: "woocommerce-dev",
} as Record<string, string>;

export const getBlueprint = ({
  organization,
  repo,
  pr,
  workflowName,
  artifactName,
  host,
}: {
  organization: string;
  repo: string;
  pr: string;
  workflowName: string;
  artifactName: string;
  host: string;
}) => {
  const zipArtifactUrl = `${host}/plugin-proxy?org=${organization}&repo=${repo}&pr=${pr}&workflow=${encodeURIComponent(
    workflowName
  )}&artifact=${encodeURIComponent(artifactName)}`;
  const blueprint = {
    landingPage: "/wp-admin/",
    steps: [
      {
        step: "login",
        username: "admin",
        password: "password",
      },
      {
        step: "mkdir",
        path: "/wordpress/pr",
      },
      /*
       * This is the most important step.
       * It download the built plugin zip file exposed by GitHub CI.
       *
       * Because the zip file is not publicly accessible, the
       * plugin-proxy API endpoint is used to download it.
       * @see ../plugin-proxy/route.ts
       */
      {
        step: "writeFile",
        path: "/wordpress/pr/pr.zip",
        data: {
          resource: "url",
          url: zipArtifactUrl,
          caption: `Downloading PR ${pr}`,
        },
        progress: {
          weight: 2,
          caption: `Applying PR ${pr}`,
        },
      },
      /**
       * GitHub CI artifacts are doubly zipped:
       *
       * pr.zip
       *    artifact.zip
       *       artifact.php
       *       ... other files ...
       *
       * This step extracts the inner zip file so that we get
       * access directly to the actual plugin zip and can use it to
       * install the plugin.
       */
      {
        step: "unzip",
        zipPath: "/wordpress/pr/pr.zip",
        extractToPath: `/wordpress/pr`,
      },
      {
        step: "installPlugin",
        pluginZipFile: {
          resource: "vfs",
          path: `/wordpress/pr/${zipNameMap[repo]}.zip`,
        },
      },
    ],
  };
  return JSON.stringify(blueprint);
};
