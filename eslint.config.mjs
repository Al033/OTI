import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Minimal flat config for ESLint v9 + TypeScript. The Next 16 +
 * eslint-config-next legacy-compat shim hits a circular-structure
 * JSON.stringify bug as of May 2026 (eslint v9.39 + eslint-config-next
 * v16.2). Until that's fixed upstream we skip the next preset and run
 * a thin style/safety pass — the heavy lifting is `pnpm typecheck`.
 */

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        Request: "readonly",
        Response: "readonly",
        Headers: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        AbortController: "readonly",
        AbortSignal: "readonly",
        ReadableStream: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
        Blob: "readonly",
        FormData: "readonly",
        FileReader: "readonly",
        crypto: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        process: "readonly",
        Buffer: "readonly",
        console: "readonly",
        global: "readonly",
        React: "readonly",
        JSX: "readonly",
      },
    },
    rules: {
      "no-undef": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // OTI uses occasional `as unknown as T` casts at narrow type
      // boundaries (events.ts widens, brief.tsx accepts narrow); keep
      // explicit-any/non-null off so they don't fight legitimate code.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-redeclare": "off",
      // The prompt-injection sanitiser deliberately matches Unicode
      // bidi/format/zero-width control characters; allow them in
      // string literals.
      "no-irregular-whitespace": ["error", { skipStrings: true, skipRegExps: true }],
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "dist/**",
      "data/embeddings.json",
      "data/asset-moves.json",
      "data/regime-centroids.json",
      "data/conformal-quantiles.json",
      "schema/**",
      "drizzle/**",
      "next-env.d.ts",
    ],
  },
];
