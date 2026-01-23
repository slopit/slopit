import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    "intro",
    "installation",
    "quickstart",
    {
      type: "category",
      label: "Guides",
      items: [
        "guides/behavioral-capture",
        "guides/jspsych-integration",
        "guides/labjs-integration",
        "guides/psychojs-integration",
        "guides/gorilla-integration",
        "guides/jatos-integration",
        "guides/osweb-integration",
        "guides/pcibex-integration",
        "guides/vanilla-integration",
        "guides/custom-adapters",
      ],
    },
    {
      type: "category",
      label: "API Reference",
      items: [
        "api/index",
        "api/core",
        "api/behavioral",
        "api/adapter-shared",
        "api/adapter-jspsych",
        "api/adapter-labjs",
        "api/adapter-psychojs",
        "api/adapter-gorilla",
        "api/adapter-jatos",
        "api/adapter-osweb",
        "api/adapter-pcibex",
        "api/adapter-vanilla",
        "api/dashboard-ui",
      ],
    },
    {
      type: "category",
      label: "Examples",
      items: ["examples/basic-capture", "examples/jspsych-experiment"],
    },
  ],
};

export default sidebars;
