import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default defineConfig([
  js.configs.recommended,
  tseslint.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: [
      '.next/**',
      '.env',
      'node_modules',
      'public/**',
      'next.config.js',
      'postcss.config.js',
    ],
  },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: { globals: globals.browser },
  },
  {
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'off',
      'import/no-anonymous-default-export': 'off',
    },
  },
])
