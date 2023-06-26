"use client";

import { useState } from "react";
import { getBlueprint } from "../../utils/get-blueprint";
import classnames from "classnames";

const PLAYGROUND_HOST = "https://playground.wordpress.net";

interface PrFormControlsCollection extends HTMLFormControlsCollection {
  "pr-number": HTMLInputElement;
}

interface PrFormElement extends HTMLFormElement {
  elements: PrFormControlsCollection;
}

interface PrSubmitResponse {
  success: boolean;
  message: string;
}

export const PrForm = ({
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
  const [isSubmitting, setIsSubmitting] = useState<Boolean>(false);
  const [submitResponse, setSubmitResponse] = useState<
    PrSubmitResponse | undefined
  >();
  const onSubmit = async (event: React.FormEvent) => {
    const host = window.location.origin;
    event.preventDefault();
    setIsSubmitting(true);
    event.persist;
    const { elements } = event.target as PrFormElement;
    const prNumber = elements["pr-number"].value;
    const zipURL = `${host}/plugin-proxy/?org=${organization}&repo=${repo}&pr=${prNumber}&workflow=${encodeURIComponent(
      workflowName
    )}&artifact=${encodeURIComponent(artifactName)}`;
    // Verify that the PR exists and that GitHub CI finished building it.
    const pr = await window.fetch(zipURL, { method: "HEAD" });
    if (pr.status !== 200) {
      setSubmitResponse({
        success: false,
        message: `PR #${pr} does not exist or is not built yet.`,
      });
      setIsSubmitting(false);
      return;
    } else {
      const blueprint = getBlueprint({
        organization,
        repo,
        pr: prNumber,
        artifactName,
        workflowName,
        host,
      });
      //redirect to the playground with the blueprint
      location.href = `${PLAYGROUND_HOST}/?mode=seamless#${encodeURI(
        blueprint
      )}`;
    }
  };
  const submittingClass = isSubmitting ? "opacity-50 cursor-not-allowed" : "";
  const className = classnames(
    "bg-woo-purple-80",
    "hover:bg-blue-30",
    "text-white",
    "font-bold",
    "py-2",
    "px-4",
    "rounded",
    "focus:outline-none",
    "focus:shadow-outline",
    { "opacity-50": isSubmitting, "cursor-not-allowed": isSubmitting }
  );
  return (
    <form
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      onSubmit={async (e) => await onSubmit(e)}
    >
      <h2 className="mb-5">WooCommerce PRs</h2>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="pr-number"
        >
          PR Number
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="pr-number"
          type="text"
          placeholder="12345"
        />
      </div>
      <div className="flex items-center justify-end">
        <button className={className} type="submit">
          Generate Preview
        </button>
      </div>
    </form>
  );
};
