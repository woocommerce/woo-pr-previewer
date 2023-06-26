import { PrForm } from "./client/pr-form";

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
        />
      </div>
    </main>
  );
};
