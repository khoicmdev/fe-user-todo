module.exports = {
  env: {
    node: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:boundaries/recommended",
  ],
  plugins: ["@typescript-eslint", "boundaries"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  settings: {
    "boundaries/include": ["**/*"],
    "boundaries/elements": [
      {
        type: "app",
        pattern: ["apps/*"],
      },
      {
        type: "feature",
        pattern: ["packages/users", "packages/todos"],
      },
      {
        type: "shared",
        pattern: [
          "packages/shared",
          "packages/ui",
          "packages/eslint-config",
          "packages/typescript-config",
        ],
      },
    ],
  },
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
  },
  overrides: [
    {
      // Restrict cross-feature imports ONLY inside packages (features & libraries)
      files: ["packages/**/*", "**/packages/**/*"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@repo/todos", "@repo/todos/*"],
                message:
                  "Cross-feature import error: Feature packages cannot import directly from @repo/todos. Shared components must be placed in @repo/ui or @repo/shared.",
              },
              {
                group: ["@repo/users", "@repo/users/*"],
                message:
                  "Cross-feature import error: Feature packages cannot import directly from @repo/users. Shared components must be placed in @repo/ui or @repo/shared.",
              },
            ],
          },
        ],
      },
    },
  ],
};
