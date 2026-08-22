import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // These surfaces intentionally need direct image elements. The two logo
    // workbenches inspect original asset pixels, while affiliation/Discord
    // logos swap prewarmed theme-specific URLs without the Next image proxy.
    files: [
      "app/logo-cropper/page.tsx",
      "app/logo-sizing/page.tsx",
      "components/AffiliationsGrid.tsx",
      "components/discord/DiscordMemberSidebar.tsx",
    ],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
