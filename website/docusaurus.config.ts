import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "slopit",
  tagline: "AI response detection for crowdsourced behavioral research",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "https://slopit.github.io",
  baseUrl: "/slopit/",

  organizationName: "slopit",
  projectName: "slopit",

  onBrokenLinks: "throw",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/slopit/slopit/tree/main/website/",
          routeBasePath: "docs/typescript",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: ["./plugins/tailwind-plugin.js"],

  themeConfig: {
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "slopit",
      logo: {
        alt: "slopit Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "TypeScript",
        },
        {
          href: "https://slopit.github.io/docs/python/",
          label: "Python",
          position: "left",
        },
        {
          href: "https://github.com/slopit/slopit",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "TypeScript",
          items: [
            {
              label: "Getting Started",
              to: "/docs/typescript/intro",
            },
            {
              label: "Installation",
              to: "/docs/typescript/installation",
            },
            {
              label: "Quick Start",
              to: "/docs/typescript/quickstart",
            },
          ],
        },
        {
          title: "API Reference",
          items: [
            {
              label: "@slopit/core",
              to: "/docs/typescript/api/core",
            },
            {
              label: "@slopit/behavioral",
              to: "/docs/typescript/api/behavioral",
            },
            {
              label: "Platform Adapters",
              to: "/docs/typescript/api#platform-adapters",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Python Docs",
              href: "https://slopit.github.io/docs/python/",
            },
            {
              label: "GitHub",
              href: "https://github.com/slopit/slopit",
            },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} Aaron Steven White. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "json", "typescript"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
