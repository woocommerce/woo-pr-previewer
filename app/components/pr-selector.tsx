import { PrForm } from "./client/pr-form";

const env = process.env;
const HOST =
  env.VERCEL && env.VERCEL_URL ? env.VERCEL_URL : "http://localhost:3000";

export const PrSelector = ({
  organization,
  repo,
  workflowName,
  artifactName,
}: {
  organization: string;
  repo: string;
  workflowName: string;
  artifactName: string;
}) => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-xs">
        <PrForm
          organization={organization}
          repo={repo}
          workflowName={workflowName}
          artifactName={artifactName}
          host={HOST}
        />
      </div>
    </main>
  );
};
