// Carrega a integração do ESLint com as regras e configurações recomendadas de TypeScript.
import tseslint from "typescript-eslint";

// Exporta a configuração usada pelo script npm run lint.
export default tseslint.config(
  {
    // Evita lintar saídas geradas, dependências, migrações e o próprio arquivo de configuração.
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
      // Permite any explícito e require em arquivos onde essas opções são necessárias.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      // Rejeita variáveis não utilizadas, aceitando argumentos/variáveis prefixados com _.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
