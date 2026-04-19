import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { includeIgnoreFile } from '@eslint/compat'
import prettierConfig from 'eslint-config-prettier'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const eslintConfig = defineConfig([
  includeIgnoreFile(path.resolve(__dirname, '.gitignore')),
  ...nextVitals,
  ...nextTs,
  prettierConfig,

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