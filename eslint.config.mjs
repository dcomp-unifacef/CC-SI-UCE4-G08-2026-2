import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "prisma/migrations/**",
      "eslint.config.mjs",
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
