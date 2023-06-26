import { PrSelector } from "../components/pr-selector";

const Page = () => {
  return (
    <PrSelector
      organization="woocommerce"
      repo="woocommerce"
      workflowName="Build Live Branch"
      artifactName="plugins"
    />
  );
};

export default Page;
