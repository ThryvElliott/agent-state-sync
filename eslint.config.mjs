import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const baseGlobals = {
  Buffer: 'readonly',
  process: 'readonly',
};

const testGlobals = {
  ...baseGlobals,
  afterEach: 'readonly',
  beforeEach: 'readonly',
  describe: 'readonly',
  expect: 'readonly',
  it: 'readonly',
};

export default tseslint.config(
  {
    ignores: ['coverage/**', 'dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'vitest.config.ts'],
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      globals: baseGlobals,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.test.ts'],
    languageOptions: {
      globals: testGlobals,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslintConfigPrettier,
);
