/**
 * Tailwind CSS v4 plugin for Docusaurus.
 * Adds PostCSS loader to process Tailwind directives.
 */
module.exports = function tailwindPlugin() {
  return {
    name: "tailwind-plugin",
    configurePostCss(postcssOptions) {
      postcssOptions.plugins.push(require("@tailwindcss/postcss"));
      return postcssOptions;
    },
  };
};
