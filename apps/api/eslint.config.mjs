// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', '**/*.spec.ts', '**/*.test.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // Type safety rules (warn instead of error for development)
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/require-await': 'warn',

      // NestJS-specific adjustments
      '@typescript-eslint/no-extraneous-class': 'off', // Allow empty module classes
      '@typescript-eslint/no-non-null-assertion': 'off', // Warn instead of error for non-null assertions
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',

      // Keep useful rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  {
    files: ['src/**/*.service.ts', 'src/**/*.controller.ts', 'src/**/*.dto.ts', 'src/**/*.task.ts'],
    ignores: ['src/prisma/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@prisma/client', '@/prisma', '@/prisma/*', '**/prisma', '**/prisma/*'],
              message: 'Application and HTTP layers must use repository/query ports, never Prisma.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "Identifier[name='PrismaService']",
          message: 'PrismaService is restricted to persistence infrastructure.',
        },
        {
          selector: "CallExpression[callee.property.name='$transaction']",
          message: 'Application transactions must use UnitOfWork.',
        },
        {
          selector: "CallExpression[callee.property.name='$queryRaw']",
          message: 'Raw SQL must live in a query repository.',
        },
      ],
    },
  },
);
