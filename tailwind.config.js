/** @type {import('tailwindcss').Config} */

const plugin = require("tailwindcss/plugin");

module.exports = {
  important: true,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        ".btn": {
          padding: ".25rem .5rem",
          borderRadius: ".25rem",
          fontWeight: "600",
          backgroundColor: "var(--themeColor)",
          color: "var(--reverColor)",
          border: "1px solid var(--themeColor)",
          boxShadow: "1px 0px 1px 1px var(--themeColor_2)",
          cursor: "pointer",
          fontSize: ".8rem",
          lineHeight: "1.4rem",
          display: "flex",
          "&:hover": {
            backgroundColor: "var(--hoverColor)",
            color: "var(--reverColor)",
          },
        },
        ".drag": {
          "-webkit-app-region": "drag",
        },
        ".no-drag": {
          "-webkit-app-region": "no-drag",
        },
      });
    }),
  ],
};
