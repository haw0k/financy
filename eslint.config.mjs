import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { includeIgnoreFile } from '@eslint/compat'
import prettierConfig from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const eslintConfig = defineConfig([
  includeIgnoreFile(path.resolve(__dirname, '.gitignore')),
  ...nextVitals,
  ...nextTs,
  prettierConfig,

  {
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    rules: {
      // import order
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'unknown',
            'type',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: 'react-**', group: 'external', position: 'before' },
            { pattern: '@/lib/shadcn', group: 'internal', position: 'after' },
            { pattern: '@/components/**', group: 'internal', position: 'after' },
            { pattern: '@/hooks/**', group: 'internal', position: 'after' },
            { pattern: '@/lib/**', group: 'internal', position: 'after' },
            { pattern: '@hookform/**', group: 'type', position: 'after' },
            { pattern: 'recharts', group: 'external', position: 'after' },
            { pattern: 'next/**', group: 'external', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'external', 'type'],
          distinctGroup: false,
          warnOnUnassignedImports: false,
          'newlines-between': 'ignore',
        },
      ],
      // Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        // Interfaces must start with 'I' followed by PascalCase
        {
          selector: 'interface',
          format: [ 'PascalCase' ],
          custom: {
            regex: '^I[A-Z]',
            match: true,
          },
        },
        // Type aliases must start with 'T' followed by PascalCase
        {
          selector: 'typeAlias',
          format: [ 'PascalCase' ],
          custom: {
            regex: '^T[A-Z]',
            match: true,
          },
        },
        // Enums must start with 'E' followed by PascalCase (singular form)
        {
          selector: 'enum',
          format: [ 'PascalCase' ],
          custom: {
            regex: '^E[A-Z]',
            match: true,
          },
        },
        // Enum members should be UPPER_CASE
        {
          selector: 'enumMember',
          format: [ 'UPPER_CASE', 'PascalCase' ],
        },
        // React Components (functions returning JSX) - PascalCase
        {
          selector: 'function',
          format: [ 'PascalCase', 'camelCase' ],
        },
        // Variables - camelCase
        {
          selector: 'variable',
          format: [ 'camelCase', 'UPPER_CASE', 'PascalCase' ],
          leadingUnderscore: 'allow',
        },
        // Boolean variables must start with 'is' prefix only
        {
          selector: 'variable',
          types: [ 'boolean' ],
          format: [ 'PascalCase' ],
          prefix: [ 'is' ],
        },
        // Boolean properties (in interfaces/types) must start with 'is' prefix only
        {
          selector: 'typeProperty',
          types: [ 'boolean' ],
          format: [ 'PascalCase' ],
          prefix: [ 'is' ],
        },
        // Function parameters - camelCase, allow leading underscore for unused
        // PascalCase allowed for component parameters (e.g. icon: IconComponent)
        {
          selector: 'parameter',
          format: [ 'camelCase', 'PascalCase' ],
          leadingUnderscore: 'allow',
        },
        // Allow snake_case for API response fields in destructuring (e.g. short_description, image_url)
        {
          selector: 'parameter',
          format: null,
          filter: {
            regex: '^[a-z][a-z0-9]*_',
            match: true,
          },
        },
        // Functions starting with 'handle' - internal handlers
        {
          selector: 'function',
          format: [ 'camelCase' ],
          custom: {
            regex: '^handle[A-Z]',
            match: false,
          },
        },
        // Properties - camelCase (includes 'on' prefixed external handlers)
        {
          selector: 'property',
          format: [ 'camelCase', 'UPPER_CASE' ],
        },
        // Custom hooks must start with 'use'
        {
          selector: 'function',
          format: [ 'camelCase' ],
          custom: {
            regex: '^use[A-Z]',
            match: false,
          },
        },
        // Allow any format for object literal properties (for CSS selectors, MUI sx props, etc.)
        {
          selector: 'property',
          format: null,
          filter: {
            regex: '^(&|:|\\.|@|Webkit|Moz|Ms|O|[a-z][a-z0-9]*[-_])',
            match: true,
          },
        },
      ],
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/out/**', '**/build/**'],
    rules: {
      'import/order': 'off',
    },
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'node_modules/**',
    '.turbo/**',
    'dist/**',
  ]),

])

export default eslintConfig