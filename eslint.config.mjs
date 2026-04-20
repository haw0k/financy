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
    rules: {
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