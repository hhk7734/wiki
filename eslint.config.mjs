import eslintConfigPrettier from "eslint-config-prettier";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default [eslint.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier];

// {
// 	root: true,
// 	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
// 	parser: "@typescript-eslint/parser",
// 	plugins: ["@typescript-eslint"],
// 	parserOptions: {
// 		ecmaVersion: "latest",
// 		sourceType: "module",
// 	},
// 	env: {
// 		browser: true,
// 		es2017: true,
// 		node: true,
// 	},
// };
